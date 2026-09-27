# LeadGen — How It Works & How to Demo It

A plain-language explainer of what this project does, how each AI/automation piece
actually works under the hood, and a script for showing it off live.

---

## 1. The big picture

LeadGen takes a lead (a potential customer) from "just submitted a form" all the way
to "assigned to the right salesperson with an AI-drafted reply ready to send" —
automatically, in seconds.

```
Lead comes in (website form / ad platform webhook)
        ↓
Duplicate check (have we seen this person before?)
        ↓
Lead saved to database
        ↓
ML model scores it (0–100, how likely to convert)
        ↓
Auto-assignment engine picks the best free sales rep
        ↓
Rep gets notified, opens the lead, clicks "AI Draft"
        ↓
Gemini writes a reply → rep reviews → rep approves & sends
        ↓
Weeks later: lead marked Converted/Lost → outcome logged for retraining the model
```

Every arrow above is a real, working piece of code — not a mockup. The sections below
explain each one: **what** it does, **how** it works, and **why** it was built that way.

---

## 2. Duplicate Detection

**What:** If the same person submits a lead twice (same email or phone), LeadGen
doesn't create a second record — it merges the new contact into the existing lead.

**How:** When a lead is created, the backend normalizes the submitted email
(lowercased, trimmed) and phone (digits only, last 10 kept) and searches existing
leads for a match. If found, it appends an "interaction" entry to that lead instead of
creating a new one, and logs it in the activity timeline as a "Duplicate Contact
Merged" event.

**Why:** Real customers contact companies more than once, through different channels.
Without this, the same person filling the form twice — or contacting via WhatsApp
after already emailing — would silently create two disconnected records, and two
salespeople might chase the same customer without knowing it.

**Where in the code:** `backend/src/services/leadDedupe.service.js`, called from
`lead.service.js:createLead`.

---

## 3. ML Lead Scoring — the "how likely is this lead to convert" number

This is the centerpiece: every lead gets a real, model-generated score, not a guess.

### 3.1 How the model was trained

There's no real historical sales data yet (the company is new), so a **synthetic
training set** was generated: 1,500 fake-but-realistic lead records, each with a
made-up outcome (converted or not), built from a formula that mimics how real leads
behave — e.g. leads with more interactions, a reply, complete contact info, and a
referral source are given a higher chance of "converting" when the data is generated.

Two models were trained on this data and compared:

| Model | Accuracy | ROC-AUC |
|---|---|---|
| Logistic Regression | 75.3% | **0.83** ✅ selected |
| Random Forest | 74.3% | 0.79 |

Logistic Regression won because it had the better ROC-AUC (a measure of how well the
model ranks "likely to convert" leads above "unlikely" ones — more relevant here than
raw accuracy, since the app cares about *scoring/ranking* leads, not just a yes/no
guess). The metrics are saved to `backend/ml-service/model/metrics.json`.

**Why synthetic data and not "no ML at all"?** A simple if/else rule system would work
too, but wouldn't be genuine machine learning — there'd be no model to train, no
metrics to evaluate, nothing to retrain later. Using synthetic data now, with a real
feedback loop to mix in real outcomes later (see section 6), means the project has an
actual trained classifier today and a clear path to a better one once real
conversions happen.

### 3.2 What features the model looks at

For every lead, these 8 values are extracted and fed to the model:

| Feature | What it means | Where it comes from |
|---|---|---|
| `source` | Website / WhatsApp / Meta Ads / Referral | The lead's source field |
| `interaction_count` | How many times contact has been logged | Lead's interaction history |
| `replied` | Did the customer ever reply? | Interaction log (channel = "reply") |
| `requirement_type` | Demo / Pricing / Support / General | Guessed from the notes text |
| `contact_complete` | Do we have both email and phone? | Lead record |
| `lead_freshness_days` | How many days old is this lead? | `createdAt` timestamp |
| `followup_count` | Is a follow-up scheduled? | Lead's `nextFollowUpDate` |
| `estimated_value` | Deal size in ₹ | Lead record |

**Why these specific features?** They're exactly the signals a human salesperson
would instinctively use to judge a lead: has this person engaged with us, do we have
a way to reach them, how big is the opportunity, how stale is it. They're also all
things the app already tracks, so no extra data entry is needed to get a score.

### 3.3 How a lead actually gets scored (step by step)

1. A lead is created (via form, webhook, or the admin/sales panel).
2. The backend fires a `LEAD_CREATED` event.
3. A listener grabs the lead's 8 features (above) and sends them to the ML service
   (a small Python program running separately, on port 8001).
4. The ML service loads the trained model and returns a probability, e.g. `0.62`.
5. That becomes a score out of 100 (`62`) and a priority band:
   - **0–39 → Low**
   - **40–69 → Medium**
   - **70–100 → High**
6. The score, priority, and which model version produced it are saved on the lead,
   and shown in the Leads table and lead details page.
7. **Re-scoring:** whenever a new interaction is logged (a note, a reply, an approved
   AI draft), the lead is scored again — so the number updates as the conversation
   progresses, not just once at creation.

**If the ML service is down:** lead creation still works normally; the score is just
left blank until scoring succeeds. Nothing breaks.

**Where in the code:** `backend/ml-service/` (the Python model + API),
`backend/src/services/mlScoring.service.js` (calls it from Node),
`backend/src/events/listeners/leadCreated.listener.js` (triggers it).

---

## 4. Automatic Assignment — "who should handle this lead"

**What:** A new, unassigned lead is automatically routed to a sales rep — no manager
has to manually pick one every time.

**How — the actual decision logic:**
1. Look at all active salespeople.
2. Count each rep's current *active* leads (status New/Contacted/Follow-up/Interested
   — i.e. still open, not Converted/Lost).
3. Remove any rep who's already at their capacity limit (`maxActiveLeads`, default 20).
4. If the lead has a category (e.g. "Enterprise") and any remaining rep is marked as
   a specialist in that category, narrow the list to just those specialists.
5. Assign to whoever's left with the **lowest current workload**.

**Why workload-based, and not round-robin or random?** Round-robin ignores the fact
that reps finish leads at different rates — one rep might have 3 old unclosed leads
while another has 15. Balancing by *current active load* keeps the team's work spread
evenly in a way that actually reflects who has capacity right now.

**Manual override still works:** a manager can always reassign a lead by hand from
the Assignments page — auto-assignment only fires for leads that come in with nobody
assigned yet.

**Where in the code:** `backend/src/services/leadAssignment.service.js`.

---

## 5. How data from other platforms comes in (ingestion)

**What:** LeadGen doesn't only accept leads typed in by an admin — it has two real
entry points for leads arriving from outside the app.

### 5.1 Public website form endpoint
`POST /api/v1/ingest/public` — no login required. This is what a real company website's
"Contact Us" / "Request a Demo" form would submit to. `frontend/public/demo-lead-form.html`
is a working example of exactly that.

### 5.2 Signed webhook endpoint (for ad platforms like Meta/Google Ads)
`POST /api/v1/ingest/webhook/:sourceCode` — built for platforms that push leads to you
automatically. Two protections:
- **Signature check:** the request must include a header proving it was sent by
  someone who knows a shared secret key (`LEAD_INGEST_WEBHOOK_SECRET`), so randoms on
  the internet can't post fake leads into your system.
- **Idempotency key:** every webhook call carries a unique ID. If the same ID is sent
  twice (platforms sometimes retry automatically), the second call is recognized as a
  repeat and does nothing — no duplicate lead is created.

### 5.3 Adapters — how a *specific* platform's data shape gets mapped in
Different platforms send data in different shapes. A Meta Lead Ads webhook looks
nothing like a generic form post. Rather than writing special-case code everywhere,
each platform gets one small "adapter" file that translates its shape into LeadGen's
common lead format (`name`, `phone`, `email`, `company`, `notes`).

- `backend/src/modules/ingestion/adapters/genericAdapter.js` — plain `{name, phone,
  email, message}` shape.
- `backend/src/modules/ingestion/adapters/metaAdsAdapter.js` — Meta's actual
  `field_data: [{name, values}]` shape.

**Why adapters?** Adding a new real platform later (Google Ads, LinkedIn, etc.) is
"write one new adapter file that knows that platform's payload shape" — the rest of
the pipeline (dedupe, scoring, assignment) is reused automatically, since every
adapter feeds into the exact same `createLead()` function everything else uses.

**Try it yourself:** `node backend/src/scripts/demoWebhookPing.js` simulates a Meta
webhook call. Run it twice with the same key to see the idempotency protection kick in.

---

## 6. AI Response Drafting

**What:** In the Sales panel, opening a lead shows an "AI Response Assistant" that can
write a personalized reply for the rep to send.

**How:** Clicking "Generate AI Draft" sends the lead's requirement/notes plus a short
list of *approved* company facts (product names, prices, policies — defined in
`backend/src/config/companyContext.js`) to Google's Gemini model. Gemini is explicitly
instructed to only use those approved facts and never invent prices, discounts, or
promises. The draft comes back into a text box the rep can edit, regenerate, or
approve.

**Why require human approval before sending?** An AI model can still get details
wrong or sound off — auto-sending customer-facing messages without a human checking
them first is risky for any real business. So the flow is strictly **AI drafts → rep
reviews/edits → rep clicks Approve** before anything is treated as sent. Approving it
logs it as a real interaction on the lead (which also feeds back into re-scoring).

**If Gemini isn't configured:** the button shows a clear message and the rep can just
write the reply manually — the rest of the app keeps working normally.

**Where in the code:** `backend/src/services/aiResponse.service.js`,
`frontend/src/modules/sales/pages/SalesLeadDrawer.jsx`.

---

## 7. The feedback loop — how the model gets smarter over time

**What:** Every time a lead is marked **Converted** or **Lost**, its features and the
real outcome are appended to `backend/ml-service/data/feedback_log.csv`.

**How to use it:** Run `python retrain.py` (inside `backend/ml-service`, with the venv
active) any time before a demo or report. It re-trains on the synthetic data *plus*
whatever real outcomes have accumulated, and saves a new model version — you can then
compare `metrics.json` before/after to show the model improving with real data.

**Why not retrain automatically on every single outcome?** Retraining on every event
is noisy and gives no real signal about whether the model is actually improving — it's
better practice to retrain deliberately and compare versions, which is also easier to
explain and screenshot for a report.

---

## 8. Running everything

Three things need to be running at once:

```bash
# Terminal 1 — Backend API (port 5000)
cd backend
npm run dev

# Terminal 2 — ML scoring service (port 8001)
cd backend/ml-service
venv\Scripts\activate
uvicorn app:app --port 8001

# Terminal 3 — Frontend (usually port 5174)
cd frontend
npm run dev
```

**One-time setup for the ML service** (only needed once, or if you delete `venv/`):
```bash
cd backend/ml-service
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python data/generate_synthetic_data.py
python train.py
```

### Login credentials (seeded demo accounts)
| Role | Email | Password |
|---|---|---|
| Admin | admin@appzeto.com | Admin@123 |
| Manager | priya.manager@appzeto.com | Manager@123 |
| Sales | amit.sharma@appzeto.com | Sales@123 |
| Sales | neha.verma@appzeto.com | Sales@123 |
| Sales | rahul.mehta@appzeto.com | Sales@123 |

To reset/reseed demo data at any time: `cd backend && npm run seed`

### To enable real AI drafts (optional, free)
Get a key at [aistudio.google.com/apikey](https://aistudio.google.com/apikey), paste
it into `GEMINI_API_KEY=` in `backend/.env`, restart the backend.

---

## 9. A demo script (~5 minutes)

This sequence shows the whole pipeline as one continuous story:

1. **Log in as admin.** Show the Dashboard — real KPIs, pipeline chart, team table.
2. **Open `frontend/public/demo-lead-form.html`** in a second tab (stands in for a
   real company website). Submit it with a new name/phone.
3. **Back on the Dashboard, refresh.** Point at "Recent Activities" — you'll see
   `Lead Created` → `Lead Score Calculated (X/100)` → `Lead Assigned (to <rep>)`
   appear automatically. This is the proof the pipeline is real, not staged.
4. **Go to Leads**, find that lead — point out its AI score badge and assigned rep.
5. **Submit the same form again with the same phone number.** Show the message now
   says it matched an existing lead instead of creating a duplicate. *(Dedupe.)*
6. **Log out, log in as the rep** it got assigned to → My Leads → open the lead →
   click **Generate AI Draft** → edit it → click Approve. *(AI assistance.)*
7. **Mark a lead Converted.** Mention this silently logs a row for the next model
   retrain. *(Feedback loop.)*
8. *(Optional, for a technical audience)* Run
   `node backend/src/scripts/demoWebhookPing.js` twice with the same key from a
   terminal — the second call returns `"duplicate": true` with no new lead created,
   proving the webhook idempotency protection for external ad-platform integrations.

That's ingestion, dedupe, ML scoring, auto-assignment, AI drafting, and the feedback
loop — the entire pipeline — shown live in one flow.

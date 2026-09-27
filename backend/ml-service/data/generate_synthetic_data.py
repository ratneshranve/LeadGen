"""
Generates a synthetic seed dataset for the lead-scoring model, shaped by the feature
list in the LeadGen SOP (source, interaction count, replied Y/N, requirement type,
contact completeness, lead freshness, follow-up count).

This is SYNTHETIC data, not real historical leads - there are no real conversion
outcomes to train on yet. It exists so the project has a genuine trained classifier
(not just if/else rules) to demo, and gets progressively replaced/supplemented by real
outcomes via retrain.py + feedback_log.csv (see backend/src/services/mlFeedback -
recorded whenever a real lead is marked Converted/Lost).

The generation rules encode a plausible (not guaranteed-accurate) relationship between
features and conversion, e.g. more interactions / a reply / complete contact info /
freshness all push probability of conversion up. A real dataset would replace this
entirely once enough real outcomes accumulate.
"""
import csv
import random

random.seed(42)

SOURCES = ["Website Inquiry", "WhatsApp Chat", "Meta Ads", "Client Referral"]
REQUIREMENT_TYPES = ["Demo", "Pricing", "General", "Support"]

OUT_PATH = "data/synthetic_data.csv"

FIELDNAMES = [
    "source",
    "interaction_count",
    "replied",
    "requirement_type",
    "contact_complete",
    "lead_freshness_days",
    "followup_count",
    "estimated_value",
    "converted",
]


def generate_row():
    source = random.choice(SOURCES)
    interaction_count = random.randint(0, 12)
    replied = 1 if random.random() < 0.55 else 0
    requirement_type = random.choice(REQUIREMENT_TYPES)
    contact_complete = 1 if random.random() < 0.75 else 0
    lead_freshness_days = random.randint(0, 60)
    followup_count = random.randint(0, 6)
    estimated_value = random.choice([0, 10000, 25000, 49999, 75000, 150000])

    # Base logit combining the features (hand-tuned weights - this is the "plausible
    # relationship" the synthetic set encodes).
    score = (
        -2.6
        + 0.28 * interaction_count
        + 1.1 * replied
        + 0.5 * contact_complete
        + 0.35 * followup_count
        + (0.6 if source == "Client Referral" else 0.0)
        + (0.4 if source == "WhatsApp Chat" else 0.0)
        + (0.3 if requirement_type == "Demo" else 0.0)
        + (0.2 if requirement_type == "Pricing" else 0.0)
        - 0.03 * lead_freshness_days
        + 0.000006 * estimated_value
    )
    probability = 1 / (1 + pow(2.71828, -score))
    converted = 1 if random.random() < probability else 0

    return {
        "source": source,
        "interaction_count": interaction_count,
        "replied": replied,
        "requirement_type": requirement_type,
        "contact_complete": contact_complete,
        "lead_freshness_days": lead_freshness_days,
        "followup_count": followup_count,
        "estimated_value": estimated_value,
        "converted": converted,
    }


def main(n=1500):
    rows = [generate_row() for _ in range(n)]
    with open(OUT_PATH, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=FIELDNAMES)
        writer.writeheader()
        writer.writerows(rows)
    converted_count = sum(r["converted"] for r in rows)
    print(f"Wrote {n} synthetic rows to {OUT_PATH} ({converted_count} converted, {n - converted_count} not)")


if __name__ == "__main__":
    main()

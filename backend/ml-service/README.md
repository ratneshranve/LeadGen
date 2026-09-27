# LeadGen ML Scoring Service

Small local FastAPI service that scores a lead's conversion probability. Free, runs
entirely on your machine - no cloud ML billing.

## Setup (once)

```bash
cd backend/ml-service
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
python data/generate_synthetic_data.py
python train.py
```

`train.py` prints precision/recall/F1/ROC-AUC for both candidate models (Logistic
Regression, Random Forest) and picks the better one by ROC-AUC. Metrics are saved to
`model/metrics.json` - useful for your project report/demo.

## Run

```bash
uvicorn app:app --port 8001
```

Leave this running alongside the Node backend (`npm run dev` in `backend/`) and the
frontend dev server. The Node backend calls `POST /predict` automatically whenever a
lead is created or gets a new interaction; if this service isn't running, lead
creation still succeeds (the score just stays unset until the service comes back).

## Retraining with real outcomes (feedback loop)

Once leads in the app get marked Converted/Lost, the Node backend appends their
features + outcome to `data/feedback_log.csv`. Run:

```bash
python retrain.py
```

This mixes the real feedback rows into training alongside the synthetic seed set and
saves a new model version. Do this manually before a demo, not on a schedule.

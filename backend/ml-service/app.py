"""
Lead-scoring service. Loads the model trained by train.py and exposes POST /predict.

Run:
    uvicorn app:app --port 8001

The Node backend (backend/src/services/mlScoring.service.js) calls this with lead
features and gets back {probability, score, priority, modelVersion}.
"""
import json
import os

from dotenv import load_dotenv
from fastapi import FastAPI, Header, HTTPException
from joblib import load
from pydantic import BaseModel

load_dotenv()

API_KEY = os.getenv("ML_SERVICE_API_KEY", "")
MODEL_PATH = os.getenv("MODEL_PATH", "model/lead_score_model.joblib")
META_PATH = "model/model_meta.json"

app = FastAPI(title="LeadGen ML Scoring Service")

_model = None
_meta = {"modelVersion": "untrained"}


def get_model():
    global _model, _meta
    if _model is None:
        if not os.path.exists(MODEL_PATH):
            raise HTTPException(
                status_code=503,
                detail="Model not trained yet. Run: python data/generate_synthetic_data.py && python train.py",
            )
        _model = load(MODEL_PATH)
        if os.path.exists(META_PATH):
            with open(META_PATH) as f:
                _meta = json.load(f)
    return _model


class LeadFeatures(BaseModel):
    source: str = "Website Inquiry"
    interaction_count: int = 0
    replied: int = 0
    requirement_type: str = "General"
    contact_complete: int = 0
    lead_freshness_days: int = 0
    followup_count: int = 0
    estimated_value: float = 0


def score_to_priority(score: int) -> str:
    if score >= 70:
        return "High"
    if score >= 40:
        return "Medium"
    return "Low"


def verify_key(x_api_key: str | None):
    if API_KEY and x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Invalid or missing X-API-Key")


@app.get("/health")
def health():
    return {"status": "UP", "modelLoaded": _model is not None, "modelVersion": _meta.get("modelVersion")}


@app.post("/predict")
def predict(features: LeadFeatures, x_api_key: str | None = Header(default=None)):
    verify_key(x_api_key)
    model = get_model()

    import pandas as pd

    row = pd.DataFrame([features.model_dump()]).rename(
        columns={
            "source": "source",
            "requirement_type": "requirement_type",
        }
    )
    probability = float(model.predict_proba(row)[0][1])
    score = round(probability * 100)
    return {
        "probability": round(probability, 4),
        "score": score,
        "priority": score_to_priority(score),
        "modelVersion": _meta.get("modelVersion", "unknown"),
    }

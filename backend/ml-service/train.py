"""
Trains candidate models on data/synthetic_data.csv (+ data/feedback_log.csv if present,
appended by retrain.py once real outcomes exist), compares them, and saves the best one.

Usage:
    python data/generate_synthetic_data.py   # once, or whenever you want a fresh seed set
    python train.py

Outputs:
    model/lead_score_model.joblib   - trained pipeline (preprocessing + classifier)
    model/metrics.json              - evaluation metrics for both candidates (for your report)
    model/model_meta.json           - feature columns + model version, read by app.py
"""
import json
import os
import time

import pandas as pd
from joblib import dump
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
)
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

DATA_PATH = "data/synthetic_data.csv"
FEEDBACK_PATH = "data/feedback_log.csv"
MODEL_DIR = "model"

NUMERIC_FEATURES = [
    "interaction_count",
    "replied",
    "contact_complete",
    "lead_freshness_days",
    "followup_count",
    "estimated_value",
]
CATEGORICAL_FEATURES = ["source", "requirement_type"]
TARGET = "converted"


def load_data():
    if not os.path.exists(DATA_PATH):
        raise SystemExit(f"{DATA_PATH} not found - run: python data/generate_synthetic_data.py")
    df = pd.read_csv(DATA_PATH)
    if os.path.exists(FEEDBACK_PATH):
        feedback = pd.read_csv(FEEDBACK_PATH)
        if len(feedback) > 0:
            df = pd.concat([df, feedback], ignore_index=True)
            print(f"Included {len(feedback)} real feedback rows from {FEEDBACK_PATH}")
    return df


def build_pipeline(estimator):
    preprocessor = ColumnTransformer(
        transformers=[
            ("num", StandardScaler(), NUMERIC_FEATURES),
            ("cat", OneHotEncoder(handle_unknown="ignore"), CATEGORICAL_FEATURES),
        ]
    )
    return Pipeline(steps=[("preprocess", preprocessor), ("model", estimator)])


def evaluate(pipeline, X_test, y_test):
    y_pred = pipeline.predict(X_test)
    y_proba = pipeline.predict_proba(X_test)[:, 1]
    return {
        "accuracy": round(accuracy_score(y_test, y_pred), 4),
        "precision": round(precision_score(y_test, y_pred, zero_division=0), 4),
        "recall": round(recall_score(y_test, y_pred, zero_division=0), 4),
        "f1": round(f1_score(y_test, y_pred, zero_division=0), 4),
        "roc_auc": round(roc_auc_score(y_test, y_proba), 4),
        "confusion_matrix": confusion_matrix(y_test, y_pred).tolist(),
    }


def main():
    os.makedirs(MODEL_DIR, exist_ok=True)
    df = load_data()

    X = df[NUMERIC_FEATURES + CATEGORICAL_FEATURES]
    y = df[TARGET]
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

    candidates = {
        "logistic_regression": build_pipeline(LogisticRegression(max_iter=1000)),
        "random_forest": build_pipeline(RandomForestClassifier(n_estimators=200, max_depth=8, random_state=42)),
    }

    metrics = {}
    for name, pipeline in candidates.items():
        pipeline.fit(X_train, y_train)
        metrics[name] = evaluate(pipeline, X_test, y_test)
        print(f"{name}: {metrics[name]}")

    # Select by ROC-AUC (probability calibration matters more than raw accuracy for scoring).
    best_name = max(metrics, key=lambda n: metrics[n]["roc_auc"])
    best_pipeline = candidates[best_name]
    print(f"\nSelected best model: {best_name}")

    model_version = time.strftime("%Y%m%d-%H%M%S")
    dump(best_pipeline, os.path.join(MODEL_DIR, "lead_score_model.joblib"))

    with open(os.path.join(MODEL_DIR, "metrics.json"), "w") as f:
        json.dump({"candidates": metrics, "selected": best_name, "modelVersion": model_version}, f, indent=2)

    with open(os.path.join(MODEL_DIR, "model_meta.json"), "w") as f:
        json.dump(
            {
                "modelVersion": model_version,
                "selected": best_name,
                "numericFeatures": NUMERIC_FEATURES,
                "categoricalFeatures": CATEGORICAL_FEATURES,
                "sources": sorted(df["source"].unique().tolist()),
                "requirementTypes": sorted(df["requirement_type"].unique().tolist()),
            },
            f,
            indent=2,
        )

    print(f"\nSaved model/lead_score_model.joblib, model/metrics.json, model/model_meta.json (version {model_version})")


if __name__ == "__main__":
    main()

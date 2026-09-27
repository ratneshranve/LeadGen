"""
ML feedback loop (SOP section 40/Phase 9): re-trains the model using the synthetic
seed data PLUS any real outcomes recorded in data/feedback_log.csv (appended by the
Node backend whenever a lead is marked Converted or Lost - see
backend/src/services/mlFeedback.service.js).

Run manually before a demo/report, not automatically on every event - retraining on
every single outcome is explicitly the wrong approach per the SOP (unstable, no
real evaluation signal between versions).

Usage:
    python retrain.py
"""
from train import main as train_main

if __name__ == "__main__":
    print("Retraining with synthetic_data.csv + feedback_log.csv (if present)...")
    train_main()

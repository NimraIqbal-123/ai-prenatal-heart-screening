from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
from datetime import datetime
import torch
import torch.nn as nn
import segmentation_models_pytorch as smp
import torchvision.models as models

from utils.predict import predict_image

# ---------------- DEVICE ----------------
device = torch.device("cpu")

# ---------------- U-NET MODEL ----------------
def get_unet():
    model = smp.Unet(
        encoder_name='resnet34',
        encoder_weights=None,
        in_channels=1,
        classes=1,
        activation='sigmoid'
    )
    return model

# ---------------- CLASSIFIER MODEL ----------------
def get_classifier():
    model = models.efficientnet_b0(weights=None)

    in_features = model.classifier[1].in_features
    model.classifier = nn.Sequential(
        nn.Dropout(0.3),
        nn.Linear(in_features, 256),
        nn.ReLU(),
        nn.Linear(256, 2)
    )
    return model

# ---------------- SAFE MODEL LOADING ----------------
def load_model_weights(model, path):
    state = torch.load(path, map_location=device)

    # handle checkpoint formats
    if isinstance(state, dict) and "model_state" in state:
        model.load_state_dict(state["model_state"])
    else:
        model.load_state_dict(state)

    return model

# ---------------- LOAD MODELS ----------------
unet_model = get_unet()
unet_model = load_model_weights(unet_model, "models/unet.pth")
unet_model.to(device)
unet_model.eval()

clf_model = get_classifier()
clf_model = load_model_weights(clf_model, "models/classifier.pth")
clf_model.to(device)
clf_model.eval()

print("✅ Models loaded successfully!")

# Optional debug (safe to keep)
state_debug = torch.load("models/classifier.pth", map_location=device)
print("🔍 Checkpoint type:", type(state_debug))
if isinstance(state_debug, dict):
    print("🔍 Keys sample:", list(state_debug.keys())[:10])

# ---------------- FLASK APP ----------------
app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = "static/uploads"
DATA_FILE = "data.json"

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# ---------------- HOME ----------------
@app.route('/')
def home():
    return "Backend is running successfully 🚀"

# ---------------- ADMIN LOGIN ----------------
@app.route('/admin/login', methods=['POST'])
def admin_login():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    if email == "admin@gmail.com" and password == "admin123":
        return jsonify({"status": "success", "role": "admin"})
    else:
        return jsonify({"status": "error"}), 401

# ---------------- PREDICT ----------------
@app.route('/predict', methods=['POST'])
def predict():
    file = request.files['image']

    filepath = os.path.join(app.config["UPLOAD_FOLDER"], file.filename)
    file.save(filepath)

    result = predict_image(filepath, unet_model, clf_model)

    # SAVE FOR DASHBOARD
    record = {
        "id": datetime.now().timestamp(),
        "riskText": result["risk_text"],
        "severityScore": result["severity_score"],
        "date": datetime.now().strftime("%Y-%m-%d %H:%M")
    }

    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, "r") as f:
            data = json.load(f)
    else:
        data = []

    data.append(record)

    with open(DATA_FILE, "w") as f:
        json.dump(data, f)

    return jsonify(result)

# ---------------- GET RECORDS ----------------
@app.route('/admin/records', methods=['GET'])
def get_records():
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, "r") as f:
            data = json.load(f)
    else:
        data = []

    return jsonify(data)

# ---------------- RUN ----------------
if __name__ == "__main__":
    app.run(debug=True)
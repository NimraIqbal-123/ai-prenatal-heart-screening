import torch
import os

device = torch.device("cpu")

# Paths to your extracted folders
unet_path = os.path.join("models", "unet.pth", "data.pkl")
clf_path = os.path.join("models", "classifier.pth", "data.pkl")

# Load models
unet_model = torch.load(unet_path, map_location=device)
classifier_model = torch.load(clf_path, map_location=device)

print("✅ Models loaded successfully!")
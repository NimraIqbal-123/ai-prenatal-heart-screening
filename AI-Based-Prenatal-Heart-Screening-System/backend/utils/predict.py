import cv2
import torch
import numpy as np
import base64

device = torch.device("cpu")

# ---------------- SAFE ENCODE ----------------
def encode_image(img):
    img = img.astype(np.uint8)
    success, buffer = cv2.imencode('.png', img)

    if not success:
        raise ValueError("Image encoding failed")

    return base64.b64encode(buffer).decode('utf-8')


# ---------------- MAIN PREDICT FUNCTION ----------------
def predict_image(img_path, unet_model, clf_model):

    print("Model eval mode:", not clf_model.training)

    # STEP 1: READ IMAGE
    img_gray = cv2.imread(img_path, cv2.IMREAD_GRAYSCALE)

    if img_gray is None:
        raise ValueError("Image not loaded properly")

    img_gray = cv2.resize(img_gray, (224, 224))

    # ---------------- STEP 2: U-NET INPUT ----------------
    gray_input = img_gray.astype(np.float32) / 255.0
    gray_input = torch.from_numpy(gray_input).unsqueeze(0).unsqueeze(0).to(device)

    # ---------------- STEP 3: CLASSIFIER INPUT ----------------
    img_rgb = cv2.cvtColor(img_gray, cv2.COLOR_GRAY2RGB).astype(np.float32) / 255.0

    mean = np.array([0.485, 0.456, 0.406])
    std = np.array([0.229, 0.224, 0.225])

    img_rgb = (img_rgb - mean) / std

    clf_input = torch.from_numpy(img_rgb).permute(2, 0, 1).unsqueeze(0).float().to(device)

    print("Input shape:", clf_input.shape)
    print("Input min/max:", clf_input.min().item(), clf_input.max().item())

    # ---------------- STEP 4: SEGMENTATION ----------------
    with torch.no_grad():
        seg_output = unet_model(gray_input)

    seg_mask = seg_output.squeeze().cpu().numpy()
    seg_mask = (seg_mask > 0.5).astype(np.uint8) * 255

    print("=== SEGMENTATION DEBUG ===")
    print("Min:", seg_mask.min())
    print("Max:", seg_mask.max())
    print("Unique:", np.unique(seg_mask))

    overlay = cv2.cvtColor(img_gray, cv2.COLOR_GRAY2RGB)
    overlay[seg_mask == 255] = [0, 255, 0]

    seg_base64 = encode_image(overlay)

    # ---------------- STEP 5: CLASSIFICATION ----------------
    with torch.no_grad():
        clf_output = clf_model(clf_input)

    print("Raw logits:", clf_output)

    probs = torch.softmax(clf_output, dim=1)
    print("Softmax probs:", probs)

    prob = probs[0][1].item()

    predicted_class = torch.argmax(probs).item()

    print("=== CLASSIFIER DEBUG ===")
    print("Predicted class:", predicted_class)
    print("Probability:", prob)

    # ---------------- RISK LOGIC (FIXED & CONSISTENT) ----------------
    if prob < 0.4:
        risk_text = "Low Risk"
        risk_value = "Normal"
        recommendation = "Normal"
    elif prob < 0.7:
        risk_text = "Medium Risk"
        risk_value = "Warning"
        recommendation = "Consult doctor"
    else:
        risk_text = "High Risk"
        risk_value = "Severe"
        recommendation = "Consult doctor immediately"

    # ---------------- STEP 6: HEATMAP ----------------
    heatmap = cv2.applyColorMap(img_gray, cv2.COLORMAP_JET)

    heatmap = cv2.addWeighted(
        cv2.cvtColor(img_gray, cv2.COLOR_GRAY2RGB),
        0.6,
        heatmap,
        0.4,
        0
    )

    heatmap_base64 = encode_image(heatmap)

    # ---------------- DEBUG WEIGHTS ----------------
    print("=== MODEL WEIGHTS CHECK ===")
    count = 0
    for name, param in clf_model.named_parameters():
        print(name, "mean:", torch.mean(param).item())
        count += 1
        if count > 5:
            break
    print("===========================")

    # ---------------- FINAL OUTPUT ----------------
    return {
        "risk_text": risk_text,
        "severity_score": round(prob, 2),
        "risk_value": risk_value,
        "defect_percentage": int(prob * 100),
        "location": "Detected Region",
        "recommendation": recommendation,
        "explanation": "Prediction based on trained model",
        "segmentation_overlay": "data:image/png;base64," + seg_base64,
        "gradcam_overlay": "data:image/png;base64," + heatmap_base64
    }
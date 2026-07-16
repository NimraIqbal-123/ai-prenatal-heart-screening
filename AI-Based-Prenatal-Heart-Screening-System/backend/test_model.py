import torch
import cv2
import numpy as np
from utils.predict import predict_image

# test images folder
test_images = [
    "test1.jpg",
    "test2.jpg",
    "test3.jpg"
]

correct = 0
total = len(test_images)

for img_path in test_images:
    print("\nTesting:", img_path)

    result = predict_image(img_path)

    print("Risk:", result["risk_text"])
    print("Confidence:", result["severity_score"])

print("\nDone testing model")
import torch
from flask import Flask, request, jsonify, send_file
from ultralytics import YOLO
from ultralytics.nn.tasks import DetectionModel

# Allowlist custom YOLO model class
torch.serialization.add_safe_globals([DetectionModel])

# Load model once at startup
model = YOLO("best_ingredient_detection_model.pt")

app = Flask(__name__)

# Root route/First page seen
@app.route("/", methods=["GET"])
def index():
    return send_file('static/index.html')

# This is to make sure it's connected and viable for debugging
@app.route("/test", methods=["GET"])
def test_prediction():
    test_image_path = "test_image.jpg"
    results = model.predict(test_image_path)
    class_ids = results[0].boxes.cls.tolist()
    class_names = [model.names[int(c)] for c in class_ids]
    return jsonify({"predicted_classes": class_names})

# I only really need this one; the rest are for debugging and testing
@app.route("/predict", methods=["POST"])
def predict():
    print("Received predict request")
    
    if "image" not in request.files:
        print("No image in request")
        return jsonify({"error": "No image uploaded"}), 400

    image_file = request.files["image"]
    print(f"Received file: {image_file.filename}, Size: {image_file.content_length}")
    
    image_path = "uploaded_image.jpg"
    image_file.save(image_path)
    print(f"Saved image to {image_path}")

    try:
        print("Running prediction...")
        results = model.predict(image_path)
        class_ids = results[0].boxes.cls.tolist()
        class_names = [model.names[int(c)] for c in class_ids]
        print(f"Detected classes: {class_names}")
        return jsonify({"predicted_classes": class_names})
    except Exception as e:
        print(f"Error during prediction: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
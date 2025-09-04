# Face Detection Models

This directory should contain the face-api.js models for real face detection.

To download the models, run:

```bash
# Download face-api.js models
wget -O /app/public/models/tiny_face_detector_model-weights_manifest.json https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/tiny_face_detector_model-weights_manifest.json
wget -O /app/public/models/tiny_face_detector_model-shard1 https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/tiny_face_detector_model-shard1
wget -O /app/public/models/face_landmark_68_model-weights_manifest.json https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_landmark_68_model-weights_manifest.json
wget -O /app/public/models/face_landmark_68_model-shard1 https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_landmark_68_model-shard1
wget -O /app/public/models/face_recognition_model-weights_manifest.json https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_recognition_model-weights_manifest.json
wget -O /app/public/models/face_recognition_model-shard1 https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_recognition_model-shard1
wget -O /app/public/models/face_recognition_model-shard2 https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_recognition_model-shard2
wget -O /app/public/models/face_expression_model-weights_manifest.json https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_expression_model-weights_manifest.json
wget -O /app/public/models/face_expression_model-shard1 https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_expression_model-shard1
```

Or the models will automatically fallback to basic detection if not available.
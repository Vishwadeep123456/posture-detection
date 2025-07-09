from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import mediapipe as mp
import numpy as np

app = Flask(__name__)
CORS(app)

# 👇 Analyze route
@app.route('/analyze', methods=['POST'])
def analyze_video():
    file = request.files.get("video")
    if not file:
        return jsonify({"error": "No video provided"}), 400

    # Save temp file
    filepath = "temp.mp4"
    file.save(filepath)

    # OpenCV video processing
    cap = cv2.VideoCapture(filepath)
    mp_pose = mp.solutions.pose
    pose = mp_pose.Pose()
    bad_frames = 0
    total_frames = 0

    while True:
        success, frame = cap.read()
        if not success:
            break
        total_frames += 1

        # Pose detection
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        result = pose.process(rgb_frame)

        if result.pose_landmarks:
            landmarks = result.pose_landmarks.landmark

            # Rule: back angle detection (shoulder-hip-knee)
            shoulder = landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value]
            hip = landmarks[mp_pose.PoseLandmark.LEFT_HIP.value]
            knee = landmarks[mp_pose.PoseLandmark.LEFT_KNEE.value]

            # Vector math for angle
            a = np.array([shoulder.x, shoulder.y])
            b = np.array([hip.x, hip.y])
            c = np.array([knee.x, knee.y])

            ba = a - b
            bc = c - b

            cosine_angle = np.dot(ba, bc) / (np.linalg.norm(ba) * np.linalg.norm(bc))
            angle = np.degrees(np.arccos(cosine_angle))

            if angle < 150:
                bad_frames += 1

    cap.release()
    posture = "Bad" if bad_frames / total_frames > 0.3 else "Good"
    return jsonify({
        "posture": posture,
        "bad_frames": bad_frames,
        "total_frames": total_frames
    })

# IMPORTANT: Run server
if __name__ == '__main__':
    app.run(debug=True, port=5000)

from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import mediapipe as mp
import numpy as np
import os

# =========================
# FLASK APP
# =========================

app = Flask(__name__)

# =========================
# CORS
# =========================
# Development ke liye multiple React ports allow
CORS(
    app,
    resources={
        r"/*": {
            "origins": [
                "http://localhost:3000",
                "http://localhost:3001",
                "http://localhost:3002",
                "http://localhost:3003",
            ]
        }
    }
)


# =========================
# HOME
# =========================

@app.route("/")
def home():
    return "Backend is running!"


# =========================
# ANGLE FUNCTION
# =========================

def calculate_angle(a, b, c):

    ba = np.array(a) - np.array(b)
    bc = np.array(c) - np.array(b)

    denominator = (
        np.linalg.norm(ba) *
        np.linalg.norm(bc)
    )

    if denominator == 0:
        return 0

    cosine_angle = np.dot(ba, bc) / denominator

    cosine_angle = np.clip(
        cosine_angle,
        -1.0,
        1.0
    )

    angle = np.degrees(
        np.arccos(cosine_angle)
    )

    return angle


# =========================
# ANALYZE VIDEO
# =========================

@app.route("/analyze", methods=["POST"])
def analyze_video():

    print("===== ANALYZE API CALLED =====")

    file = request.files.get("video")

    print("FILE:", file)

    if not file:
        return jsonify({
            "error": "No video provided"
        }), 400

    filepath = "temp.mp4"

    try:

        # =========================
        # SAVE VIDEO
        # =========================

        file.save(filepath)

        print("Video saved:", filepath)

        # =========================
        # MEDIAPIPE
        # =========================

        mp_pose = mp.solutions.pose

        pose = mp_pose.Pose(
            static_image_mode=False,
            model_complexity=1,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )

        # =========================
        # OPEN VIDEO
        # =========================

        cap = cv2.VideoCapture(filepath)

        if not cap.isOpened():
            return jsonify({
                "error": "Could not open video"
            }), 400

        total_frames = 0
        good_frames = 0
        bad_frames = 0

        forward_head_frames = 0
        bad_back_frames = 0
        uneven_shoulder_frames = 0

        print("Starting video analysis...")

        # =========================
        # PROCESS FRAMES
        # =========================

        while True:

            success, frame = cap.read()

            if not success:
                break

            total_frames += 1

            # RGB conversion
            rgb_frame = cv2.cvtColor(
                frame,
                cv2.COLOR_BGR2RGB
            )

            # MediaPipe
            result = pose.process(rgb_frame)

            if not result.pose_landmarks:
                continue

            landmarks = result.pose_landmarks.landmark

            # =========================
            # LANDMARKS
            # =========================

            left_shoulder = landmarks[
                mp_pose.PoseLandmark.LEFT_SHOULDER.value
            ]

            right_shoulder = landmarks[
                mp_pose.PoseLandmark.RIGHT_SHOULDER.value
            ]

            left_hip = landmarks[
                mp_pose.PoseLandmark.LEFT_HIP.value
            ]

            left_knee = landmarks[
                mp_pose.PoseLandmark.LEFT_KNEE.value
            ]

            nose = landmarks[
                mp_pose.PoseLandmark.NOSE.value
            ]

            # =========================
            # BACK ANGLE
            # =========================

            shoulder = [
                left_shoulder.x,
                left_shoulder.y
            ]

            hip = [
                left_hip.x,
                left_hip.y
            ]

            knee = [
                left_knee.x,
                left_knee.y
            ]

            back_angle = calculate_angle(
                shoulder,
                hip,
                knee
            )

            if back_angle < 150:
                bad_back_frames += 1

            # =========================
            # FORWARD HEAD
            # =========================

            shoulder_center_x = (
                left_shoulder.x +
                right_shoulder.x
            ) / 2

            head_distance = abs(
                nose.x -
                shoulder_center_x
            )

            if head_distance > 0.15:
                forward_head_frames += 1

            # =========================
            # SHOULDER ALIGNMENT
            # =========================

            shoulder_difference = abs(
                left_shoulder.y -
                right_shoulder.y
            )

            if shoulder_difference > 0.08:
                uneven_shoulder_frames += 1

            # =========================
            # FRAME RESULT
            # =========================

            frame_bad = False

            if back_angle < 150:
                frame_bad = True

            if head_distance > 0.15:
                frame_bad = True

            if shoulder_difference > 0.08:
                frame_bad = True

            if frame_bad:
                bad_frames += 1
            else:
                good_frames += 1

        # =========================
        # RELEASE
        # =========================

        cap.release()
        pose.close()

        print("Total frames:", total_frames)
        print("Good frames:", good_frames)
        print("Bad frames:", bad_frames)

        # =========================
        # VIDEO ERROR
        # =========================

        if total_frames == 0:

            return jsonify({
                "error": "Could not read video"
            }), 400

        # =========================
        # SCORE
        # =========================

        good_percentage = (
            good_frames / total_frames
        ) * 100

        bad_percentage = (
            bad_frames / total_frames
        ) * 100

        score = round(good_percentage)

        score = max(
            0,
            min(score, 100)
        )

        # =========================
        # POSTURE
        # =========================

        if score >= 70:
            posture = "Good Posture"
        else:
            posture = "Bad Posture"

        # =========================
        # PROBLEMS
        # =========================

        problems = []

        if forward_head_frames > total_frames * 0.20:

            problems.append(
                "Forward head posture detected"
            )

        if bad_back_frames > total_frames * 0.20:

            problems.append(
                "Back bending detected"
            )

        if uneven_shoulder_frames > total_frames * 0.20:

            problems.append(
                "Uneven shoulders detected"
            )

        # =========================
        # RECOMMENDATIONS
        # =========================

        recommendations = []

        if "Forward head posture detected" in problems:

            recommendations.append(
                "Keep your head aligned with your shoulders."
            )

        if "Back bending detected" in problems:

            recommendations.append(
                "Keep your back straight while sitting."
            )

        if "Uneven shoulders detected" in problems:

            recommendations.append(
                "Keep both shoulders at a similar height."
            )

        if not recommendations:

            recommendations.append(
                "Great! Maintain your current posture."
            )

        # =========================
        # RESPONSE
        # =========================

        response = {

            "posture": posture,

            "score": score,

            "good_frames": good_frames,

            "bad_frames": bad_frames,

            "total_frames": total_frames,

            "good_percentage": round(
                good_percentage,
                2
            ),

            "bad_percentage": round(
                bad_percentage,
                2
            ),

            "problems": problems,

            "recommendations": recommendations

        }

        print("Analysis completed!")
        print("Response:", response)

        return jsonify(response)

    except Exception as e:

        print("===== ANALYSIS ERROR =====")
        print(e)

        return jsonify({
            "error": str(e)
        }), 500

    finally:

        if os.path.exists(filepath):

            try:
                os.remove(filepath)
                print("Temporary video deleted.")

            except Exception as e:

                print(
                    "Could not delete temp file:",
                    e
                )


# =========================
# RUN SERVER
# =========================

if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )
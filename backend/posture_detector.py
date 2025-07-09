import cv2
import mediapipe as mp
import numpy as np
from utils import calculate_angle

mp_pose = mp.solutions.pose
mp_drawing = mp.solutions.drawing_utils

def analyze_posture(video_path):
    cap = cv2.VideoCapture(video_path)
    posture_result = []

    with mp_pose.Pose(static_image_mode=False, min_detection_confidence=0.5) as pose:
        frame_num = 0

        while cap.isOpened():
            success, frame = cap.read()
            if not success:
                break

            frame_num += 1
            frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            result = pose.process(frame_rgb)

            if result.pose_landmarks:
                landmarks = result.pose_landmarks.landmark

                # Coordinates
                shoulder = [landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].x,
                            landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].y]
                hip = [landmarks[mp_pose.PoseLandmark.LEFT_HIP.value].x,
                       landmarks[mp_pose.PoseLandmark.LEFT_HIP.value].y]
                knee = [landmarks[mp_pose.PoseLandmark.LEFT_KNEE.value].x,
                        landmarks[mp_pose.PoseLandmark.LEFT_KNEE.value].y]
                ear = [landmarks[mp_pose.PoseLandmark.LEFT_EAR.value].x,
                       landmarks[mp_pose.PoseLandmark.LEFT_EAR.value].y]

                # Angles
                back_angle = calculate_angle(shoulder, hip, knee)
                neck_angle = calculate_angle(shoulder, ear, [ear[0], ear[1] - 0.1])

                issues = []

                if back_angle < 150:
                    issues.append(f"Bad back angle: {int(back_angle)}°")
                if neck_angle > 30:
                    issues.append(f"Neck bend too much: {int(neck_angle)}°")

                if issues:
                    posture_result.append({
                        "frame": frame_num,
                        "issues": issues
                    })

    cap.release()
    return {
        "total_flagged_frames": len(posture_result),
        "flags": posture_result
    }

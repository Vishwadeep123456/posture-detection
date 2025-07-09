import numpy as np

def calculate_angle(a, b, c):
    """
    Yeh function 3 points a, b, c ke beech ka angle calculate karta hai:
    a = first point (like shoulder)
    b = middle joint (like hip)
    c = third point (like knee)

    Formula: angle between vectors ba and bc
    """
    a = np.array(a)
    b = np.array(b)
    c = np.array(c)

    ba = a - b
    bc = c - b

    cosine_angle = np.dot(ba, bc) / (np.linalg.norm(ba) * np.linalg.norm(bc))
    angle = np.arccos(np.clip(cosine_angle, -1.0, 1.0))  # Clip to avoid error

    return np.degrees(angle)  # Angle in degrees

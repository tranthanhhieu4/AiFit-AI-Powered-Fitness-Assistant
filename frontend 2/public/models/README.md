# Pose Landmarker model

Download `pose_landmarker_lite.task` (or `_full` / `_heavy` for more
accuracy at a lower FPS) from Google's MediaPipe model index and place it
in this folder, so `usePoseLandmarker.ts` can load it from
`/models/pose_landmarker_lite.task` (see `.env.example` ->
`VITE_POSE_MODEL_URL`). It is intentionally not committed to the repo
(it is a ~5-30 MB binary asset).

https://ai.google.dev/edge/mediapipe/solutions/vision/pose_landmarker

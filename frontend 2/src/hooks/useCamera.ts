import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Requests webcam access and attaches the stream to a <video> element.
 * Maps directly to IDD UI-09(a) "Camera permission denied" and NFR04
 * Reliability (the system must handle a denied/retracted permission
 * gracefully instead of leaving a blank screen).
 */
export type CameraStatus = "idle" | "requesting" | "ready" | "denied" | "error";

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState<CameraStatus>("idle");

  const start = useCallback(async () => {
    setStatus("requesting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setStatus("ready");
    } catch (err) {
      // NotAllowedError = user denied permission; anything else is a
      // generic device/driver problem (IDD UI-09 differentiates these).
      if (err instanceof DOMException && err.name === "NotAllowedError") {
        setStatus("denied");
      } else {
        setStatus("error");
      }
    }
  }, []);

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setStatus("idle");
  }, []);

  useEffect(() => stop, [stop]);

  return { videoRef, status, start, stop };
}

import { useRef, useState, useEffect } from "react";
import {
  FaVolumeMute,
  FaVolumeUp,
  FaSearchPlus,
  FaSearchMinus,
} from "react-icons/fa";
import "./VideoPlayer.css";

interface VideoPlayerProps {
  cameraId: number;
  videoUrl: string;
  isPlaying: boolean;
  setPlayAudioId: React.Dispatch<React.SetStateAction<number | null>>;
  playAudioId: number | null;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  cameraId,
  videoUrl,
  isPlaying,
  playAudioId,
  setPlayAudioId,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const drawFrameRef = useRef<(() => void) | null>(null);

  const isMuted = cameraId !== playAudioId;

  useEffect(() => {
    if (isPlaying) {
      const video = videoRef.current;
      if (!video) return;
      video
        .play()
        .then(() => {
          drawFrameRef.current?.();
        })
        .catch((err) => {
          console.error(`Camera ${cameraId} play() failed`, err);
        });
    } else {
      videoRef.current?.pause();
    }
  }, [isPlaying, cameraId]);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const drawFrame = () => {
      if (video.paused || video.ended) return;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      ctx.font = "10vw Arial";
      ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
      ctx.fillText(`Camera ${cameraId}`, 50, 200);
      ctx.fillText(
        new Date(video.currentTime * 1000).toISOString().substr(11, 8),
        canvas.width - (700 / 1280) * 1000,
        200
      );

      requestAnimationFrame(drawFrame);
    };

    drawFrameRef.current = drawFrame;

    const handleLoadedData = () => {
      setIsLoading(false);
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    };

    const handlePlaying = () => {
      drawFrame();
    };

    const handleError = () => {
      setIsLoading(false);
      setError("Failed to load video");
    };

    video.addEventListener("loadeddata", handleLoadedData);
    video.addEventListener("playing", handlePlaying);
    video.addEventListener("error", handleError);

    return () => {
      video.removeEventListener("loadeddata", handleLoadedData);
      video.removeEventListener("playing", handlePlaying);
      video.removeEventListener("error", handleError);
    };
  }, [cameraId]);

  useEffect(() => {
    containerRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, [isZoomed]);

  const toggleMute = () => {
    if (isMuted) {
      setPlayAudioId(cameraId);
    } else {
      setPlayAudioId(null);
    }
  };

  const toggleZoom = () => {
    setIsZoomed((prev) => !prev);
  };

  return (
    <div
      className={`video-player ${isZoomed ? "zoomed" : ""}`}
      ref={containerRef}
    >
      <div className="video-container">
        <video
          ref={videoRef}
          src={videoUrl}
          className="hidden"
          preload="auto"
          loop
          muted={cameraId !== playAudioId}
        />
        <canvas ref={canvasRef} className="video-canvas" />
        {isLoading && (
          <div className="loading-overlay">
            <div className="spinner"></div>
          </div>
        )}
        {error && (
          <div className="error-overlay">
            <div className="error-message">
              <p>{error}</p>
            </div>
          </div>
        )}
      </div>

      <div className="controls">
        <button
          onClick={toggleMute}
          className="control-button"
          aria-label={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
        </button>
        <button
          onClick={toggleZoom}
          className="control-button"
          aria-label={isZoomed ? "Zoom out" : "Zoom in"}
        >
          {isZoomed ? <FaSearchMinus /> : <FaSearchPlus />}
        </button>
      </div>
    </div>
  );
};

export default VideoPlayer;

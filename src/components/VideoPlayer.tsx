import {
  useRef,
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import "./VideoPlayer.css";

interface VideoPlayerProps {
  cameraId: number;
  videoUrl: string;
}

export interface VideoPlayerHandle {
  play: () => void;
  pause: () => void;
}

const VideoPlayer = forwardRef<VideoPlayerHandle, VideoPlayerProps>(
  ({ cameraId, videoUrl }, ref) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isZoomed, setIsZoomed] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);
    const drawFrameRef = useRef<(() => void) | null>(null);

    useImperativeHandle(ref, () => ({
      play: () => {
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
      },
      pause: () => {
        videoRef.current?.pause();
      },
    }));

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
          canvas.width - 800,
          200
        );

        requestAnimationFrame(drawFrame);
      };

      drawFrameRef.current = drawFrame;

      const handleLoadedData = () => {
        setIsLoading(false);
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        setIsMuted(video.muted);
        drawFrame();
      };

      const handleError = () => {
        setIsLoading(false);
        setError("Failed to load video");
      };

      video.addEventListener("loadeddata", handleLoadedData);
      video.addEventListener("error", handleError);

      return () => {
        video.removeEventListener("loadeddata", handleLoadedData);
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
      const video = videoRef.current;
      if (video) {
        const newMuted = !video.muted;
        video.muted = newMuted;
        setIsMuted(newMuted);
      }
    };

    const toggleZoom = () => {
      setIsZoomed((prev) => !prev);
    };

    return (
      <div className={`video-player ${isZoomed ? "zoomed" : ""}`} ref={containerRef}>
        <div className="video-container">
          <video
            ref={videoRef}
            src={videoUrl}
            className="hidden"
            preload="auto"
            loop
            muted
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
            {isMuted ? "🔈" : "🔇"}
          </button>
          <button
            onClick={toggleZoom}
            className="control-button"
            aria-label={isZoomed ? "Zoom out" : "Zoom in"}
          >
            {isZoomed ? "🔽" : "🔍"}
          </button>
        </div>
      </div>
    );
  }
);

export default VideoPlayer;

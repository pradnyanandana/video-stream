import { useRef, useState, useEffect, useMemo } from "react";
import {
  FaVolumeMute,
  FaVolumeUp,
  FaSearchPlus,
  FaSearchMinus,
  FaPlay,
  FaPause,
  FaHistory,
  FaBroadcastTower,
} from "react-icons/fa";
import "./VideoPlayer.css";

interface VideoPlayerProps {
  cameraId: number;
  videoUrl: string;
  setPlayAudioId: React.Dispatch<React.SetStateAction<number | null>>;
  playAudioId: number | null;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  cameraId,
  videoUrl,
  setPlayAudioId,
  playAudioId,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const drawFrameRef = useRef<(() => void) | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLive, setIsLive] = useState(true);
  const [snapshotDate, setSnapshotDate] = useState<Date>(new Date());

  const isMuted = cameraId !== playAudioId;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.loop = true;
    video.preload = "auto";
    video.muted = isMuted;

    if (isPlaying) {
      video
        .play()
        .then(() => {
          drawFrameRef.current?.();
        })
        .catch((err) => {
          console.error(`Camera ${cameraId} play() failed`, err);
          setError("Failed to play video");
        });
    } else {
      video.pause();
    }
  }, [isPlaying, isMuted, cameraId]);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const drawFrame = () => {
      if (video.paused || video.ended) return;

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const currentTimestamp = new Date();
      const timestamp = currentTimestamp.toLocaleString("id-ID", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

      const fontSize = Math.floor(canvas.height * 0.05);

      ctx.font = `${fontSize}px Arial`;
      ctx.fillStyle = "rgba(255, 255, 255, 0.6)";

      const paddingX = canvas.width * 0.02;
      const paddingY = canvas.height * 0.07;

      const textWidth = ctx.measureText(timestamp).width;

      ctx.fillText(`Camera ${cameraId}`, paddingX, paddingY);
      ctx.fillText(timestamp, canvas.width - paddingX - textWidth, paddingY);

      requestAnimationFrame(drawFrame);
    };

    drawFrameRef.current = drawFrame;

    const handleLoadedData = () => {
      setIsLoading(false);
      setDuration(video.duration);
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handleError = () => {
      setIsLoading(false);
      setError("Failed to load video");
    };

    video.addEventListener("loadeddata", handleLoadedData);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("error", handleError);

    return () => {
      video.removeEventListener("loadeddata", handleLoadedData);
      video.removeEventListener("timeupdate", handleTimeUpdate);
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
    if (!video) return;

    if (isMuted) {
      video.muted = false;
      setPlayAudioId(cameraId);
      video
        .play()
        .catch((err) => console.error("Play after unmuting failed", err));
    } else {
      video.muted = true;
      setPlayAudioId(null);
    }
  };

  const togglePlay = () => setIsPlaying(!isPlaying);
  const toggleZoom = () => setIsZoomed((prev) => !prev);
  const toggleMode = () => {
    const video = videoRef.current;

    if (!video) return;

    if (!isLive) {
      setSnapshotDate(new Date());
    }

    setIsLive((prev) => {
      const next = !prev;

      if (next) {
        video.currentTime = duration;
      }

      return next;
    });
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setIsLive(false);
      setCurrentTime(time);
    }
  };

  const formatDate = (timestamp: Date) => {
    return timestamp.toLocaleTimeString("id-ID", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatCCTVTime = () => {
    const timestamp = new Date();
    return timestamp.toLocaleTimeString("id-ID", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div
      className={`video-player ${isZoomed ? "zoomed" : ""}`}
      ref={containerRef}
    >
      <div className="video-container">
        <video ref={videoRef} src={videoUrl} className="hidden" />
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
        <button onClick={toggleMute} className="control-button">
          {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
        </button>
        <button onClick={toggleZoom} className="control-button">
          {isZoomed ? <FaSearchMinus /> : <FaSearchPlus />}
        </button>
        <button onClick={togglePlay} className="control-button">
          {isPlaying ? <FaPause /> : <FaPlay />}
        </button>
        <button
          onClick={toggleMode}
          className="control-button"
          title="Switch Mode"
        >
          {isLive ? <FaHistory /> : <FaBroadcastTower />}
        </button>

        {isLive ? (
          <div className="seek-bar live-mode">
            <span>{formatCCTVTime()}</span>
            <input
              type="range"
              min={0}
              max={(duration || 0) * 1000}
              value={duration * 1000}
              onChange={handleSeek}
              style={{ accentColor: "grey" }}
            />
            <span style={{ color: "red", fontWeight: "bold" }}>LIVE</span>
          </div>
        ) : (
          <div className="seek-bar">
            <span>
              {formatDate(
                new Date(
                  snapshotDate.getTime() - duration * 1000 + currentTime * 1000
                )
              )}
            </span>
            <input
              type="range"
              min={0}
              max={duration || 0}
              step={0.1}
              value={currentTime}
              onChange={handleSeek}
            />
            <span>{formatDate(snapshotDate)}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;

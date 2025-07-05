import React, { useEffect, useRef, useState } from "react";
import VideoPlayer from "./components/VideoPlayer";
import type { VideoPlayerHandle } from "./components/VideoPlayer";
import { FaPlay, FaPause } from "react-icons/fa";
import './App.css'

const App: React.FC = () => {
  const [videoUrls, setVideoUrls] = useState<string[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const playerRefs = useRef<React.RefObject<VideoPlayerHandle | null>[]>([]);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await fetch("http://localhost:3000/video-urls");
        const data = await response.json();
        setVideoUrls(data.map((v: { url: string }) => v.url));
      } catch (error) {
        console.error("Failed to fetch video URLs:", error);
      }
    };

    fetchVideos();
  }, []);

  // Setup refs for all players
  useEffect(() => {
    playerRefs.current = videoUrls.map(() => React.createRef());
  }, [videoUrls]);

  const togglePlayAll = () => {
    if (isPlaying) {
      playerRefs.current.forEach((ref) => ref.current?.pause());
    } else {
      playerRefs.current.forEach((ref) => ref.current?.play());
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="app-container">
      <div
        className="global-controls"
        style={{ textAlign: "center", marginBottom: "1rem" }}
      >
        <button onClick={togglePlayAll} className="control-button">
          {isPlaying ? <FaPause size={24} /> : <FaPlay size={24} />}
        </button>
      </div>

      <div className="multi-cam-grid">
        {videoUrls.map((url, index) => (
          <VideoPlayer
            key={index}
            ref={playerRefs.current[index]}
            cameraId={index + 1}
            videoUrl={url}
          />
        ))}
      </div>
    </div>
  );
};

export default App;

import React, { useEffect, useState } from "react";
import VideoPlayer from "./components/VideoPlayer";
import { FaPlay, FaPause } from "react-icons/fa";
import "./App.css";

const App: React.FC = () => {
  const [videoUrls, setVideoUrls] = useState<string[]>([]);
  const [isPlaying, setIsPlaying] = useState(true);
  const [playAudioId, setPlayAudioId] = useState<number | null>(null);

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

  const togglePlayAll = () => {
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
            cameraId={index + 1}
            videoUrl={url}
            isPlaying={isPlaying}
            playAudioId={playAudioId}
            setPlayAudioId={setPlayAudioId}
          />
        ))}
      </div>
    </div>
  );
};

export default App;

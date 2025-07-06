import React, { useEffect, useState } from "react";
import VideoPlayer from "./components/VideoPlayer";
import "./App.css";

const App: React.FC = () => {
  const [videoUrls, setVideoUrls] = useState<string[]>([]);
  const [playAudioId, setPlayAudioId] = useState<number | null>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/video-urls`
        );
        const data = await response.json();
        setVideoUrls(data.map((v: { url: string }) => v.url));
      } catch (error) {
        console.error("Failed to fetch video URLs:", error);
      }
    };

    fetchVideos();
  }, []);

  return (
    <div className="app-container">
      <div className="multi-cam-grid">
        {videoUrls.map((url, index) => (
          <VideoPlayer
            key={index}
            cameraId={index + 1}
            videoUrl={url}
            playAudioId={playAudioId}
            setPlayAudioId={setPlayAudioId}
          />
        ))}
      </div>
    </div>
  );
};

export default App;

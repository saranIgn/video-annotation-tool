import { useState, useEffect } from "react";

const useVideoController = (
  playerRef: React.RefObject<HTMLVideoElement>,
  canvasParentRef: React.RefObject<HTMLDivElement>
) => {
  const [playing, setPlaying] = useState<boolean>(false);
  const [played, setPlayed] = useState<number>(0);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false); // State for mute/unmute

  useEffect(() => {
    const player = playerRef?.current;
    if (player) {
      const handleLoadedMetadata = () => {
        if (player.duration) {
          setDuration(player.duration);
        }
      };
      player.addEventListener("loadedmetadata", handleLoadedMetadata);

      // Cleanup the event listener
      return () => player.removeEventListener("loadedmetadata", handleLoadedMetadata);
    }
  }, [playerRef]);

  useEffect(() => {
    if (!playerRef) return;
    const updateProgress = () => {
      const player = playerRef?.current;
      if (player && duration > 0) {
        setCurrentTime(player.currentTime);
        setPlayed(player.currentTime / duration);
      }
    };

    // Update every second
    const interval = setInterval(updateProgress, 1000);
    return () => clearInterval(interval);
  }, [playerRef, duration]);

  const handlePlayPause = () => {
    const player = playerRef.current;
    if (playing) {
      player.pause();
    } else {
      player.play();
    }
    setPlaying(!playing);
  };

  const handleSeekChange = (seekTo: number) => {
    setPlayed(seekTo);
    const player = playerRef.current;
    if (player && duration > 0) {
      player.currentTime = seekTo * duration;
    }
  };

  const handleSpeedChange = (rate: number) => {
    setPlaybackRate(rate);
    const player = playerRef.current;
    if (player) {
      player.playbackRate = rate;
    }
  };

  const handleFullScreen = () => {
    const parentElement = canvasParentRef.current;
    if (parentElement) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        parentElement.requestFullscreen().catch((err) => {
          console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
        });
      }
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  const handleMuteUnmute = () => {
    const player = playerRef.current;
    if (player) {
      player.muted = !isMuted; // Toggle mute state on the video element
      setIsMuted(!isMuted); // Update the state
    }
  };

  useEffect(() => {
    const onFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", onFullScreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", onFullScreenChange);
    };
  }, []);

  return {
    playing,
    played,
    playbackRate,
    duration,
    currentTime,
    handlePlayPause,
    handleSeekChange,
    handleSpeedChange,
    handleFullScreen,
    formatTime,
    setCurrentTime,
    isFullScreen,
    handleMuteUnmute,
    isMuted,
  };
};

export default useVideoController;
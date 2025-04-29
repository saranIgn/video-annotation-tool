import React from "react";
import useVideoController from "./UseVideoPlayerControllerHook";
import { ImVolumeMute } from "react-icons/im";
import { ImVolumeMute2 } from "react-icons/im";
import { FaPauseCircle, FaPlayCircle,FaExpand } from "react-icons/fa";

interface TransparentVideoControllerProps {
  playerRef: React.RefObject<HTMLVideoElement>; // Reference to the video player
  showVideoDuration:boolean;
  dimensions: {
    width: number; // Width of the controller
  };
  canvasParentRef: React.RefObject<HTMLDivElement>; // Reference to the parent canvas
}

const TransparentVideoController: React.FC<TransparentVideoControllerProps> = ({
  playerRef,
  dimensions,
  canvasParentRef,
  showVideoDuration
}) => {
  const {
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
    isMuted,
    handleMuteUnmute,
  } = useVideoController(playerRef, canvasParentRef);

  return (
    <div
      style={{
        width:dimensions.width,
        // minWidth: dimensions.width,
        height: "35px",
        minHeight: "20px",
        background: "rgba(0, 0, 0, 0.4)",
        display: "flex",
        alignItems: "center",
        margin: "4px 0",
        gap: "3px",
        padding: "10px 5px",
        color: "#fff",
        transition: "opacity 0.5s",
      }}
    >
      <div
        onClick={handlePlayPause}
        style={{ fontSize: "12px", cursor: "pointer", margin: "0 10px" }}
      >
        {playing ? <FaPauseCircle size={25} /> : <FaPlayCircle size={25} />}
      </div>

      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={played}
        onChange={(e) => handleSeekChange(parseFloat(e.target.value))}
        style={{
          flexGrow: 1,
          cursor: "pointer",
          accentColor: "#396BDC",
          height: "6px", // optional: slim look
          borderRadius: "5px", // rounded ends
          background: "#ddd", // fallback color
        }}
      />

      <span style={{ marginRight: "10px", fontSize: "14px" }}>
        {formatTime(currentTime)} {showVideoDuration && <>/ {formatTime(duration)}</>}
      </span>
      <FaExpand    style={{
          color: "#fff",
          cursor: "pointer",
          fontSize: "18px",
          marginRight: "10px",
        }} onClick={handleFullScreen}/>

      <select
        onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
        value={playbackRate}
        style={{
          background: "rgba(0,0,0, 0.5)",
          color: "#fff",
          border: "none",
          outline: "none",
          padding: "5px",
          cursor: "pointer",
          fontSize: "10px",
          marginRight: "10px",
        }}
      >
        <option value={0.25}>0.25x</option>
        <option value={0.5}>0.5x</option>
        <option value={1}>1x</option>
        <option value={1.5}>1.5x</option>
        <option value={2}>2x</option>
      </select>

      {isMuted ? (
        <ImVolumeMute2
          onClick={handleMuteUnmute}
          style={{
            color: "#fff",
            cursor: "pointer",
            fontSize: "18px",
            marginRight: "10px",
          }}
        />
      ) : (
        <ImVolumeMute
          onClick={handleMuteUnmute}
          style={{
            color: "#fff",
            cursor: "pointer",
            fontSize: "18px",
            marginRight: "10px",
          }}
        />
      )}
    
    </div>
  );
};

export default TransparentVideoController;
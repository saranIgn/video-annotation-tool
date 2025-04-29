import React, { forwardRef, useEffect, useRef, useState } from "react";
import Hls from "hls.js";

interface PlayerProps {
  url: string;
  videoControls?: React.VideoHTMLAttributes<HTMLVideoElement>;
  dimensions: {
    width: number;
    height: number;
  };
  parentref?: React.RefObject<any>;
}

const Player = forwardRef<HTMLVideoElement, PlayerProps>((props, ref) => {
  const videoControls = props.videoControls;
  const playerRef = useRef<HTMLVideoElement>(null);
  const [hlsInstance, setHlsInstance] = useState<Hls | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  useEffect(() => {
    const video = playerRef.current;
    if (!video) return;
  
    const handleLoadedMetadata = () => {
      console.log("Video resolution:", video.videoWidth, "x", video.videoHeight);
    };
  
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
  
    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, []);
  
  useEffect(() => {
    const videoElement = playerRef.current;
    if (!videoElement) return;

    // Forward ref properly
    if (typeof ref === "function") {
      ref(videoElement);
    } else if (ref) {
      (ref as React.MutableRefObject<HTMLVideoElement | null>).current = videoElement;
    }

    let hls: Hls | undefined;

    const initializePlayer = () => {
      if (props.url && props.url.endsWith(".m3u8")) {
        if (videoElement.canPlayType("application/vnd.apple.mpegurl")) {
          // Native HLS support (Safari)
          videoElement.src = props.url;
          videoElement.play().catch(console.error);
        } else if (Hls.isSupported()) {
          hls = new Hls({
            startLevel: 0,
            maxBufferLength: 30, // Reduce buffer size
            maxMaxBufferLength: 60,
            maxBufferSize: 60 * 1000 * 1000, // 60MB
            maxBufferHole: 0.5, // Allow small gaps
            lowLatencyMode: false,
            enableWorker: true,
            abrEwmaDefaultEstimate: 500000, // 0.5 Mbps
            abrBandWidthFactor: 0.95,
            abrBandWidthUpFactor: 0.7,
            abrMaxWithRealBitrate: true,
          });

          hls.on(Hls.Events.ERROR, (event, data) => {
            if (data.fatal) {
              switch (data.type) {
                case Hls.ErrorTypes.NETWORK_ERROR:
                  console.error("Network error:", data);
                  if (retryCount < 3) {
                    setRetryCount(prev => prev + 1);
                    setTimeout(() => initializePlayer(), 1000 * retryCount);
                  }
                  break;
                case Hls.ErrorTypes.MEDIA_ERROR:
                  console.error("Media error:", data);
                  hls?.recoverMediaError();
                  break;
                default:
                  hls?.destroy();
                  initializePlayer();
                  break;
              }
            } else if (data.type === "mediaError" && data.details === "bufferStalledError") {
              console.warn("Buffer stalled, attempting recovery");
              videoElement.play().catch(() => {
                // If play fails, try seeking slightly forward
                videoElement.currentTime += 0.1;
              });
            }
          });

          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            videoElement.play().catch(console.error);
          });

          hls.loadSource(props.url);
          hls.attachMedia(videoElement);
          setHlsInstance(hls);
        } else {
          console.error("HLS is not supported in this browser.");
        }
      } else {
        videoElement.src = props.url;
        videoElement.play().catch(console.error);
      }
    };

    initializePlayer();

    // Common video settings
    videoElement.crossOrigin = "anonymous";
    videoElement.loop = true;

    return () => {
      if (hlsInstance) {
        hlsInstance.destroy();
        setHlsInstance(null);
      }
    };
  }, [props.url, ref, retryCount]);

  return (
    <video
      style={{
        minHeight: 300,
        objectFit: "cover",
        minWidth: 500,
        position: "absolute",
        top: 0,
        left: 0,
        width: props.dimensions.width,
        height: props.dimensions.height,
      }}
      ref={playerRef}
      {...videoControls}
      preload="auto"
      controls={false}
      muted
    />
  );
});

export default Player;
import React, { forwardRef, useEffect, useRef } from 'react';
import Hls from 'hls.js';

interface PlayerProps {
  url: string; // URL of the video
  videoControls?: React.VideoHTMLAttributes<HTMLVideoElement>; // Video control attributes
  dimensions: {
    width: number; // Width of the video
    height: number; // Height of the video
  };
  parentref?: React.RefObject<any>; // Optional parent ref
}

const Player = forwardRef<HTMLVideoElement, PlayerProps>(function VideoElem(
  props,
  ref
) {
  const videoControls = props.videoControls;
  const playerRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const videoElement = playerRef.current;
    if (!videoElement) return;

    // Forward ref
    if (ref) (ref as React.RefObject<HTMLVideoElement>).current = videoElement;

    // Reset video
    videoElement.removeAttribute('src');
    videoElement.load();

    let hls: Hls | undefined;

    if (props.url && props.url.endsWith('.m3u8')) {
      if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
        // Native support (Safari)
        videoElement.src = props.url;
      } else if (Hls.isSupported()) {
        hls = new Hls();
        hls.loadSource(props.url);
        hls.attachMedia(videoElement);

        hls.on(Hls.Events.ERROR, function (event, data) {
          console.error('HLS.js error:', data);
        });
      } else {
        console.error('HLS is not supported in this browser.');
      }
    } else {
      videoElement.src = props.url;
    }

    videoElement.crossOrigin = 'anonymous';
    videoElement.loop = true;
    videoElement.autoplay = true;

    const onLoadedData = () => {
      // You can handle any logic when video is ready
    };

    videoElement.addEventListener('loadeddata', onLoadedData);

    return () => {
      videoElement.removeEventListener('loadeddata', onLoadedData);
      if (hls) {
        hls.destroy();
      }
    };
  }, [props.parentref, props.url, ref]);

  return (
    <video
      style={{
        minHeight: 300,
        objectFit: 'cover',
        minWidth: 500,
        position: 'absolute',
        top: 0,
        left: 0,
        width: props.dimensions.width,
        height: props.dimensions.height,
      }}
      ref={playerRef}
      {...videoControls}
      preload="auto"
      controls={false}
    />
  );
});

export default Player;
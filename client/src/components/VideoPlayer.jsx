import { useEffect, useRef } from "react";
import { HiExclamation } from "react-icons/hi";

const VideoPlayer = ({ blob, src }) => {
  const videoRef = useRef(null);
  const urlRef = useRef(null);

  useEffect(() => {
    if (blob && videoRef.current) {
      urlRef.current = URL.createObjectURL(blob);
      videoRef.current.src = urlRef.current;
    }

    return () => {
      if (urlRef.current) {
        URL.revokeObjectURL(urlRef.current);
        urlRef.current = null;
      }
    };
  }, [blob]);

  useEffect(() => {
    if (src && videoRef.current) {
      videoRef.current.src = src;
    }
  }, [src]);

  return (
    <div className="w-full">
      <div className="relative bg-gray-900 rounded-xl overflow-hidden shadow-lg">
        <video
          ref={videoRef}
          controls
          className="w-full max-w-full h-auto"
          preload="metadata"
          style={{ maxHeight: "400px" }}
        >
          {src && <source src={src} type="video/webm" />}
          <div className="flex items-center justify-center p-8 text-gray-400">
            <HiExclamation className="w-6 h-6 mr-2" />
            Your browser does not support the video tag.
          </div>
        </video>
      </div>
    </div>
  );
};

export default VideoPlayer;

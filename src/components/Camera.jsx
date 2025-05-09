import React, { useRef, useState, useEffect } from "react";
import { Button } from "../components/ui/button"; // ✅ Relative path
import { CameraIcon, RotateCwIcon } from "lucide-react";

const Camera = ({ onCapture }) => {
  const videoRef = useRef(null);
  const [facingMode, setFacingMode] = useState("user");

  useEffect(() => {
    const getCameraStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Error accessing camera:", error);
      }
    };

    getCameraStream();

    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
    };
  }, [facingMode]);

  const handleCapture = () => {
    const canvas = document.createElement("canvas");
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    const imageData = canvas.toDataURL("image/png");
    onCapture(imageData);
  };

  const toggleCamera = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="w-full max-w-xs aspect-video rounded-lg overflow-hidden shadow-md border-2 border-gray-300">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex space-x-4">
        <Button onClick={handleCapture}>
          <CameraIcon className="mr-2 h-4 w-4" />
          Capture
        </Button>
        <Button variant="outline" onClick={toggleCamera}>
          <RotateCwIcon className="mr-2 h-4 w-4" />
          Switch Camera
        </Button>
      </div>
    </div>
  );
};

export default Camera;

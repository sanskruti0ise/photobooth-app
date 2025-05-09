import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { CameraIcon } from "lucide-react";

const Camera = () => {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState("none");

  useEffect(() => {
    const getCameraStream = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (error) {
        console.error("Error accessing camera:", error);
      }
    };

    getCameraStream();

    return () => {
      // Cleanup
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100 space-y-6">
      {/* Responsive Video Container */}
      <div className="relative w-full max-w-md aspect-video rounded-xl overflow-hidden shadow-lg border-4 border-white bg-black">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-300 ${
            selectedFilter === "sepia"
              ? "filter sepia"
              : selectedFilter === "grayscale"
              ? "filter grayscale"
              : ""
          }`}
        />
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-4">
        <Button onClick={() => setSelectedFilter("none")}>Normal</Button>
        <Button onClick={() => setSelectedFilter("sepia")}>Sepia</Button>
        <Button onClick={() => setSelectedFilter("grayscale")}>Grayscale</Button>
      </div>

      {/* Capture Button */}
      <Button size="lg" className="rounded-full p-6 bg-blue-600 text-white shadow-md hover:bg-blue-700">
        <CameraIcon className="w-6 h-6" />
      </Button>
    </div>
  );
};

export default Camera;

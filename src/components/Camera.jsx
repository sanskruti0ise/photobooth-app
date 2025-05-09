import { useRef, useState, useEffect } from "react";

function Camera() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [photos, setPhotos] = useState([]);
  const [message, setMessage] = useState("");
  const [countdown, setCountdown] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("");
  const [filterLocked, setFilterLocked] = useState(false);
  const photoStripRef = useRef(null);
  const audioRef = useRef(new Audio("/photobooth-app/click-sound.mp3"));

  const [isCapturing, setIsCapturing] = useState(false); // New state to manage camera activation

  // Use effect to start and stop camera stream based on isCapturing state
  useEffect(() => {
    let stream;

    const getCameraStream = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current && stream && isCapturing) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      } catch (error) {
        console.error("Error accessing webcam:", error);
      }
    };

    if (isCapturing) {
      getCameraStream();
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop()); // Stop the stream when camera is not capturing
      }
    };
  }, [isCapturing]);

  const delay = (ms) => new Promise((res) => setTimeout(res, ms));

  const startPhotoStrip = async () => {
    if (isRunning || !selectedFilter) return;
    setPhotos([]);
    setIsRunning(true);
    setFilterLocked(true);
    setIsCapturing(true); // Start the camera stream when taking photos

    for (let i = 0; i < 4; i++) {
      setMessage("Get ready!");
      await delay(1000);

      for (let sec = 3; sec > 0; sec--) {
        setMessage(sec.toString());
        setCountdown(sec);
        await delay(1000);
      }

      setCountdown(null);
      takePhoto();

      setMessage("📸 Photo clicked!");
      await delay(1000);

      if (i < 3) {
        setMessage("Next photo coming...");
        await delay(1500);
      }
    }

    setMessage("All done!");
    setIsRunning(false);
    setIsCapturing(false); // Stop the camera after photo strip is done

    // Scroll to the photo strip
    if (photoStripRef.current) {
      photoStripRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const takePhoto = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");

    if (selectedFilter === "sepia") {
      ctx.filter = "sepia(1)";
    } else if (selectedFilter === "grayscale") {
      ctx.filter = "grayscale(1)";
    } else {
      ctx.filter = "none";
    }

    ctx.drawImage(video, 0, 0);
    const image = canvas.toDataURL("image/png");
    setPhotos((prev) => [...prev, image]);

    // Play the click sound
    audioRef.current.play();
  };

  const resetStrip = () => {
    setPhotos([]);
    setMessage("");
    setCountdown(null);
    setIsRunning(false);
    setSelectedFilter("");
    setFilterLocked(false);
    setIsCapturing(false); // Ensure camera is stopped when reset
  };

  const downloadStrip = async () => {
    const stripCanvas = document.createElement("canvas");
    const imgElements = [];

    for (let src of photos) {
      const img = new Image();
      img.src = src;
      await new Promise((res) => (img.onload = res));
      imgElements.push(img);
    }

    const width = imgElements[0].width;
    const height = imgElements[0].height;
    stripCanvas.width = width + 40;
    stripCanvas.height = (height * 4) + 60;

    const ctx = stripCanvas.getContext("2d");
    ctx.fillStyle = "#5F3451"; 
    ctx.fillRect(0, 0, stripCanvas.width, stripCanvas.height);

    imgElements.forEach((img, i) => {
      const yPosition = i * (height + 10) + 20;
      ctx.drawImage(img, 20, yPosition);
    });

    ctx.font = "bold 14px Poppins";
    ctx.fillStyle = "#fff";
    const date = new Date().toLocaleDateString();
    ctx.fillText(`Date: ${date}`, 20, height * 4 + 35);

    const link = document.createElement("a");
    link.download = "photo-strip.png";
    link.href = stripCanvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-[#F0E6D6] font-poppins pt-4 px-4">
      
      <div className="relative flex flex-col items-center justify-center w-full max-w-md">
        {isCapturing && (
          <video
            ref={videoRef}
            autoPlay
            className={`rounded-xl shadow-xl w-full h-auto border-8 border-white object-cover transition-all duration-300 ${selectedFilter === "sepia" ? "filter sepia" : selectedFilter === "grayscale" ? "filter grayscale" : ""}`}
          />
        )}

        {countdown !== null && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-6xl font-extrabold animate-ping">
            {countdown}
          </div>
        )}

        {message && countdown === null && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-xl font-bold animate-bounce">
            {message}
          </div>
        )}
      </div>

      {/* Filter Selection */}
      <div className="flex gap-4 mt-3 flex-wrap justify-center">
        <button
          onClick={() => setSelectedFilter("sepia")}
          disabled={filterLocked}
          className={`px-4 py-2 bg-[#B899A8] text-white font-bold rounded-full shadow transition duration-200 ${filterLocked ? "opacity-50 cursor-not-allowed" : "hover:scale-105"}`}
        >
          Sepia
        </button>
        <button
          onClick={() => setSelectedFilter("grayscale")}
          disabled={filterLocked}
          className={`px-4 py-2 bg-[#B899A8] text-white font-bold rounded-full shadow transition duration-200 ${filterLocked ? "opacity-50 cursor-not-allowed" : "hover:scale-105"}`}
        >
          B&W
        </button>
        <button
          onClick={() => setSelectedFilter("")}
          disabled={filterLocked}
          className={`px-4 py-2 bg-[#B899A8] text-white font-bold rounded-full shadow transition duration-200 ${filterLocked ? "opacity-50 cursor-not-allowed" : "hover:scale-105"}`}
        >
          Normal
        </button>
      </div>

      <button
        onClick={startPhotoStrip}
        disabled={isRunning || !selectedFilter}
        className="mt-2 px-6 py-2 bg-[#B899A8] text-white font-extrabold rounded-xl shadow-md hover:shadow-lg hover:brightness-110 transition duration-300"
      >
        📸 Start Photo Strip
      </button>

      <canvas ref={canvasRef} className="hidden" />

      {/* Photo Strip Display */}
      {photos.length === 4 && (
        <div ref={photoStripRef} className="mt-6 mb-10 bg-white px-4 pt-6 pb-4 rounded-lg shadow-2xl w-[160px] animate-drop-in">
          <h2 className="text-center text-lg font-extrabold text-[#5F3451] mb-4">Your Strip</h2>
          <div className="flex flex-col items-center gap-2">
            {photos.map((photo, index) => (
              <div
                key={index}
                className="bg-[#5F3451] p-1 shadow rounded border border-gray-200 w-full"
              >
                <img
                  src={photo}
                  alt={`Photo ${index + 1}`}
                  className="w-full object-cover rounded"
                />
              </div>
            ))}
          </div>

          <div className="mt-4 text-center text-sm text-gray-600 font-medium">
            <p>Date: {new Date().toLocaleDateString()}</p>
            <button
              onClick={downloadStrip}
              className="mt-2 px-4 py-1 bg-[#5F3451] text-white font-bold rounded-full"
            >
              Download
            </button>
            <button
              onClick={resetStrip}
              className="mt-2 px-4 py-1 bg-[#B899A8] text-white font-bold rounded-full"
            >
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Camera;

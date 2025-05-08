import { useRef, useState, useEffect } from "react";

function Camera() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const photoStripRef = useRef(null);
  const [photos, setPhotos] = useState([]);
  const [message, setMessage] = useState("");
  const [countdown, setCountdown] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("");
  const [filterLocked, setFilterLocked] = useState(false);

  const clickSound = new Audio("/click-sound.mp3"); // Ensure this file exists in the public folder

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => videoRef.current.srcObject = stream)
      .catch(err => console.error("Camera error:", err));
  }, []);

  const delay = (ms) => new Promise(res => setTimeout(res, ms));

  const startPhotoStrip = async () => {
    if (isRunning || !selectedFilter) return;
    setPhotos([]);
    setIsRunning(true);
    setFilterLocked(true);

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

    ctx.filter =
      selectedFilter === "sepia" ? "sepia(1)" :
      selectedFilter === "grayscale" ? "grayscale(1)" :
      "none";

    ctx.drawImage(video, 0, 0);
    const image = canvas.toDataURL("image/png");
    clickSound.currentTime = 0;
    clickSound.play();
    setPhotos(prev => [...prev, image]);
  };

  const resetStrip = () => {
    setPhotos([]);
    setMessage("");
    setCountdown(null);
    setIsRunning(false);
    setSelectedFilter("");
    setFilterLocked(false);
  };

  const downloadStrip = async () => {
    const stripCanvas = document.createElement("canvas");
    const imgElements = [];

    for (let src of photos) {
      const img = new Image();
      img.src = src;
      await new Promise(res => img.onload = res);
      imgElements.push(img);
    }

    const width = imgElements[0].width;
    const height = imgElements[0].height;
    stripCanvas.width = width + 40;
    stripCanvas.height = height * 4 + 60;

    const ctx = stripCanvas.getContext("2d");
    ctx.fillStyle = "#9b4dca";
    ctx.fillRect(0, 0, stripCanvas.width, stripCanvas.height);

    imgElements.forEach((img, i) => {
      const y = i * (height + 10) + 20;
      ctx.drawImage(img, 20, y);
    });

    ctx.font = "bold 14px Poppins";
    ctx.fillStyle = "#fff";
    ctx.fillText(`Date: ${new Date().toLocaleDateString()}`, 20, height * 4 + 35);

    const link = document.createElement("a");
    link.download = "photo-strip.png";
    link.href = stripCanvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-br from-purple-200 to-pink-200 font-poppins pt-4 px-4">
      <div className="relative w-full max-w-md flex flex-col items-center">
        <video
          ref={videoRef}
          autoPlay
          className={`rounded-xl shadow-xl w-full border-8 border-white object-cover transition-all duration-300 ${selectedFilter === "sepia" ? "filter sepia" : selectedFilter === "grayscale" ? "filter grayscale" : ""}`}
        />
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

      <div className="flex gap-4 mt-3 flex-wrap justify-center">
        {["sepia", "grayscale", ""].map((filter, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedFilter(filter)}
            disabled={filterLocked}
            className={`px-4 py-2 text-white font-bold rounded-full shadow transition duration-200 ${
              filterLocked ? "opacity-50 cursor-not-allowed" : "hover:scale-105"
            } ${
              filter === "sepia"
                ? "bg-gradient-to-r from-orange-400 via-yellow-300 to-orange-500"
                : filter === "grayscale"
                ? "bg-gradient-to-r from-gray-600 via-gray-500 to-gray-700"
                : "bg-gradient-to-r from-blue-500 via-blue-400 to-blue-600"
            }`}
          >
            {filter === "" ? "Normal" : filter.charAt(0).toUpperCase() + filter.slice(1)}
          </button>
        ))}
      </div>

      <button
        onClick={startPhotoStrip}
        disabled={isRunning || !selectedFilter}
        className="mt-2 px-6 py-2 bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 text-white font-extrabold rounded-xl shadow-md hover:shadow-lg hover:brightness-110 transition duration-300"
      >
        📸 Start Photo Strip
      </button>

      <canvas ref={canvasRef} className="hidden" />

      {photos.length === 4 && (
        <div ref={photoStripRef} className="mt-6 mb-10 bg-white px-4 pt-6 pb-4 rounded-lg shadow-2xl w-[160px] animate-drop-in">
          <h2 className="text-center text-lg font-extrabold text-purple-700 mb-4">Your Strip</h2>
          <div className="flex flex-col items-center gap-2">
            {photos.map((photo, idx) => (
              <div key={idx} className="bg-purple-600 p-1 shadow rounded border border-gray-200 w-full">
                <img src={photo} alt={`Photo ${idx + 1}`} className="w-full object-cover rounded" />
              </div>
            ))}
          </div>
          <div className="mt-4 text-center text-sm text-gray-600 font-medium">
            <p>Date: {new Date().toLocaleDateString()}</p>
          </div>
          <button
            onClick={resetStrip}
            className="mt-6 w-full px-4 py-2 bg-gradient-to-r from-red-500 via-red-400 to-red-600 text-white font-bold rounded-xl shadow hover:shadow-lg hover:brightness-110 transition duration-300"
          >
            🔄 Start Over
          </button>
          <button
            onClick={downloadStrip}
            className="mt-4 w-full px-4 py-2 bg-gradient-to-r from-green-500 via-green-400 to-green-600 text-white font-bold rounded-xl shadow hover:shadow-lg hover:brightness-110 transition duration-300"
          >
            ⬇️ Download Strip
          </button>
        </div>
      )}
    </div>
  );
}

export default Camera;

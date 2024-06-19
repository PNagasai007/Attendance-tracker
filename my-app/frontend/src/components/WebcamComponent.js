import React, { useState, useRef } from "react";
import Webcam from "react-webcam";

const WebcamComponent = ({ onDataReceived, noface, handlelesstime, setLoading }) => {
  const [image, setImage] = useState(null);
  const [isWebcamOn, setIsWebcamOn] = useState(false);
  const webcamRef = useRef(null);

  const handleCapture = async () => {
    setLoading(true);  // Set loading state to true
    const screenshot = webcamRef.current.getScreenshot();
    setImage(screenshot);
    await sendImageToServer(screenshot);
  };

  const sendImageToServer = async (image) => {
    try {
      const response = await fetch("http://127.0.0.1:5000/recognize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: image.split(",")[1] }),
      });

      const data = await response.json();
      console.log("Data received from server:", data);
      onDataReceived(data);

      if (data.attendance_status === "Attendance marked successfully") {
        noface(true);
      } else if (data.attendance_status === "No face recognized") {
        noface(false);
      } else {
        handlelesstime(true);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);  // Set loading state to false
    }
  };

  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: "user",
  };

  return (
    <div className="card">
      <div className="card-body card__content text-center">
        <Webcam
          audio={false}
          height={350}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          width={350}
          videoConstraints={videoConstraints}
          onUserMedia={() => setIsWebcamOn(true)}
          onUserMediaError={() => setIsWebcamOn(false)}
          className="card-img-top"
        />
        <button onClick={handleCapture} disabled={!isWebcamOn}>
          Capture
        </button>
      </div>
    </div>
  );
};

export default WebcamComponent;

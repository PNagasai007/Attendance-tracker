import React, { useState, useRef } from "react";
import Webcam from "react-webcam";
import axios from "axios";
import { useNavigate } from "react-router-dom";
const Form = () => {
  const [isWebcamOpen, setIsWebcamOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [studentId, setStudentId] = useState("");
  const [studentName, setStudentName] = useState("");
  const webcamRef = useRef(null);

  const handleCapture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setCapturedImage(imageSrc);
    setIsWebcamOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!capturedImage || !studentId || !studentName) {
      alert("Please fill all fields and capture the image");
      return;
    }

    const data = {
      student_id: studentId,
      student_name: studentName,
      image: capturedImage.split(",")[1], // Strip the base64 prefix
    };

    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/add_student",
        data
      );
      alert(response.data.message);
    } catch (error) {
      console.error("Error submitting the form:", error);
      alert("Failed to submit the form");
    }
  };
  const navigate = useNavigate();
  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100">
      <button className="register-btn " onClick={() => navigate("/")}>
        back
      </button>
      <form
        className="form bg-dark text-white p-4 rounded shadow w-200"
        onSubmit={handleSubmit}
      >
        <p className="title h4 mb-3">Register</p>

        <label className="mb-3">
          <input
            className="input form-control bg-secondary text-white"
            type="text"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            required
          />
          <span>Student id</span>
        </label>

        <label className="mb-3">
          <input
            className="input form-control bg-secondary text-white"
            type="text"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            required
          />
          <span>Student name</span>
        </label>

        <button
          type="button"
          className="w-100 mb-3"
          onClick={() => setIsWebcamOpen(true)}
        >
          Open Webcam
        </button>

        {isWebcamOpen && (
          <div className="d-flex flex-column align-items-center">
            <Webcam
              audio={false}
              height={350}
              width={350}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className="mb-2"
            />
            <button type="button" onClick={handleCapture}>
              Capture
            </button>
            <br></br>
          </div>
        )}

        {capturedImage && (
          <div className="mb-3">
            <img src={capturedImage} alt="Captured" className="img-fluid" />
          </div>
        )}

        <button type="submit" className="submit w-100">
          Register
        </button>
      </form>
    </div>
  );
};

export default Form;

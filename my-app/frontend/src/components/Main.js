import React, { useState } from "react";
import WebcamComponent from "./WebcamComponent";
import AttendanceStatus from "./AttendenceStatus";
import "./Main.css"; // Import the custom CSS file
import { useNavigate } from "react-router-dom";

const Main = () => {
  const [studentData, setStudentData] = useState(null);
  const [face, setFace] = useState(false);
  const [lesstime, setlesstime] = useState(false);
  const [loading, setLoading] = useState(false); // Add loading state

  const handleDataReceived = (data) => {
    setStudentData(data);
    setlesstime(false); // Reset lesstime when new data is received
    setLoading(false); // Stop loading when data is received
  };

  const noface = (data) => {
    setFace(data);
  };

  const handlelesstime = (data) => {
    setlesstime(data);
    setLoading(false); // Stop loading when lesstime is set
  };

  const navigate = useNavigate();
  return (
    <div className="container">
      <div className="d-flex flex-column align-items-center justify-content-center min-vh-100">
        <button className="register-btn" onClick={() => navigate("/register")}>
          Register
        </button>
        <h1 className="text-center headd">Attendance</h1>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-6">
              <WebcamComponent
                onDataReceived={handleDataReceived}
                noface={noface}
                handlelesstime={handlelesstime}
                setLoading={setLoading} // Pass setLoading to WebcamComponent
              />
            </div>
            <div className="col-md-6">
              <AttendanceStatus
                key={studentData ? studentData.student_id : "default"} // Adding key
                studentData={studentData}
                face={face}
                lesstime={lesstime}
                loading={loading} // Pass loading to AttendanceStatus
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Main;

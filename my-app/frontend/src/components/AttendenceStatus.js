import React, { useEffect, useState } from "react";

const AttendanceStatus = ({ studentData, face, lesstime, loading }) => {
  const [displayedData, setDisplayedData] = useState(studentData);

  useEffect(() => {
    setDisplayedData(studentData); // Update displayedData when studentData changes
  }, [studentData]);

  useEffect(() => {
    if (displayedData) {
      const timer = setTimeout(() => {
        setDisplayedData(null); // Reset displayedData to null after 5 seconds
      }, 5000); // 5 seconds in milliseconds

      return () => clearTimeout(timer); // Clear the timer on component unmount or when displayedData changes
    }
  }, [displayedData]);

  useEffect(() => {
    if (lesstime && displayedData) {
      setDisplayedData(null);
      alert(`Try after some time in ${displayedData.timetotake} seconds`);
    }
  }, [lesstime, displayedData]);

  return (
    <div className="card">
      <div className="card-body card__content">
        <h5 className="card-title mb-4 text-center">Attendance Status</h5>

        {loading ? (
          <div className="loader-container d-flex align-items-center justify-content-center mt-5">
            <div className="loader">
              <span className="loader-text">Loading</span>
              <div className="load"></div>
            </div>
          </div>
        ) : displayedData &&
          displayedData["attendance_status"] === "No face recognized" &&
          face === false ? (
          <p>No face detected</p>
        ) : displayedData ? (
          <div>
            <p>Student ID: {displayedData.student_id}</p>
            <p>Name: {displayedData.student_info.name}</p>
            <p>
              Total Attendance: {displayedData.student_info.total_attendance}
            </p>
            <p>
              Last Attendance: {displayedData.student_info.last_attendance_time}
            </p>
            <img src={displayedData.img_url} alt="Student" />
          </div>
        ) : (
          <p>Please click on capture for attendance</p>
        )}
      </div>
    </div>
  );
};

export default AttendanceStatus;

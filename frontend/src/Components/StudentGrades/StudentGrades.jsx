import React, { useState, useEffect } from "react";
import "./StudentGrades.css"; // Ensure you have your CSS file imported for styling
import { useNavigate } from "react-router-dom";
import axios from "axios";
/**check if the email is in the students table first because its causing 404 */
function StudentGrades() {
  const navigate = useNavigate();
  const [studentsData, setStudentsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const email = localStorage.getItem("email");
        const response = await axios.get(
          `http://localhost:8081/api/students?email=${email}`
        );
        setStudentsData(response.data);
        setLoading(false);
      } catch (error) {
        setError(error);
        setLoading(false);
      }
    };

    fetchStudentData();
  }, []);

  const handleBack = () => {
    navigate("/student");
  };

  const calculateFinalGrade = (grades) => {
    if (!grades) return null;

    const gradesValues = Object.values(grades).map(parseFloat);
    const sum = gradesValues.reduce((acc, curr) => acc + curr, 0);
    const finalGrade = sum / gradesValues.length;

    return finalGrade.toFixed(2);
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div className="student-grades">
      {studentsData.map((student, index) => (
        <div key={index} className="card">
          <div className="card-body">
            <h5 className="card-title">Student Details</h5>
            <div className="card-text">
              <p>
                <strong>First Name:</strong> {student.firstName}
              </p>
              <p>
                <strong>Last Name:</strong> {student.lastName}
              </p>
              <p>
                <strong>Class ID:</strong> {student.classId}
              </p>
              <div className="grades-list">
                <p>
                  <strong>Grades:</strong>
                </p>
                <ul className="list-group">
                  {Object.keys(student.grades).map((key) => (
                    <li key={key} className="list-group-item">
                      <strong>{key}:</strong> {student.grades[key]}
                    </li>
                  ))}
                </ul>
              </div>
              <p>
                <strong>Final Grade:</strong>{" "}
                {calculateFinalGrade(student.grades)}
              </p>
            </div>
          </div>
        </div>
      ))}
      <button className="back-button" onClick={handleBack}>
        Back
      </button>
    </div>
  );
}

export default StudentGrades;

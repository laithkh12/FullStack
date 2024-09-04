import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./StudentHomeWorks.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
function StudentHomeWorks() {
  const navigate = useNavigate();
  const handleBack = () => {
    localStorage.removeItem("selectedHomework"); // Clear the selectedHomework from localStorage
    toast.dismiss();
    navigate("/student"); // Navigate to the student page
  };

  const [classId, setClassId] = useState(null);
  const [homeworks, setHomeworks] = useState([]);
  const [selectedHomework, setSelectedHomework] = useState(() => {
    // Retrieve the selected homework from localStorage if it exists
    return localStorage.getItem("selectedHomework") || null;
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStudentClass = async () => {
      try {
        const email = localStorage.getItem("email");
        if (!email) {
          throw new Error("No email found in local storage");
        }
        const response = await axios.get(`http://localhost:8081/api/students`, {
          params: { email },
        });
        const student = response.data[0];
        setClassId(student.classId);
      } catch (error) {
        setError("Error fetching student data.");
        console.error("Error fetching student data:", error);
      }
    };

    const fetchHomeworks = async () => {
      if (classId) {
        try {
          const response = await axios.get(
            `http://localhost:8081/api/homeworks/${classId}`
          );
          setHomeworks(response.data);
        } catch (error) {
          setError("Error fetching homeworks.");
          console.error("Error fetching homeworks:", error);
        }
      }
    };

    fetchStudentClass();
    fetchHomeworks();
    setLoading(false);
  }, [classId]);

  useEffect(() => {
    // Save the selected homework to localStorage whenever it changes
    if (selectedHomework !== null) {
      localStorage.setItem("selectedHomework", selectedHomework);
    }
  }, [selectedHomework]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async () => {
    if (selectedHomework && file) {
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("homeworkId", selectedHomework);

        await axios.post("http://localhost:8081/api/submitHomework", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        toast.success("Homework submitted successfully!");
        setFile(null); // Clear the file input after successful submission
      } catch (error) {
        console.error("Error submitting homework:", error);
        toast.error("Error submitting homework:");
      }
    } else {
      toast.warn("Please select a homework and a file.");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="student-home-works">
      <button className="back-button" onClick={handleBack}>
        Back
      </button>
      <h1>Student Homeworks</h1>
      <div className="select-wrapper">
        <select
          onChange={(e) => setSelectedHomework(e.target.value)}
          value={selectedHomework || ""}
        >
          <option value="" disabled>
            Select Homework
          </option>
          {homeworks.map((hw) => (
            <option key={hw.id} value={hw.id}>
              {hw.title} (Due: {hw.submission_date})
            </option>
          ))}
        </select>
      </div>
      {selectedHomework && (
        <div>
          <div className="file-upload">
            <input type="file" onChange={handleFileChange} />
          </div>
          <button onClick={handleSubmit}>Submit Homework</button>
        </div>
      )}
    </div>
  );
}

export default StudentHomeWorks;

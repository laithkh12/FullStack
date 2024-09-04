import React, { useState, useEffect } from "react";
import "./AttendanceCheck.css";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // Import Axios
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
/**
 * AttendanceCheck Component
 *
 * This component allows teachers to select a class and mark attendance for the students.
 * It fetches classes and students data from the backend and allows the teacher to save attendance records.
 *
 * @component
 */
function AttendanceCheck() {
  const navigate = useNavigate();
  /**
   * State to hold the list of classes fetched from the server
   * @type {Array}
   */
  const [classes, setClasses] = useState([]);
  /**
   * State to hold the list of students in the selected class
   * @type {Array}
   */
  const [students, setStudents] = useState([]);
  /**
   * State to hold the selected class ID
   * @type {string|null}
   */
  const [selectedClass, setSelectedClass] = useState(
    localStorage.getItem("selectedClass") || null
  );

  /**
   * Fetches the list of classes taught by the logged-in teacher from the backend server when the component mounts
   */
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const email = localStorage.getItem("email");
        const response = await axios.get(
          `http://localhost:8081/api/classes/${email}`
        ); // Use Axios
        setClasses(response.data);
      } catch (error) {
        console.error("Error fetching classes:", error.message);
      }
    };

    fetchClasses();
  }, []);

  /**
   * Loads students from localStorage or fetches them from the server when a class is selected
   */
  useEffect(() => {
    const savedStudents = localStorage.getItem("students");
    if (selectedClass) {
      if (savedStudents) {
        setStudents(JSON.parse(savedStudents));
      } else {
        handleClassSelect(selectedClass);
      }
    }
  }, [selectedClass]);

  /**
   * Updates the students in localStorage whenever the students state changes
   */
  useEffect(() => {
    localStorage.setItem("students", JSON.stringify(students));
  }, [students]);

  /**
   * Navigates back to the teacher's page and clears the local storage
   */
  const handleBack = () => {
    localStorage.removeItem("selectedClass");
    localStorage.removeItem("students");
    toast.dismiss();
    navigate("/teacher");
  };

  /**
   * Handles the selection of a class and fetches the list of students for the selected class
   *
   * @param {string} classId - The ID of the selected class
   */
  const handleClassSelect = async (classId) => {
    try {
      const response = await axios.get(
        `http://localhost:8081/api/students/${classId}`
      ); // Use Axios
      const studentsWithStatus = response.data.map((student) => ({
        ...student,
        status: "select", // Default status
      }));
      setStudents(studentsWithStatus);
      setSelectedClass(classId); // Set the selected class ID
      localStorage.setItem("selectedClass", classId);
      localStorage.setItem("students", JSON.stringify(studentsWithStatus));
    } catch (error) {
      console.error("Error fetching students:", error.message);
    }
  };

  /**
   * Handles the saving of attendance records to the backend server
   */
  const handleSaveAttendance = async () => {
    try {
      if (!selectedClass) {
        console.error("No class selected");
        return;
      }

      const date = new Date().toISOString().slice(0, 10); // Get today's date in 'YYYY-MM-DD' format
      const attendanceRecords = students.map((student) => ({
        class_id: selectedClass,
        student_id: student.id,
        status: student.status, // Set the status to the selected value for each student
        date: date,
      }));

      const response = await axios.post(
        "http://localhost:8081/api/saveAttendance",
        attendanceRecords
      ); // Use Axios

      if (response.status !== 200) {
        toast.error("Failed to save attendance");
        throw new Error("Failed to save attendance");
      }

      console.log(response.data.message); // Show success message
      toast.success("attendance saved sucessfully");
    } catch (error) {
      console.error("Error saving attendance:", error.message);
      toast.error("Error saving attendance");
    }
  };

  return (
    <div className="attendance">
      <button className="back-button" onClick={handleBack}>
        Back
      </button>
      <select
        value={selectedClass || ""}
        onChange={(e) => handleClassSelect(e.target.value)}
      >
        <option>Select a class</option>
        {classes.map((cls) => (
          <option key={cls.id} value={cls.id}>
            {cls.cname}
          </option>
        ))}
      </select>

      {selectedClass && students.length > 0 && (
        <div>
          <h2>Students</h2>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Attendance</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id}>
                  <td>
                    {student.firstName} {student.lastName}
                  </td>
                  <td>
                    <select
                      value={student.status}
                      onChange={(e) => {
                        const updatedStudents = [...students];
                        updatedStudents.find(
                          (s) => s.id === student.id
                        ).status = e.target.value;
                        setStudents(updatedStudents);
                      }}
                    >
                      <option value="select">select</option>
                      <option value="here">Here</option>
                      <option value="not_here">Not Here</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={handleSaveAttendance}>Save Attendance</button>
        </div>
      )}
    </div>
  );
}

export default AttendanceCheck;

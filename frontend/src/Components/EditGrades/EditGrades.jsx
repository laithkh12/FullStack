import React, { useState, useEffect } from "react";
import "./EditGrades.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
/**
 * EditGrades Component
 *
 * This component allows a teacher to edit grades for students in a selected class.
 * It fetches class information and student data from the backend, displays student grades in a table,
 * allows grade modification, and updates grades back to the server.
 *
 * @component
 */
function EditGrades() {
  const navigate = useNavigate();
  /**
   * State to hold the list of classes fetched from the server
   * @type {Array}
   */
  const [classes, setClasses] = useState([]);
  /**
   * State to hold the ID of the selected class
   * @type {string}
   */
  const [selectedClass, setSelectedClass] = useState("");
  /**
   * State to hold the list of students in the selected class
   * @type {Array}
   */
  const [students, setStudents] = useState([]);
  /**
   * State to hold updated grades temporarily before saving
   * @type {Object}
   */
  const [updatedGrades, setUpdatedGrades] = useState({});

  /**
   * Navigates back to the teacher's page
   */
  const handleBack = () => {
    toast.dismiss();
    navigate("/teacher");
  };

  /**
   * Handles the change event for the class selection dropdown
   *
   * @param {Event} e - The event object
   */
  const handleClassChange = (e) => {
    const classId = e.target.value;
    setSelectedClass(classId);
  };

  /**
   * Effect hook to fetch classes taught by the logged-in teacher when the component mounts
   */
  useEffect(() => {
    const email = localStorage.getItem("email");
    if (email) {
      axios
        .get(`http://localhost:8081/api/classes/${email}`)
        .then((response) => {
          setClasses(response.data);
        })
        .catch((error) => {
          console.error("Error fetching classes:", error);
        });
    }
  }, []);

  /**
   * Effect hook to fetch students when the selected class changes
   */
  useEffect(() => {
    if (selectedClass) {
      axios
        .get(`http://localhost:8081/api/students/${selectedClass}`)
        .then((response) => {
          setStudents(response.data);
        })
        .catch((error) => {
          console.error("Error fetching students:", error);
        });
    }
  }, [selectedClass]);

  /**
   * Handles the change event for grade inputs and updates the temporary state of updated grades
   *
   * @param {string} studentId - ID of the student
   * @param {string} gradeType - Type of the grade (task)
   * @param {string} value - Updated grade value
   */
  const handleGradeChange = (studentId, gradeType, value) => {
    setUpdatedGrades((prevGrades) => ({
      ...prevGrades,
      [studentId]: {
        ...prevGrades[studentId],
        [gradeType]: value,
      },
    }));
  };

  /**
   * Handles saving updated grades for a student to the backend
   *
   * @param {string} studentId - ID of the student
   */
  const handleSave = (studentId) => {
    const student = students.find((s) => s.id === studentId);
    const updatedStudentGrades = {
      ...JSON.parse(student.grades),
      ...updatedGrades[studentId],
    };

    axios
      .put(`http://localhost:8081/api/students/${studentId}`, {
        grades: updatedStudentGrades,
      })
      .then((response) => {
        setStudents((prevStudents) =>
          prevStudents.map((s) =>
            s.id === studentId
              ? { ...s, grades: JSON.stringify(updatedStudentGrades) }
              : s
          )
        );
        setUpdatedGrades((prevGrades) => {
          const { [studentId]: _, ...rest } = prevGrades;
          return rest;
        });
        toast.success("Grades updated successfully!");
      })
      .catch((error) => {
        console.error("Error updating grades:", error);
        toast.error("Failed to update grades");
      });
  };

  return (
    <div className="edit-grade">
      <h1>Edit Grades</h1>
      <select value={selectedClass} onChange={handleClassChange}>
        <option value="">Select a class</option>
        {classes.map((classItem) => (
          <option key={classItem.id} value={classItem.id}>
            {classItem.cname}
          </option>
        ))}
      </select>
      <table className="students-table">
        <thead>
          <tr>
            <th>First Name</th>
            <th>Last Name</th>
            {students.length > 0 &&
              Object.keys(JSON.parse(students[0].grades)).map((task) => (
                <th key={task}>{task}</th>
              ))}
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => {
            const grades = JSON.parse(student.grades);
            return (
              <tr key={student.id}>
                <td>{student.firstName}</td>
                <td>{student.lastName}</td>
                {Object.keys(grades).map((task) => (
                  <td key={task}>
                    <input
                      type="number"
                      value={updatedGrades[student.id]?.[task] || grades[task]}
                      onChange={(e) =>
                        handleGradeChange(student.id, task, e.target.value)
                      }
                    />
                  </td>
                ))}
                <td>
                  <button
                    className="save-button"
                    onClick={() => handleSave(student.id)}
                  >
                    Save
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <button className="back-button" onClick={handleBack}>
        Back
      </button>
    </div>
  );
}

export default EditGrades;

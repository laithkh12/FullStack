import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./AddStudent.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
/**
 * AddStudent Component
 *
 * This component renders a form to add new students and their associated grades for tasks in a selected class.
 * It fetches available classes, allows the user to input student details, select a class, and input grades for tasks.
 * The data is then submitted to a backend server.
 *
 * @component
 */

function AddStudent() {
  const navigate = useNavigate();

  /**
   * State to hold the student form data
   * @type {Object}
   */
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: localStorage.getItem("email") || "",
    age: "",
    selectedClass: "",
    tasks: [],
    grades: {},
  });

  /**
   * State to hold the list of classes fetched from the server
   * @type {Array}
   */
  const [classes, setClasses] = useState([]);

  /**
   * Fetches the list of classes from the backend server when the component mounts
   */
  useEffect(() => {
    fetchClasses();
  }, []);

  /**
   * Fetches the classes from the backend server
   */
  const fetchClasses = async () => {
    try {
      const response = await axios.get("http://localhost:8081/api/classes");
      setClasses(response.data);
    } catch (error) {
      console.error("Error fetching classes:", error);
    }
  };

  /**
   * Handles the change event for the class selection dropdown
   * Fetches the tasks for the selected class from the backend server
   *
   * @param {Event} e - The event object
   */
  const handleClassChange = async (e) => {
    const classId = e.target.value;
    setFormData({ ...formData, selectedClass: classId });
    if (classId) {
      try {
        const response = await axios.get(
          `http://localhost:8081/api/tasks/${classId}`
        );
        setFormData({
          ...formData,
          tasks: response.data,
          selectedClass: classId,
        }); // Ensure selectedClass is correctly updated
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    } else {
      setFormData({ ...formData, tasks: [], selectedClass: "" });
    }
  };

  /**
   * Handles the change event for the grade input fields
   * Updates the grades state for the corresponding task
   *
   * @param {number} taskId - The ID of the task
   * @param {Event} e - The event object
   */
  const handleGradeChange = (taskId, e) => {
    const newGrades = { ...formData.grades, [taskId]: e.target.value };
    setFormData({ ...formData, grades: newGrades });
  };

  /**
   * Handles the form submission to save the student data to the backend server
   *
   * @param {Event} e - The event object
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Format grades to ensure no empty values
    const formattedGrades = {};
    formData.tasks.forEach((task) => {
      const taskKey = `${task.task_name}-${task.percentage}`;
      formattedGrades[taskKey] =
        formData.grades[task.id] && formData.grades[task.id].trim()
          ? formData.grades[task.id]
          : "0"; // Convert empty grades to "0"
    });

    try {
      const response = await axios.post("http://localhost:8081/api/students", {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        age: formData.age,
        classId: formData.selectedClass, // Ensure classId is included
        grades: formattedGrades,
      });
      console.log("Student added successfully:", response.data);
      toast.success("Student added successfully");
      // Reset form data after successful submission
      setFormData({
        firstName: "",
        lastName: "",
        email: localStorage.getItem("email") || "",
        age: "",
        selectedClass: "",
        tasks: [],
        grades: {},
      });
    } catch (error) {
      console.error("Error adding student:", error);
      toast.error("Error adding student");
    }
  };

  /**
   * Navigates back to the teacher's page
   */
  const handleBack = () => {
    toast.dismiss();
    navigate("/teacher");
  };
  return (
    <div className="add-student">
      <h1>Add Student</h1>
      <button className="back-button" onClick={handleBack}>
        Back
      </button>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="firstName">First Name:</label>
          <input
            type="text"
            id="firstName"
            value={formData.firstName}
            onChange={(e) =>
              setFormData({ ...formData, firstName: e.target.value })
            }
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="lastName">Last Name:</label>
          <input
            type="text"
            id="lastName"
            value={formData.lastName}
            onChange={(e) =>
              setFormData({ ...formData, lastName: e.target.value })
            }
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="age">Age:</label>
          <input
            type="number"
            id="age"
            value={formData.age}
            onChange={(e) => setFormData({ ...formData, age: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="class">Class:</label>
          <select
            id="class"
            value={formData.selectedClass}
            onChange={handleClassChange}
          >
            <option value="">Select Class</option>
            {classes.map((classItem) => (
              <option key={classItem.id} value={classItem.id}>
                {classItem.cname}
              </option>
            ))}
          </select>
        </div>
        {formData.tasks.length > 0 && (
          <div className="tasks">
            <h2>Tasks:</h2>
            {formData.tasks.map((task) => (
              <div key={task.id} className="task">
                <label htmlFor={`grade-${task.id}`}>
                  {task.task_name}-{task.percentage}%:
                </label>
                <input
                  type="number"
                  id={`grade-${task.id}`}
                  value={formData.grades[task.id] || ""}
                  onChange={(e) => handleGradeChange(task.id, e)}
                />
              </div>
            ))}
          </div>
        )}
        <button type="submit">Save</button>
      </form>
    </div>
  );
}

export default AddStudent;

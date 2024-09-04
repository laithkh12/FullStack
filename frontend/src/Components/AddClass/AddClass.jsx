import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./AddClass.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/**
 * AddClass Component
 *
 * This component renders a form to add a new class and its associated tasks. It manages
 * form data and tasks using React state, persists data in session storage, and handles
 * form submission to a backend API.
 *
 * @component
 */
const AddClass = () => {
  /**
   * Initialize form data with saved state from session storage or default values
   *
   * @typedef {Object} FormData
   * @property {string} cname - Class name
   * @property {string} id - Class ID
   * @property {string} description - Class description
   * @property {string} teacher_email - Teacher's email
   */

  const navigate = useNavigate();

  const [formData, setFormData] = useState(() => {
    const savedFormData = sessionStorage.getItem("formData");
    return savedFormData
      ? JSON.parse(savedFormData)
      : {
          cname: "",
          id: "",
          description: "",
          teacher_email: localStorage.getItem("email") || "", // Fetch email from local storage
        };
  });

  const [tasks, setTasks] = useState(() => {
    const savedTasks = sessionStorage.getItem("tasks");
    return savedTasks ? JSON.parse(savedTasks) : [];
  });

  const [showTaskPopup, setShowTaskPopup] = useState(false);
  const [taskData, setTaskData] = useState({
    taskName: "",
    percentage: "",
  });

  /**
   * These hooks ensure that the state of tasks and formData is saved to session storage whenever it changes.
   */
  useEffect(() => {
    // Save tasks to session storage whenever they change
    sessionStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  /**
   * These hooks ensure that the state of tasks and formData is saved to session storage whenever it changes.
   */
  useEffect(() => {
    // Save formData to session storage whenever it changes
    sessionStorage.setItem("formData", JSON.stringify(formData));
  }, [formData]);

  /**
   * Handle changes to the form inputs
   *
   * @param {Event} e - The event object
   */
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  /**
   * Handle changes to the task inputs
   *
   * @param {Event} e - The event object
   */
  const handleTaskChange = (e) => {
    setTaskData({ ...taskData, [e.target.name]: e.target.value });
  };

  /**
   * This method adds a new task to the tasks list, clears the taskData state, and closes the task popup.
   */
  const handleAddTask = () => {
    setTasks([...tasks, taskData]);
    setTaskData({ taskName: "", percentage: "" });
    setShowTaskPopup(false);
  };

  /**
   * Handle saving the class and tasks to the backend
   *
   * @async
   */
  const handleSaveClass = async () => {
    try {
      const response = await fetch("http://localhost:8081/api/classes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...formData, tasks }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      toast.success("Class and tasks saved successfully!");
      sessionStorage.removeItem("formData");
      sessionStorage.removeItem("tasks");
    } catch (error) {
      console.error("Error:", error);
      toast.error("there is another class with that id");
    }
  };

  /**
   * This method navigates back to the teacher's page.
   */
  const handleBack = () => {
    toast.dismiss();
    sessionStorage.clear();
    navigate("/teacher");
  };

  return (
    <div className="add-class">
      <h1>Add Class Page</h1>
      <button className="back-button" onClick={handleBack}>
        Back
      </button>
      <div className="add-course-inputs">
        <input
          type="text"
          name="cname"
          placeholder="Class Name"
          value={formData.cname}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="id"
          placeholder="Class ID"
          value={formData.id}
          onChange={handleChange}
          required
        />
        <textarea
          name="description"
          placeholder="Class Description"
          value={formData.description}
          onChange={handleChange}
          required
        ></textarea>
        <button className="add-task-btn" onClick={() => setShowTaskPopup(true)}>
          Add Task
        </button>
        <button className="save-class-btn" onClick={handleSaveClass}>
          Save Class
        </button>
      </div>

      {tasks.length > 0 && (
        <div className="tasks-list">
          <h2>Tasks</h2>
          <ul>
            {tasks.map((task, index) => (
              <li key={index}>
                {task.taskName} - {task.percentage}%
              </li>
            ))}
          </ul>
        </div>
      )}

      {showTaskPopup && (
        <div className="task-popup">
          <h2>Add Task</h2>
          <input
            type="text"
            name="taskName"
            placeholder="Task Name"
            value={taskData.taskName}
            onChange={handleTaskChange}
            required
          />
          <input
            type="number"
            name="percentage"
            placeholder="Percentage"
            value={taskData.percentage}
            onChange={handleTaskChange}
            required
          />
          <button onClick={handleAddTask}>Add Task</button>
          <button onClick={() => setShowTaskPopup(false)}>Close</button>
        </div>
      )}
    </div>
  );
};

export default AddClass;

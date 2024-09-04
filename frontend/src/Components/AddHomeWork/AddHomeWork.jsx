import React, { useState, useEffect } from "react";
import "./AddHomeWork.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
/**
 * AddHomeWork Component
 *
 * This component renders a form to add new homework assignments for a selected class.
 * It fetches available classes, allows the user to input homework details, and submit the data to a backend server.
 *
 * @component
 */
function AddHomeWork() {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submissionDate, setSubmissionDate] = useState("");
  const [file, setFile] = useState(null);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const userEmail = localStorage.getItem("email");
        const response = await axios.get(
          `http://localhost:8081/api/classes/${userEmail}`
        );
        setClasses(response.data);
      } catch (error) {
        console.error("Error fetching classes:", error);
      }
    };

    fetchClasses();
  }, []);

  const handleBack = () => {
    toast.dismiss();
    navigate("/teacher");
  };

  const handleClassChange = (e) => {
    setSelectedClass(e.target.value);
  };

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
  };

  const handleSubmissionDateChange = (e) => {
    setSubmissionDate(e.target.value);
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("submissionDate", submissionDate);
      formData.append("file", file);
      formData.append("classId", selectedClass);

      await axios.post("http://localhost:8081/api/saveHomework", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("Class and tasks saved successfully!");
    } catch (error) {
      toast.error("Error saving homework:", error);
    }
  };

  return (
    <div className="home-work">
      <button className="back-button" onClick={handleBack}>
        Back
      </button>
      <div className="select-wrapper">
        <select onChange={handleClassChange}>
          <option value="">Select a Class</option>
          {classes.map((classItem) => (
            <option key={classItem.id} value={classItem.id}>
              {classItem.cname}
            </option>
          ))}
        </select>
      </div>
      {selectedClass && (
        <div>
          <div className="input-field">
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={handleTitleChange}
            />
          </div>
          <div className="input-field">
            <textarea
              placeholder="Description"
              value={description}
              onChange={handleDescriptionChange}
            ></textarea>
          </div>
          <div className="input-field">
            <input
              type="date"
              value={submissionDate}
              onChange={handleSubmissionDateChange}
            />
          </div>
          <div className="input-field">
            <input type="file" onChange={handleFileChange} />
          </div>
          <button className="submit-button" onClick={handleSubmit}>
            Submit
          </button>
        </div>
      )}
    </div>
  );
}

export default AddHomeWork;

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import { useNavigate } from "react-router-dom";
import "./GraphGrades.css";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const GraphGrades = () => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const handleBack = () => {
    navigate("/teacher");
  };

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const email = localStorage.getItem("email");
        const response = await axios.get(
          `http://localhost:8081/api/classes/${email}`
        );
        setClasses(response.data);
      } catch (error) {
        console.error("Error fetching classes:", error.message);
      }
    };
    fetchClasses();
  }, []);

  const handleClassSelect = async (classId) => {
    setSelectedClass(classId);

    // Reset students and tasks before fetching new data
    setStudents([]);
    setTasks([]);

    try {
      const studentsResponse = await axios.get(
        `http://localhost:8081/api/students/${classId}`
      );
      const tasksResponse = await axios.get(
        `http://localhost:8081/api/tasks/${classId}`
      );
      setStudents(studentsResponse.data);
      setTasks(tasksResponse.data);
    } catch (error) {
      console.error("Error fetching students or tasks:", error.message);
    }
  };

  const parseGrades = (gradesString) => {
    if (!gradesString) return {};
    try {
      return JSON.parse(gradesString);
    } catch (error) {
      console.error("Error parsing grades:", error.message);
      return {};
    }
  };

  const calculateFinalGrade = async (studentGrades, studentId) => {
    let finalGrade = 0;
    const attendanceResponse = await axios.get(
      `http://localhost:8081/api/attendance/${studentId}`
    );
    const attendanceData = attendanceResponse.data;
    const notHereCount = attendanceData.filter(
      (entry) => entry.status === "not_here"
    ).length;
    const deduction = Math.min(Math.floor(notHereCount / 3), 1);
    tasks.forEach((task) => {
      const taskKey = `${task.task_name}-${task.percentage}`;
      const grade = parseFloat(parseGrades(studentGrades)[taskKey]) || 0;
      finalGrade += ((grade * task.percentage) / 100) * (1 - deduction);
    });
    return finalGrade.toFixed(2);
  };

  const generateChartData = () => {
    const labels = students.map(
      (student) => `${student.firstName} ${student.lastName}`
    );
    const data = students.map((student) => parseFloat(student.finalGrade) || 0);

    return {
      labels,
      datasets: [
        {
          label: "Final Grades",
          data,
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        onClick: () => null, // Disable the legend's click functionality
      },
    },
  };

  useEffect(() => {
    const calculateStudentGrades = async () => {
      const updatedStudents = await Promise.all(
        students.map(async (student) => {
          const finalGrade = await calculateFinalGrade(
            student.grades,
            student.id
          );
          return { ...student, finalGrade };
        })
      );
      setStudents(updatedStudents);
    };

    if (students.length > 0 && tasks.length > 0) {
      calculateStudentGrades();
    }
  }, [students, tasks]);

  return (
    <div className="graph">
      <button className="back-button" onClick={handleBack}>
        Back
      </button>
      <select onChange={(e) => handleClassSelect(e.target.value)}>
        <option value="">Select a class</option>
        {classes.map((cls) => (
          <option key={cls.id} value={cls.id}>
            {cls.cname}
          </option>
        ))}
      </select>

      {students.length > 0 && (
        <div>
          <h2>Grading Graph</h2>
          <Bar data={generateChartData()} options={chartOptions} />
        </div>
      )}
    </div>
  );
};

export default GraphGrades;

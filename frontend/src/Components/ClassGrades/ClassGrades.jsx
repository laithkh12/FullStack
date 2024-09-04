import React, { useState, useEffect } from "react";
import "./ClassGrades.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";

/**
 * ClassGrades Component
 *
 * This component displays the grades of students in a selected class.
 * It fetches class information, student data, and task details from the backend,
 * calculates final grades based on tasks and attendance, and displays them in a table format.
 *
 * @component
 */
const ClassGrades = () => {
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
   * State to hold the ID of the selected class
   * @type {string|null}
   */
  const [selectedClass, setSelectedClass] = useState(null);
  /**
   * State to hold the list of tasks for the selected class
   * @type {Array}
   */
  const [tasks, setTasks] = useState([]);
  /**
   * State to hold the average final grade for the class
   * @type {number}
   */
  const [averageFinalGrade, setAverageFinalGrade] = useState(0);

  /**
   * Effect hook to fetch classes taught by the logged-in teacher when the component mounts
   */
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

  /**
   * Navigates back to the teacher's page
   */
  const handleBack = () => {
    navigate("/teacher");
  };

  /**
   * Fetches students and tasks for the selected class when it changes
   *
   * @param {string} classId - The ID of the selected class
   */
  const handleClassSelect = async (classId) => {
    // Reset the students and tasks states when a new class is selected
    setStudents([]);
    setTasks([]);
    setSelectedClass(classId);

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

  /**
   * Parses grades stored as a string into an object
   *
   * @param {string} gradesString - Stringified grades data
   * @returns {Object} - Parsed grades object
   */
  const parseGrades = (gradesString) => {
    if (!gradesString) return {};

    try {
      return JSON.parse(gradesString);
    } catch (error) {
      console.error("Error parsing grades:", error.message);
      return {};
    }
  };

  /**
   * Calculates the final grade for a student based on their grades, tasks, and attendance
   *
   * @param {string} studentGrades - Grades of the student in JSON format
   * @param {string} studentId - ID of the student
   * @returns {string} - Final grade of the student formatted to two decimal places
   */
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
    return finalGrade.toFixed(2); // Ensure finalGrade is always a valid numerical value
  };

  /**
   * Effect hook to calculate final grades for students when students or tasks change
   */
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

      const totalFinalGrade = updatedStudents.reduce(
        (total, student) => total + parseFloat(student.finalGrade),
        0
      );
      const averageGrade = updatedStudents.length
        ? totalFinalGrade / updatedStudents.length
        : 0;
      setAverageFinalGrade(averageGrade.toFixed(2));
    };

    if (students.length > 0 && tasks.length > 0) {
      calculateStudentGrades();
    } else {
      setAverageFinalGrade(0);
    }
  }, [students, tasks]);

  return (
    <div className="grades">
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

      {students.length > 0 && tasks.length > 0 && (
        <div>
          <h2>Students and Grades</h2>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                {tasks.map((task) => (
                  <th key={task.id}>
                    {task.task_name} - {task.percentage}%
                  </th>
                ))}
                <th>Final Grade</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id}>
                  <td>{student.id}</td>
                  <td>
                    {student.firstName} {student.lastName}
                  </td>
                  {tasks.map((task) => (
                    <td key={task.id}>
                      {
                        parseGrades(student.grades)[
                          `${task.task_name}-${task.percentage}`
                        ]
                      }
                    </td>
                  ))}
                  <td>{student.finalGrade}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={tasks.length + 2}>
                  <strong>Average Final Grade:</strong>
                </td>
                <td>
                  <strong>{averageFinalGrade}</strong>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
};

export default ClassGrades;

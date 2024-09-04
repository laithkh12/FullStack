import React, { useState, useEffect } from "react";
import "./Sidebar.css";
import { NavLink } from "react-router-dom";

/**
 * Sidebar Component
 *
 * This component renders a sidebar with navigation links for different features and a random technology article.
 *
 * @component
 */
const Sidebar = () => {
  const [currentArticle, setCurrentArticle] = useState({
    title: "",
    content: "",
  });

  useEffect(() => {
    // Function to fetch and parse the articles
    const fetchArticles = async () => {
      try {
        const response = await fetch("/articles.txt");
        const text = await response.text();

        // Split the text by delimiter to get individual articles
        const articlesData = text
          .split("---")
          .map((article) => {
            const [title, ...content] = article.trim().split("\n");
            return { title: title.trim(), content: content.join("\n").trim() };
          })
          .filter((article) => article.title && article.content);

        // Select a random article
        const randomIndex = Math.floor(Math.random() * articlesData.length);
        setCurrentArticle(articlesData[randomIndex]);
      } catch (error) {
        console.error("Error fetching the articles:", error);
      }
    };

    fetchArticles();
  }, []);

  return (
    <div className="sidebar-container">
      <div className="sidebar">
        <div className="sidebar-options">
          <NavLink to="/addClass" className="sidebar-option">
            <p>Add Class</p>
          </NavLink>
          <NavLink to="/addStudent" className="sidebar-option">
            <p>Add Student</p>
          </NavLink>
          <NavLink to="/attendanceCheck" className="sidebar-option">
            <p>Attendance Check</p>
          </NavLink>
          <NavLink to="/addHomeWork" className="sidebar-option">
            <p>Add HomeWork</p>
          </NavLink>
          <NavLink to="/editGrades" className="sidebar-option">
            <p>Edit Grades</p>
          </NavLink>
          <NavLink to="/classGrades" className="sidebar-option">
            <p>Class Grades</p>
          </NavLink>
          <NavLink to="/graph" className="sidebar-option">
            <p>Graph Grades</p>
          </NavLink>
        </div>
      </div>
      <div className="additional-content">
        {/* Display the randomly selected article */}
        <h2>{currentArticle.title}</h2>
        <p>{currentArticle.content}</p>
      </div>
    </div>
  );
};

export default Sidebar;

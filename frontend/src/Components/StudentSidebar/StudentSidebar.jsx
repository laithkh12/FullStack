import React, { useState, useEffect } from "react";
import "./StudentSidebar.css";
import { NavLink } from "react-router-dom";

/**
 * StudentSidebar Component
 *
 * This component renders a sidebar with navigation links for student-specific pages and a random technology article.
 *
 * @component
 */
const StudentSidebar = () => {
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
          <NavLink to="/homeWorks" className="sidebar-option">
            <p>HomeWorks</p>
          </NavLink>
          <NavLink to="/studentGrades" className="sidebar-option">
            <p>Grades</p>
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

export default StudentSidebar;

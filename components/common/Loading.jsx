"use client";

import React from "react";

const Loading = ({ fullScreen = false, message = "Loading data..." }) => {
  const containerStyle = fullScreen
    ? {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(255, 255, 255, 0.5)",
        backdropFilter: "blur(2px)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
      }
    : {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "transparent",
        zIndex: 9999,
      };

  return (
    <div style={containerStyle}>
      <div className="spinner-container">
        <div className="spinner"></div>
      </div>
      <p className="loading-message">{message}</p>
      <style jsx global>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        .spinner-container {
          margin-bottom: 1rem;
          background-color: rgba(255, 255, 255, 0.9);
          padding: 15px;
          border-radius: 50%;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }
        .spinner {
          width: 50px;
          height: 50px;
          border: 5px solid rgba(43, 177, 190, 0.3); /* Primary teal with transparency */
          border-radius: 50%;
          border-top-color: #2BB1BE; /* Primary teal */
          animation: spin 1s ease-in-out infinite;
        }
        .loading-message {
          font-size: 1.1rem;
          color: #0F6268; /* Dark teal */
          font-weight: 600;
          margin: 1rem 0 0;
          text-align: center;
          background-color: rgba(255, 255, 255, 0.9);
          padding: 8px 16px;
          border-radius: 20px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
};

export default Loading;

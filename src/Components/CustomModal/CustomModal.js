import React from "react";
import classes from "./CustomModal.module.css";

export default function CustomModal({ children }) {
  return (
    <div
      style={{
        position: "fixed",
        top: "0",
        left: "0",
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center", // center the modal content vertically and horizontally
        // backdropFilter: "blur(10px)",
        // WebkitBackdropFilter: "blur(10px)",
      }}
    >
      <div
        className={classes.secondDiv}
        style={{
          display: "flex",
          flexDirection: "column",
          maxWidth: "1000px",
          maxHeight: "90vh",
          overflow: "hidden",
          boxShadow: "0 6px 30px rgba(0, 0, 0, 0.2)",
          background: "#eee",
          backdropFilter: "blur(4px)", // Adjust the blur intensity as needed
          WebkitBackdropFilter: "blur(4px)", // For Safari support,
          borderRadius: "5px",
          border: "5px solid #fff",
        }}
      >
        <div className={classes.thirdDiv}>{children}</div>
      </div>
    </div>
  );
}

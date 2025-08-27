import React from "react";
import { useState } from "react";
import Login from "./Login";
import TeacherLogin from "./TeacherLogin";

export default function StudentOrTeacher() {
  const [isStudent, setIsStudent] = useState(true);

  return (
    <div
      style={{
        background:
          "linear-gradient(109.6deg, rgb(61, 121, 176) 11.3%, rgb(35, 66, 164) 91.1%)",
        flex: 1,
      }}
    >
      <div
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          flex: 1,
        }}
      >
        <button
          style={{ width: "50%", padding: "1rem", border: "none",
        background: 'rgb(61, 121, 176)',
        color: 'white',
    fontWeight: 'bold',
fontSize: 'x-large' }}
          onClick={() => {
            setIsStudent(true);
          }}
        >
          For Students
        </button>
        <button
          style={{
            width: "50%",
            padding: "1rem",
            border: "none",
            background: 'rgb(154, 27, 69)',
            color: 'white',
        fontWeight: 'bold',
    fontSize: 'x-large'
          }}
          onClick={() => {
            setIsStudent(false);
          }}
        >
          For Teachers
        </button>

        {isStudent ? <Login /> : <TeacherLogin />}
      </div>
    </div>
  );
}

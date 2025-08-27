import React, { useEffect, useState, useContext } from "react";
import { db } from "../../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { MyContext } from "../../Context/MyContext";
import { useNavigate } from "react-router-dom";
import styles from "./TeacherCourses.module.css";

export default function TeacherCourses() {
  const [courses, setCourses] = useState({});
  const {
    userDetails
  } = useContext(MyContext);


  useEffect(() => {
    const fetchData = async () => {
      if (userDetails?.userId) {
        const linkedRef = collection(db, "Linked");
        const q = query(linkedRef, where("teacherId", "==", userDetails?.userId));
        const linkedSnapshot = await getDocs(q);

        const courseData = {};
        linkedSnapshot.forEach((doc) => {
          const data = doc.data();
          if (courseData[data.subject]) {
            courseData[data.subject].push(data.studentName);
          } else {
            courseData[data.subject] = [data.studentName];
          }
        });

        setCourses(courseData);
      }
    };

    fetchData();
  }, [userDetails?.userId]);

  return (
    <div style={{padding: '1rem'}}>
      <div className={styles.mainHeader}>
        <h1>Active Courses ({Object.keys(courses).length})</h1>
      </div>
      <ul className={styles.teachersList}>
        {Object.keys(courses).map((course, index) => (
          <div key={index} className={styles.teachersContainer}>
            <span style={{ fontWeight: "bold" }}>{course}</span>{" "}
            <span className={styles.subjects}>
              ({courses[course].join(", ")})
            </span>
          </div>
        ))}
      </ul>

    </div>
  );
}

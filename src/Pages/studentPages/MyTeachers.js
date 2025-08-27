import React, { useState, useEffect, useContext } from "react";
import { MyContext } from "../../Context/MyContext";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebase";
import {
  collection,
  doc,
  getDocs,
  query,
  onSnapshot,
  where
} from "firebase/firestore";
import styles from "./MyTeachers.module.css";

const MyTeachers = () => {
  const [data, setData] = useState([]);
  const [teachersMap, setTeachersMap] = useState({});
  const { userDetails } = useContext(MyContext);


  const fetchData = () => {
    const ordersRef = collection(db, "Linked");
    const q = query(ordersRef, where("studentId", "==", userDetails?.userId));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedData = [];
      const teacherSubjectMap = {};

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        fetchedData.push(data);
        if (!teacherSubjectMap[data.teacherName]) {
          teacherSubjectMap[data.teacherName] = [];
        }
        teacherSubjectMap[data.teacherName].push(data.subject);
      });

      setData(fetchedData);
      setTeachersMap(teacherSubjectMap);
    });

    return () => {
      unsubscribe();
    };
  };

  return (
    <div style={{padding: '1rem'}}>
      <div className={styles.mainHeader}>
        <h1>My Tutors ({Object.keys(teachersMap).length})</h1>
      </div>
      <ul className={styles.teachersList}>
        {Object.keys(teachersMap).map((teacherName, index) => (
          <li key={index} className={styles.teachersContainer}>
            <span style={{ fontWeight: "bold" }}>{teacherName}</span>{" "}
            <span className={styles.subjects}>
              ({teachersMap[teacherName].join(", ")})
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MyTeachers;

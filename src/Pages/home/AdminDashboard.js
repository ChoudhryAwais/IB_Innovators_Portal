import React, {useContext} from "react";
import "./home.css";
import { useEffect, useState } from "react";
import { db } from "../../firebase";
import { collection, doc,  query, where, getCountFromServer } from 'firebase/firestore';
import styles from "./AdminDashboard.module.css";
import TopHeading from "../../Components/TopHeading/TopHeading";
import { toast } from "react-hot-toast";
import { Enable2FAForm } from "../Enable2FAForm/Enable2FAForm";
import { MyContext } from "../../Context/MyContext";

const AdminDashboard = () => {
  const {userDetails} = useContext(MyContext)
  const [studentFormsCount, setStudentFormsCount] = useState(0);
  const [tutorFormsCount, setTutorFormsCount] = useState(0);
  const [pendingStudentFormsCount, setPendingStudentFormsCount] = useState(0);
  const [pendingTutorFormsCount, setPendingTutorFormsCount] = useState(0);

  const [requestCoursesFormsCount, setRequestCoursesFormsCount] = useState(0);
  const [pendingRequestCoursesFormsCount, setPendingRequestCoursesFormsCount] = useState(0);

  const [revisionCoursesFormsCount, setRevisionCoursesFormsCount] = useState(0);
  const [pendingRevisionCoursesFormsCount, setPendingRevisionCoursesFormsCount] = useState(0);

  const [upcomingCoursesFormsCount, setUpcomingCoursesFormsCount] = useState(0);
  const [pendingUpcomingCoursesFormsCount, setPendingUpcomingCoursesFormsCount] = useState(0);
  
  const [contactUsFormsCount, setContactUsFormsCount] = useState(0);
  const [pendingContactUsFormsCount, setPendingContactUsFormsCount] = useState(0);

  const [tutorsCount, setTutorsCount] = useState(0);
  const [studentsCount, setStudentsCount] = useState(0);

  const [links, setLinks] = useState(0)

  const fetchCollectionCount = async (collectionName, setStateFunc) => {
    try {
      const ordersRef = collection(db, "adminPanel");
      const customDocRef = doc(ordersRef, collectionName);
      const orderCollectionRef = collection(customDocRef, collectionName);
      const snapshot = await getCountFromServer(orderCollectionRef);
      setStateFunc(snapshot.data().count);
    } catch (error) {
      toast.error(`Error fetching ${collectionName} count`);
      console.error(`Error fetching ${collectionName} count: `, error);
    }
  };

  const fetchLinksCount = async (collectionName, setStateFunc) => {
    try {
      const ordersRef = collection(db, collectionName);
      const snapshot = await getCountFromServer(ordersRef);
      setStateFunc(snapshot.data().count);
    } catch (error) {
      toast.error(`Error fetching ${collectionName} count`);
      console.error(`Error fetching ${collectionName} count: `, error);
    }
  };

  const fetchTutorsDataCount = async (item, setStateFunc) => {
    try {
      const userListRef = collection(db, "userList");
      const q = query(userListRef, where("type", "==", item));
      const snapshot = await getCountFromServer(q);
      setStateFunc(snapshot.data().count);
    } catch (error) {
      toast.error(`Error fetching ${item} count`);
      console.error(`Error fetching ${item} count: `, error);
    }
  };

  useEffect(() => {
    fetchCollectionCount("processedStudentForm", setStudentFormsCount);
    fetchCollectionCount("processedTutorForm", setTutorFormsCount);
    fetchCollectionCount("studentForm", setPendingStudentFormsCount);
    fetchCollectionCount("teacherForm", setPendingTutorFormsCount);
    fetchCollectionCount("processedRequestCourseForm", setRequestCoursesFormsCount);
    fetchCollectionCount("requestCourseForm", setPendingRequestCoursesFormsCount);
    fetchCollectionCount("processedRevisionCoursesForm", setRevisionCoursesFormsCount);
    fetchCollectionCount("revisionCoursesForm", setPendingRevisionCoursesFormsCount);
    fetchCollectionCount("processedUpcomingCoursesForm", setUpcomingCoursesFormsCount);
    fetchCollectionCount("upcomingCoursesForm", setPendingUpcomingCoursesFormsCount);
    fetchCollectionCount("processedContactUsForm", setContactUsFormsCount);
    fetchCollectionCount("contactUsForm", setPendingContactUsFormsCount);
    fetchLinksCount("Linked", setLinks);

    fetchTutorsDataCount("teacher", setTutorsCount);
    fetchTutorsDataCount("student", setStudentsCount);
  }, []);

  return (
    <React.Fragment>
      <TopHeading>Hi Admin</TopHeading>

      <div className={styles.dashboardContainer}>
        <div className={styles.dataSection}>
          <div className={styles.dataBox}>
            <span>Tutors</span>
            <strong>{tutorsCount}</strong>
          </div>
          <div className={styles.dataBox}>
            <span>Students</span>
            <strong>{studentsCount}</strong>
          </div>
          <div className={styles.dataBox}>
            <span>Links</span>
            <strong>{links}</strong>
          </div>
          <div className={styles.dataBox}>
            <span>Student Forms</span>
            <strong>{pendingStudentFormsCount} / {studentFormsCount}</strong>
          </div>
          <div className={styles.dataBox}>
            <span>Tutor Forms</span>
            <strong>{pendingTutorFormsCount} / {tutorFormsCount}</strong>
          </div>
          <div className={styles.dataBox}>
            <span>Request Courses Forms</span>
            <strong>{requestCoursesFormsCount} / {pendingRequestCoursesFormsCount}</strong>
          </div>
          <div className={styles.dataBox}>
            <span>Revision Courses Forms</span>
            <strong>{revisionCoursesFormsCount} / {pendingRevisionCoursesFormsCount}</strong>
          </div>
          <div className={styles.dataBox}>
            <span>Upcoming Courses Forms</span>
            <strong>{upcomingCoursesFormsCount} / {pendingUpcomingCoursesFormsCount}</strong>
          </div>
          <div className={styles.dataBox}>
            <span>Contact Us Forms</span>
            <strong>{contactUsFormsCount} / {pendingContactUsFormsCount}</strong>
          </div>
        </div>
      </div>

      
      {
        !userDetails?.TFAEnabled &&
        <Enable2FAForm />
      }
      <div id="recaptcha-container"></div>
    </React.Fragment>
  );
};

export default AdminDashboard;

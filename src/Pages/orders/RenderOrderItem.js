import React, { useState, useEffect, useContext } from "react";
import {
  collection,
  doc,
  getDocs,
  addDoc,
  deleteDoc,
  query,
  where,
  setDoc,
  updateDoc
} from "firebase/firestore";
import { db } from "../../firebase";
import { useNavigate } from "react-router-dom";
import { MyContext } from "../../Context/MyContext";
import styles from "./RenderOrderItem.module.css";

export default function RenderOrderItem({ order, index }) {
  const [selectedTeachers, setSelectedTeachers] = useState({});
  const [teachers, setTeachers] = useState([]);
  const { isUserLoggedIn, userType } = useContext(MyContext);
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false); // New state

  const toggleDetails = () => {
    setIsExpanded(!isExpanded);
  };

  useEffect(() => {
    if (!isUserLoggedIn) {
      navigate("/login", { replace: true });
    } else if (userType !== "admin") {
      navigate("/", { replace: true });
    } else {
      fetchTeachers();
    }
  }, [isUserLoggedIn, userType]);

  const fetchTeachers = async () => {
    const teachersRef = collection(db, "userList");
    const q = query(teachersRef, where("type", "==", "teacher"));
    const teacherQuerySnapshot = await getDocs(q);
    setTeachers(teacherQuerySnapshot.docs.map((doc) => doc.data()));
  };

  const handleTeacherChange = (
    orderId,
    subject,
    teacherId,
    price,
    teacherName,
    plan,
    hourlyRate
  ) => {
    setSelectedTeachers({
      ...selectedTeachers,
      [`${orderId}_${subject}`]: { teacherId, price, teacherName, plan, hourlyRate }
    });
  };

  const handleProcessedClick = async () => {
    try {
      const linkedRef = collection(db, "Linked");

      for (const [key, { teacherId, price, teacherName, plan, hourlyRate }] of Object.entries(
        selectedTeachers
      )) {
        const [orderId, subject] = key.split("_");

        // First, add the document and get its ID
        const linkId = await addDoc(linkedRef, {
          studentId: order.userId,
          studentName: order.userName,
          teacherId,
          subject,
          price,
          teacherName,
          orderId: order.id,
          plan,
          startDate: new Date,
          credits: 1,
          teacherHourlyRate: parseFloat(hourlyRate),
          studentInfo: order.otherInformation.userDetails
        });

        // Update the document to include the ID
        const docRef = doc(linkedRef, linkId.id);
        await updateDoc(docRef, {
          id: linkId.id
        });

        console.log(`Document written with ID: ${linkId.id}`);
      }

      // Add to processed orders
      const processedOrdersRef = collection(db, "adminPanel");
      const processedCustomDocRef = doc(processedOrdersRef, "processedOrders");
      const processedOrderCollectionRef = collection(
        processedCustomDocRef,
        "processedOrders"
      );

      const processedOrderDocRef = doc(processedOrderCollectionRef, order.id); // Create a doc reference with order.id
      await setDoc(processedOrderDocRef, order); // Set the document data

      // Delete from pending orders
      const ordersRef = collection(db, "adminPanel");
      const customDocRef = doc(ordersRef, "orders");
      const orderCollectionRef = collection(customDocRef, "orders");
      const orderDocRef = doc(orderCollectionRef, order.id); // Assuming order.id is the document id
      await deleteDoc(orderDocRef);

      alert("Successfully processed order");
    } catch (error) {
      alert("Error processing order", error);
      console.error("Error processing order:", error);
    }
  };

  return (
    <div style={{marginBottom: '1rem'}}  className={styles.orderItem}>
      <div onClick={toggleDetails} className={styles.orderDetails}>
        <p className={styles.orderId}>Order ID: {order.id}</p>
        {isExpanded && (
          <>
            <p className={styles.userId}>User ID: {order.userId}</p>
            <p className={styles.userId}>from: {order?.otherInformation?.userDetails?.firstName} {order?.otherInformation?.userDetails?.lastName}</p>
            <p className={styles.orderDate}>
              Order Date: {new Date(order.date.toDate()).toLocaleDateString()}
            </p>
            
          </>
        )}
      </div>
      {isExpanded && (
        <>
          <div className={styles.subjectTeacherLinking}>
            {order.cart.map((item, i) => (
              <div className={styles.cartItem} key={i}>
                <span className={styles.cartItemDetail}>
                  {item.name} - (${item.price} - {item.plan})
                </span>
                <select
                  onChange={(e) => {
                    const teacher = teachers.find(
                      (teacher) => teacher.userId === e.target.value
                    );
                    handleTeacherChange(
                      order.id,
                      item.name,
                      e.target.value,
                      item.price,
                      teacher.userName,
                      item.plan,
                      teacher.hourlyRate
                    );
                  }}
                >
                  <option value="">Select Teacher</option>
                  {teachers.map((teacher, tIndex) => (
                    <option key={tIndex} value={teacher.userId}>
                      {teacher.userName} (Hourly Rate: £ {teacher?.hourlyRate})
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
          <button
            className={styles.processButton}
            onClick={handleProcessedClick}
          >
            Generate Link
          </button>
        </>
      )}
    </div>
  );
}

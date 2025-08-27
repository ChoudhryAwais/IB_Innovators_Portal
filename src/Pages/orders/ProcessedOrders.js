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
import RenderOrderItem from "./RenderOrderItem";
import styles from "./ProcessedOrders.module.css";

const ProcessedOrders = () => {
  const [orderData, setOrderData] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const { isUserLoggedIn, userType } = useContext(MyContext);
  const navigate = useNavigate();

  useEffect(() => {
    console.log(userType)
    if (!isUserLoggedIn) {
      navigate("/login", { replace: true });
    } else if(userType !== 'admin') {
      navigate("/login", { replace: true });
    } else {
      fetchData();
    }
  }, [isUserLoggedIn]);

  const fetchData = () => {
    const ordersRef = collection(db, "adminPanel");
    const customDocRef = doc(ordersRef, "processedOrders");
    const orderCollectionRef = collection(customDocRef, "processedOrders");

    const unsubscribe = onSnapshot(orderCollectionRef, (querySnapshot) => {
      const fetchedData = [];
      querySnapshot.forEach((doc) => {
        fetchedData.push(doc.data());
      });
      setOrderData(fetchedData);
    });

    return () => {
      unsubscribe();
    };
  };

  const toggleExpand = (index) => {
    const updatedOrderData = [...orderData];
    updatedOrderData[index].expanded = !updatedOrderData[index].expanded;
    setOrderData(updatedOrderData);
  };

  return (
    <div style={{padding: '1rem'}}>
    <div className={styles.pendingOrdersContainer}>
      <div className={styles.mainHeader}>
        <h1>Processed Orders ({orderData.length})</h1>
      </div>
      {orderData.map((order, index) => (
        <div style={{marginRight: '1rem', marginLeft: '1rem'}}
          key={index}
          className={
            order.expanded
              ? `${styles["order-item"]} ${styles.expanded}`
              : styles["order-item"]
          }
          onClick={() => toggleExpand(index)}
        >
          <div style={{padding: '0.5rem 0'}} className={styles["order-summary"]}>
            <div>
              <p>Order ID: {order.id}</p>
            </div>
          </div>
          {order.expanded && (
            <div className={styles["order-details"]}>
              <table>
                <tbody>
                  <div>
                    <p>Ordered By: {order.userName}</p>
                  </div>
                  <div>
                    <p>User ID: {order.userId}</p>
                  </div>
                  <div>
                    <p>
                      Order Date:{" "}
                      {new Date(order.date?.toDate()).toLocaleString()}
                    </p>
                  </div>
                </tbody>
              </table>
              <div className={styles["subject-teacher-linking"]}>
                <table  style={{flex: 1, width: '100%'}}>
                  <thead>
                    <tr style={{ textAlign: "left" }}>
                      <th style={{flex: 1}}>Item Name</th>
                      <th style={{flex: 1}}>Price</th>
                      <th style={{flex: 1}}>Plan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.cart?.map((item, i) => (
                      <tr key={i}>
                        <td style={{flex: 1}}>{item.name}</td>
                        <td style={{flex: 1}}>${item.price}</td>
                        <td style={{flex: 1}}>{item.plan}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
    </div>
  );
};

export default ProcessedOrders;

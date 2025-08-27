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
import styles from "./PendingOrders.module.css";

const PendingOrders = () => {
  const [orderData, setOrderData] = useState([]);

  useEffect(() => {
      fetchData();
  }, []);

  const fetchData = () => {
    const ordersRef = collection(db, "adminPanel");
    const customDocRef = doc(ordersRef, "orders");
    const orderCollectionRef = collection(customDocRef, "orders");

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

  return (
    <div style={{padding: '1rem'}}>
    <div className={styles.pendingOrdersContainer}>
      <div className={styles.mainHeader}>
        <h1>Pending Orders ({orderData.length})</h1>
      </div>
      <div className={styles.ordersList}>
        {orderData.map((order, index) => (
          <RenderOrderItem
            className={styles.orderItemWrapper}
            order={order}
            index={index}
            key={index}
          />
        ))}
      </div>
    </div>
    </div>
  );
};

export default PendingOrders;

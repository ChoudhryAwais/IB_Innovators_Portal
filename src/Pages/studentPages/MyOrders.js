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
import styles from "./MyOrders.module.css";

const MyOrders = () => {
  const [orderData, setOrderData] = useState([]);
  const { isUserLoggedIn, userType, userId } = useContext(MyContext);
  const navigate = useNavigate();
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    if (!isUserLoggedIn) {
      navigate("/login", { replace: true });
    } else if (userType === "admin") {
      navigate("/", { replace: true });
    } 
    else if (userType === "teacher") {
      navigate("/", { replace: true });
    } 
    else {
      fetchData()
    }
  }, [isUserLoggedIn, userType]);

  const fetchData = () => {
    const myUserId = localStorage.getItem("userId");
    const ordersRef = collection(db, "adminPanel");
    const customDocRef = doc(ordersRef, "orders");
    const orderCollectionRef = collection(customDocRef, "orders");

    const q = query(orderCollectionRef, where("userId", "==", myUserId));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
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
      <div className={styles.mainHeader}>
        <h1>My UnProcessed Orders ({orderData.length})</h1>
      </div>
      {orderData.map((order, index) => (
        <div onClick={() =>
          setExpandedOrder(expandedOrder === index ? null : index)
        } key={index} className={styles.orderItem}>
          <div
            className={styles.orderHeader}
            
          >
            <p style={{fontWeight: 'bold'}}>
              Order Date: {new Date(order.date?.toDate()).toLocaleDateString()}
            </p>
          </div>
          {expandedOrder === index && (
            <div style={{marginTop: '1rem'}} className={styles.orderDetails}>
              <p>Order ID: {order.id}</p>

              <div className={styles.itemsList}>
              <div style={{ display: 'flex', flexDirection: 'row', marginBottom: '10px' }}>
    <div style={{ flex: 1 }}>
        <strong>Subject</strong>
    </div>
    <div style={{ flex: 1 }}>
        <strong>Price</strong>
    </div>
    <div style={{ flex: 1 }}>
        <strong>Plan</strong>
    </div>
</div>

{order.cart.map((item, i) => (
    <div key={i} className={styles.item}>
        <div style={{ display: 'flex', flexDirection: 'row', marginBottom: '10px' }}>
            <div style={{ flex: 1 }}>
                {item.name}
            </div>
            <div style={{ flex: 1 }}>
            £{item.price}
            </div>
            <div style={{ flex: 1 }}>
                {item.plan}
            </div>
        </div>
    </div>
))}

              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default MyOrders;

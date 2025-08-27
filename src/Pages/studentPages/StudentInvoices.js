import React, { useState, useEffect, useContext } from "react";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  arrayUnion,
  query,
  where
} from "firebase/firestore";
import { db } from "../../firebase";
import { MyContext } from "../../Context/MyContext"; // Assuming you have a Context for managing state
import styles from "./StudentInvoices.module.css";
import { useNavigate } from "react-router-dom";

export default function StudentInvoices() {
  const [linkedDocs, setLinkedDocs] = useState([]);
  const userId = localStorage.getItem("userId");
  const [expandedInvoice, setExpandedInvoice] = useState(null);
  const { isUserLoggedIn, userType } = useContext(MyContext);
const navigate=useNavigate()

  useEffect(() => {
    if (!isUserLoggedIn) {
      navigate("/login", { replace: true });
    } else if (userType === "admin") {
      navigate("/", { replace: true });
    } 
    else if (userType === "teacher") {
      navigate("/", { replace: true });
    } 
  }, [isUserLoggedIn, userType]);

  useEffect(() => {
    const fetchData = async () => {
      if (userId) {
        const linkedRef = collection(db, "Linked");
        const q = query(linkedRef, where("studentId", "==", userId));
        const linkedSnapshot = await getDocs(q);
        setLinkedDocs(
          linkedSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );
      }
    };

    fetchData();
  }, [userId]);

  const markInvoicePaid = async (linkedDocId, invoice) => {
    try {
      const docRef = doc(db, "Linked", linkedDocId);
      const updatedInvoice = { ...invoice, status: "Paid" };
      const invoices = linkedDocs.find((doc) => doc.id === linkedDocId)
        .invoices;
      const updatedInvoices = invoices.map((inv) =>
        inv === invoice ? updatedInvoice : inv
      );

      await updateDoc(docRef, {
        invoices: updatedInvoices
      });

      // Update local state as well
      setLinkedDocs(
        linkedDocs.map((doc) =>
          doc.id === linkedDocId ? { ...doc, invoices: updatedInvoices } : doc
        )
      );

    } catch (error) {
      console.error("Error updating invoice:", error);
    }
  };

  return (
    <div style={{padding: '1rem'}}>
      <div className={styles.mainHeader}>
        <h1>My Invoices</h1>
      </div>
      {linkedDocs.map((linkedDoc) =>
        linkedDoc.invoices?.map((invoice, index) => (
          <div
            onClick={() =>
              setExpandedInvoice(expandedInvoice === index ? null : index)
            }
            style={{
              cursor: "pointer",
              marginRight: "1rem",
              marginLeft: "1rem",
              marginBottom: '1rem',
            }}
          >
            <div key={index} style={{
              backgroundColor: invoice.status === "Pending" ? 'rgb(250, 228, 228)' : 'rgb(229, 252, 229)'}} className={styles.container}>
            <p style={{fontWeight: 'bold'}}>
                {linkedDoc.subject}{" "}
                <span style={{ fontSize: "medium" }}>
                  (tutor: {linkedDoc.teacherName})
                </span>
              </p>
              
              <p style={{color: invoice.status === "Pending" ? 'red' : 'green'}}>{invoice.status === "Pending" ? "PENDING" : "PAID"}</p>
              {expandedInvoice === index && (
                <>
                  <p>Amount: {invoice.amount}</p>
                  <p>Status: {invoice.status}</p>
                  <p>Received At: {new Date(invoice.createdAt.toDate()).toLocaleDateString()}</p>
                  {/* {invoice.status === "Pending" && (
                    <button
                      className={styles.payButton}
                      onClick={() => markInvoicePaid(linkedDoc.id, invoice)}
                    >
                      Pay Now
                    </button>
                  )} */}
                </>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

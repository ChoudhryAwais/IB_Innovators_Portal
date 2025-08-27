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
import { UpcomingAndCanceledSessionsStudent } from "./UpcomingAndCanceledSessionsStudent";

export default function StudentSessions() {
  const [linkedDocs, setLinkedDocs] = useState([]);
  const [expandedInvoice, setExpandedInvoice] = useState(null);
  const { isUserLoggedIn, userType, userDetails } = useContext(MyContext);
const navigate=useNavigate()


  useEffect(() => {
    const fetchData = async () => {
      if (userDetails?.userId) {
        const linkedRef = collection(db, "Linked");
        const q = query(linkedRef, where("studentId", "==", userDetails?.userId));
        const linkedSnapshot = await getDocs(q);
        setLinkedDocs(
          linkedSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );
      }
    };

    fetchData();
  }, [userDetails?.userId]);

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
        <h1>My Sessions</h1>
      </div>
      <UpcomingAndCanceledSessionsStudent />
    </div>
  );
}

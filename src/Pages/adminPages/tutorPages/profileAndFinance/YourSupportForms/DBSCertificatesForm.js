import React, { useState, useEffect } from "react";
import { db } from "../../../../../firebase";
import {
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";

export function DBSCertificates({ userDetails, userId }) {
  const [savingDetails, setSavingDetails] = useState("SAVE");
  const [enhancedCertificate, setEnhancedCertificate] = useState(
    userDetails?.dbsCertificate?.enhancedCertificate
      ? userDetails?.dbsCertificate?.enhancedCertificate
      : false
  );

  async function savingChanges() {
    setSavingDetails("SAVING");
    try {
      const details = { dbsCertificate: { enhancedCertificate } };

      const userListRef = collection(db, "userList");
      const q = query(userListRef, where("userId", "==", userId));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docRef = querySnapshot.docs[0].ref;

        // Update only the specified fields in the document
        await updateDoc(docRef, details);
      }

      setSavingDetails("SAVED");

      // Revert to "SAVE" after 2 seconds
      setTimeout(() => {
        setSavingDetails("SAVE");
      }, 1000);
    } catch (e) {
      console.error("Error saving changes:", e);
      alert("Error saving changes. Please try again");
      setSavingDetails("SAVE");
    }
  }

  return (
    <div style={{ marginTop: "30px" }}>
      <div
        style={{
          flex: 1,
          justifyContent: "space-between",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <div style={{ fontSize: "1.5rem" }}>DBS Certificates</div>

        <button
          onClick={savingChanges}
          style={{
            border: "1px solid green",
            color: "white",
            background: "green",
            borderRadius: "0px",
            padding: "5px 10px",
          }}
        >
          {savingDetails}
        </button>
      </div>

      <p style={{ marginBottom: "15px" }}>
        DBS Certificates are issued by the UK Government to demonstrate that you
        have not been barred from working with young people. We may ask you for
        DBS in order to tutor students.
      </p>

      <p>
        Did you have enhanced DBS Certificate issued in last two years?{" "}<br></br>
        <span style={{ fontWeight: "bold", display: 'flex', justifyContent: 'space-around' }}>
          <span>
          <input
            type="radio"
            id="yes"
            name="enhancedCertificate"
            checked={enhancedCertificate === true}
            onChange={() => setEnhancedCertificate(true)}
          />
          <label htmlFor="yes">Yes</label></span>
          <span>
          <input
            type="radio"
            id="no"
            name="enhancedCertificate"
            checked={enhancedCertificate === false}
            onChange={() => setEnhancedCertificate(false)}
          />
          <label htmlFor="no">No</label></span>
        </span>
      </p>

      <div style={{ marginBottom: "20px", fontSize: "1.5rem", marginTop: "30px" }}>
        Update your DBS Record
      </div>

      <p style={{ marginBottom: "15px", marginTop: "15px" }}>
        If you have enhanced DBS Certificate so please send to{" "}
        <span style={{ textDecoration: "underline" }}>
          contact@ibinnovators.com
        </span>{" "}
        so we can update your profile accordingly.
      </p>
    </div>
  );
}

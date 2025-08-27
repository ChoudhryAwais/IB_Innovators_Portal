import React, { useState, useEffect, useContext } from "react";

import { db } from "../../../../firebase";
import {
  collection,
  doc,
  getDocs,
  query,
  onSnapshot,
  where,
  updateDoc,
} from "firebase/firestore";
import { MyContext } from "../../../../Context/MyContext";

export function DBSCertificates() {
  const { userDetails, userId } = useContext(MyContext);

  return (
    <div
      style={{
        marginTop: "30px",
      }}
    >
      
        <div style={{ marginBottom: "15px",fontSize: "1.5rem" }}>DBS Certificates</div>
    

      <p style={{ marginBottom: "15px" }}>
        DBS Certificates are issued by the UK Government to demonstrate that you
        have not been barred from working with young people. We may ask you for
        DBS in order to tutor students.
      </p>

      <p>
          Did you have enhanced DBS Certificate issued in last two years?{" "}
       
        <span style={{ fontWeight: "bold" }}>
          {userDetails?.dbsCertificate?.enhancedCertificate === true
            ? "Yes"
            : userDetails?.dbsCertificate?.enhancedCertificate === false
            ? "No"
            : "No"}
        </span>
      </p>


      <div style={{ marginBottom: "20px",fontSize: "1.5rem", marginTop: "30px" }}>Update your DBS Record</div>
    

      <p style={{ marginBottom: "15px", marginTop: "15px" }}>
        If you have enhanced DBS Certificate so please send to{" "}
        <span style={{ textDecoration: "underline" }}>
          contact@ibinnovators.com
        </span>
        so we can update your profile accordingly.
      </p>



      
    </div>
  );
}

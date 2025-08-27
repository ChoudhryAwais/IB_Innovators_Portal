import React, { useState, useEffect, useContext } from "react";

import { db } from "../../../firebase";
import {
  collection,
  doc,
  getDocs,
  query,
  onSnapshot,
  where,
  updateDoc,
} from "firebase/firestore";
import { MyContext } from "../../../Context/MyContext";
import { DBSCertificates } from "./YourSupportForms/DBSCertificatesForm";
import { YourStyleAndExperience } from "./YourSupportForms/YourStyleAndExperience";

export function YourSupport() {
  const {
    userDetails,
  } = useContext(MyContext);


  const subjectInString = `${Object.entries(userDetails?.subjects).map(([subject]) => `${subject}`)}`

  return (
    <div
    >
      <h2 style={{ textAlign: "left" }}>Your Support</h2>

      <div>

      <div style={{fontSize: '1.5rem', marginBottom: '15px'}}>Subjects you are cleared to tutor in</div>
      <p style={{ marginBottom: '15px'}}>{subjectInString}</p>


      <p>To request to tutor in additional subjects please fill out the APPLY FOR NEW SUBJECT form here.</p>
      </div>



<DBSCertificates />
<YourStyleAndExperience />
      
      
    </div>
  );
}

import React, { useState, useEffect, useContext } from "react";

import { db } from "../../../../../firebase";
import {
  collection,
  doc,
  getDocs,
  query,
  onSnapshot,
  where,
  updateDoc,
} from "firebase/firestore";

export function YourStyleAndExperience({userDetails, userId}) {


  const [firstStyleBox, setFirstStyleBox] = useState(
    userDetails?.YourStyleAndExperience?.firstStyleBox
      ? userDetails?.YourStyleAndExperience?.firstStyleBox
      : ""
  );

  const [secondStyleBox, setSecondStyleBox] = useState(
    userDetails?.YourStyleAndExperience?.secondStyleBox
      ? userDetails?.YourStyleAndExperience?.secondStyleBox
      : ""
  );

  const [savingDetails, setSavingDetails] = useState("SAVE");

  async function savingChanges() {
    setSavingDetails("SAVING");
    try {
      const details = { YourStyleAndExperience: { firstStyleBox, secondStyleBox } };
  
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
        <div style={{ fontSize: "1.5rem" }}>Your Style and Experience</div>

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
      <p style={{marginBottom: '15px'}}>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed faucibus
        odio a ligula cursus, in ultricies justo pharetra. Suspendisse potenti.
        Nulla facilisi. Proin quis risus vel odio ullamcorper vestibulum.
      </p>

      <div style={{ fontSize: "1.3rem" }}>Your Style</div>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed faucibus
        odio a ligula cursus, in ultricies justo pharetra. Suspendisse potenti.
        Nulla facilisi. Proin quis risus vel odio ullamcorper vestibulum.
      </p>

      <p>
        <input
          style={{
            flex: 1,
            borderRadius: "0px",
            marginTop: "15px",
            marginBottom: "15px",
            width: "100%",
            border: "2px dotted #fff",
            background: 'rgba(255,255,255,0.3)',
            outline: 'none'
          }}
          type="text"
          value={firstStyleBox}
          onChange={(e) => {
            setFirstStyleBox(e.target.value);
          }}
          placeholder="Enter details here"
        />
      </p>




      {/* _______________________________________ */}

      <div style={{ fontSize: "1.3rem", marginTop: '15px' }}>Your Experience</div>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed faucibus
        odio a ligula cursus, in ultricies justo pharetra. Suspendisse potenti.
        Nulla facilisi. Proin quis risus vel odio ullamcorper vestibulum.
      </p>

      <p>
        <input
          style={{
            flex: 1,
            borderRadius: "0px",
            marginTop: "15px",
            marginBottom: "15px",
            width: "100%",
            border: "2px dotted #fff",
            background: 'rgba(255,255,255,0.3)', outline: 'none'
          }}
          type="text"
          value={secondStyleBox}
          onChange={(e) => {
            setSecondStyleBox(e.target.value);
          }}
          placeholder="Enter details here"
        />
      </p>

      
    </div>
  );
}

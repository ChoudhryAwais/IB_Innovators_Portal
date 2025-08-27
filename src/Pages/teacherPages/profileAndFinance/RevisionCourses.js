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

export function RevisionCourses() {
  const {
    userDetails,
    userId
  } = useContext(MyContext);

  const [wantToTeachRevisionCourse, setWantToTeachRevisionCourse] = useState(userDetails?.wantToTeachRevisionCourse ? userDetails?.wantToTeachRevisionCourse : false);

  const [editing, setEditing] = useState(false);
  const [savingDetails, setSavingDetails] = useState(false);

  async function savingChanges() {
    
      
    setSavingDetails(true);
    try {
      const details = {wantToTeachRevisionCourse};
  
      const userListRef = collection(db, 'userList');
      const q = query(userListRef, where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
  
      if (!querySnapshot.empty) {
        const docRef = querySnapshot.docs[0].ref;
  
        // Update only the specified fields in the document
        await updateDoc(docRef, details);
      }
  
      setSavingDetails(false);
      setEditing(false)
    } catch (e) {
      console.error('Error saving changes:', e);
      alert("Error saving changes. Please try again");
      setSavingDetails(false);
    }

  }


  return (
    <div
    >
      <div
        style={{
          flex: 1,
          justifyContent: "space-between",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center", marginBottom: '20px'
        }}
      >
        <div
          style={{ textAlign: "left", fontSize: "1.5rem", fontWeight: "bold" }}
        >
          Revision Courses
        </div>

        {editing===false ? 
        <button onClick={() => {setEditing(true)}} style={{border: '1px solid #000', color: '#000', background: 'transparent', borderRadius: '0px', padding: '5px 10px'}}>EDIT</button>
            :
<div style={{display:'flex', gap: '10px'}}>
<button onClick={() => {setEditing(false)}} style={{border: '1px solid red', color: 'white', background: 'red', borderRadius: '0px', padding: '5px 10px'}}>CANCEL</button>

         <button onClick={savingChanges} style={{border: '1px solid green', color: 'white', background: 'green', borderRadius: '0px', padding: '5px 10px'}}>{savingDetails ? "SAVING" : "SAVE"}</button>
</div>
      }
      </div>

      <div>
        <div style={{fontSize: 'small'}}>I'm interested in teaching a revision course</div>


        <p style={{fontWeight: 'bold', marginBottom: '20px'}}>
      {editing === false ? (
        <span style={{ fontWeight: "bold" }}>
            {userDetails?.wantToTeachRevisionCourse === true
    ? "Yes, I would like to teach online courses."
    : userDetails?.wantToTeachRevisionCourse === false
    ? "No, I am unable to teach them at the moment."
    : "No, I am unable to teach them at the moment."}
            </span>
      ) : (
        <div >
          <label style={{marginRight: '20px'}}>
            <input
              type="radio"
              value={true}
              checked={wantToTeachRevisionCourse === true}
              onChange={() => setWantToTeachRevisionCourse(true)}
            />
            Yes
          </label>
          <label style={{marginRight: '20px'}}>
            <input
              type="radio"
              value={false}
              checked={wantToTeachRevisionCourse === false}
              onChange={() => setWantToTeachRevisionCourse(false)}
            />
            No
          </label>
        </div>
      )}
    </p>

      </div>

    </div>
  );
}

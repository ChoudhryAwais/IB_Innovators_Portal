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

export function ProfileIBForm({userDetails, userId}) {

  const [editing, setEditing] = useState(false);

  const [ ibDiploma, setIbDiploma] = useState(userDetails?.ibCompletion?.ibDiploma ? userDetails?.ibCompletion?.ibDiploma : false);
  const [ibMyp, setIbMyp] = useState(userDetails?.ibCompletion?.ibMyp ? userDetails?.ibCompletion?.ibMyp : false);
  const [ibPyp, setIbPyp] = useState(userDetails?.ibCompletion?.ibPyp ? userDetails?.ibCompletion?.ibPyp : false);

  const [savingDetails, setSavingDetails] = useState(false);

  async function savingChanges() {
    
      
    setSavingDetails(true);
    try {
      const details = {ibCompletion: {ibDiploma, ibMyp, ibPyp}};
  
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
    <div style={{marginTop: '20px', paddingBottom: '20px', borderBottom: '1px solid #ccc'}}>
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
          International Baccalaureate
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

      <p>
      <span style={{ fontSize: "small" }}>Did you complete IB Diploma?</span>
      <br />
      {editing === false ? (
        <span style={{ fontWeight: "bold" }}>
            {userDetails?.ibCompletion?.ibDiploma === true
    ? "Yes"
    : userDetails?.ibCompletion?.ibDiploma === false
    ? "No"
    : "N/A"}
            </span>
      ) : (
        <div >
          <label style={{marginRight: '20px'}}>
            <input
              type="radio"
              value={true}
              checked={ibDiploma === true}
              onChange={() => setIbDiploma(true)}
            />
            Yes
          </label>
          <label style={{marginRight: '20px'}}>
            <input
              type="radio"
              value={false}
              checked={ibDiploma === false}
              onChange={() => setIbDiploma(false)}
            />
            No
          </label>
        </div>
      )}
    </p>

    <p>
      <span style={{ fontSize: "small" }}>Did you complete IB MYP?</span>
      <br />
      {editing === false ? (
        <span style={{ fontWeight: "bold" }}>
                        {userDetails?.ibCompletion?.ibMyp === true
    ? "Yes"
    : userDetails?.ibCompletion?.ibMyp === false
    ? "No"
    : "N/A"}
    </span>
      ) : (
        <div>
          <label style={{marginRight: '20px'}}>
            <input
              type="radio"
              value={true}
              checked={ibMyp === true}
              onChange={() => setIbMyp(true)}
            />
            Yes
          </label>
          <label style={{marginRight: '20px'}}>
            <input
              type="radio"
              value={false}
              checked={ibMyp === false}
              onChange={() => setIbMyp(false)}
            />
            No
          </label>
        </div>
      )}
    </p>

    <p>
      <span style={{ fontSize: "small" }}>Did you complete IB PYP?</span>
      <br />
      {editing === false ? (
        <span style={{ fontWeight: "bold" }}>
            {userDetails?.ibCompletion?.ibPyp === true
    ? "Yes"
    : userDetails?.ibCompletion?.ibPyp === false
    ? "No"
    : "N/A"}
            </span>
      ) : (
        <div>
          <label style={{marginRight: '20px'}}>
            <input
              type="radio"
              value={true}
              checked={ibPyp === true}
              onChange={() => setIbPyp(true)}
            />
            Yes
          </label>
          <label style={{marginRight: '20px'}}>
            <input
              type="radio"
              value={false}
              checked={ibPyp === false}
              onChange={() => setIbPyp(false)}
            />
            No
          </label>
        </div>
      )}
    </p>


    </div>
  );
}

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
import { VapeFree } from "@mui/icons-material";

export function ContactInformation({userDetails, userId}) {

  const [editing, setEditing] = useState(false);

  const [name, setName] = useState(userDetails?.userName);
  const [city, setCity] = useState(userDetails?.city);
  const [state, setState] = useState(userDetails?.state);
  const [postal, setPostal] = useState(userDetails?.zip);

  const [phone, setPhone] = useState(userDetails?.phone);

  const [savingDetails, setSavingDetails] = useState(false);

  async function savingChanges() {
    
    if(name!=="" && city!=="" && state!=="" && postal!==""){
      
    setSavingDetails(true);
    try {
      var details = {};
      if(name!=="" && city!=="" && state!=="" && postal!==""){

      } else if(name!==""){
        details = {
          userName: name,
        };
      } else if(city!==""){
        details = {
          city
        };
      } else if(city!==""){
        details = {
          state
        };
      } else if(city!==""){
        details = {
          zip: postal
        };
      }
  
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
  } else{alert("Please Fill All Fields")}

  }


  return (
    <div>
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
          Contact Information
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
        <span style={{ fontWeight: "bold" }}>Name: </span>
        {editing===false ? 
      <>
      {userDetails?.userName ? userDetails?.userName : "N/A"}
      </>
      :
      <input  type="text" value={name} onChange={(e) => {setName(e.target.value)}} placeholder="Enter Name" />
      }
        
      </p>
      <p>
        <span style={{ fontWeight: "bold" }}>Email: </span>
      {userDetails?.email ? userDetails?.email : "N/A"}
      </p>
      <p>
        <span style={{ fontWeight: "bold" }}>Phone: </span>
        {editing===false ? 
      <>
      {userDetails?.phone ? userDetails?.phone : 'N/A' }
      </>
      :
      <input type="text" value={phone} onChange={(e) => {setPhone(e.target.value)}} placeholder="Enter Phone Number" />
      }
      </p>
      <p>
        <span style={{ fontWeight: "bold" }}>City: </span>
        {editing===false ? 
      <>
      {userDetails?.city ? userDetails?.city : 'N/A'}
      </>
      :
      <input type="text" value={city} onChange={(e) => {setCity(e.target.value)}} placeholder="Enter City" />
      }
      </p>
      <p>
        <span style={{ fontWeight: "bold" }}>State: </span>
        {editing===false ? 
      <>
      {userDetails?.state ? userDetails?.state : "N/A"}
      </>
      :
      <input type="text" value={state} onChange={(e) => {setState(e.target.value)}} placeholder="Enter State" />
      }
      </p>
      <p>
        <span style={{ fontWeight: "bold" }}>Postal Code: </span>
      {editing===false ? 
      <>
      {userDetails?.zip ? userDetails?.zip : "N/A"} 
      </>
      :
      <input type="text" value={postal} onChange={(e) => {setPostal(e.target.value)}} placeholder="Enter Postal Code" />
      }
      </p>

{/* 
      <p style={{ fontWeight: "bold", textAlign: "center" }}>
        To change personal information please contact{" "}
        <span style={{ textDecoration: "underline", fontWeight: "bold" }}>
          IB INNOVATORS
        </span>
      </p> */}
    </div>
  );
}

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

export function ContactInformation() {
  const { userDetails, userId } = useContext(MyContext);

  const [editing, setEditing] = useState(false);

  const [name, setName] = useState(userDetails?.userName);
  const [city, setCity] = useState(userDetails?.otherInformation?.userDetails?.city || "");
  const [state, setState] = useState(userDetails?.otherInformation?.userDetails?.state || "");
  const [postal, setPostal] = useState(userDetails?.otherInformation?.userDetails?.zip || "");
  const [phone, setPhone] = useState(userDetails?.phone || "");

  
  const [relation, setRelation] = useState(userDetails?.otherInformation?.userDetails?.relation || "");
  const [parentFirstName, setParentFirstName] = useState(userDetails?.otherInformation?.userDetails?.parentFirstName || "");
  const [parentLastName, setParentLastName] = useState(userDetails?.otherInformation?.userDetails?.parentLastName || "");
  const [parentPhone, setParentPhone] = useState(userDetails?.otherInformation?.userDetails?.parentPhone || "");
  const [parentEmail, setParentEmail] = useState(userDetails?.otherInformation?.userDetails?.parentEmail || "");

  const [savingDetails, setSavingDetails] = useState(false);

  async function savingChanges() {
    
    if(name!=="" && city!=="" && state!=="" && postal!==""){
      
    setSavingDetails(true);
    try {
      const details = {
        userName: name,
        phone: phone,
        otherInformation: {
          ...userDetails?.otherInformation, userDetails: {
            ...userDetails?.otherInformation.userDetails,
            city,
            state,
            zip: postal,
            relation,
            parentFirstName,
            parentLastName,
            parentPhone,
            parentEmail
          }
        }
      };
  
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
      {userDetails?.otherInformation?.userDetails?.city ? userDetails?.otherInformation?.userDetails?.city : 'N/A'}
      </>
      :
      <input type="text" value={city} onChange={(e) => {setCity(e.target.value)}} placeholder="Enter City" />
      }
      </p>
      <p>
        <span style={{ fontWeight: "bold" }}>State: </span>
        {editing===false ? 
      <>
      {userDetails?.otherInformation?.userDetails?.state ? userDetails?.otherInformation?.userDetails?.state : "N/A"}
      </>
      :
      <input type="text" value={state} onChange={(e) => {setState(e.target.value)}} placeholder="Enter State" />
      }
      </p>
      <p>
        <span style={{ fontWeight: "bold" }}>Postal Code: </span>
      {editing===false ? 
      <>
      {userDetails?.otherInformation?.userDetails?.zip ? userDetails?.otherInformation?.userDetails?.zip : "N/A"} 
      </>
      :
      <input type="text" value={postal} onChange={(e) => {setPostal(e.target.value)}} placeholder="Enter Postal Code" />
      }
      </p>
      {/* <p>
        <span style={{ fontWeight: "bold" }}>Country: </span>
      {editing===false ? 
      <>
      {userDetails?.otherInformation?.userDetails?.country?.label ? userDetails?.otherInformation?.userDetails?.country?.label : "N/A"} 
      </>
      :
      <input type="text" value={postal} onChange={(e) => {setPostal(e.target.value)}} placeholder="Enter Country" />
      }
      </p> */}

{/* 
      <p style={{ fontWeight: "bold", textAlign: "center" }}>
        To change personal information please contact{" "}
        <span style={{ textDecoration: "underline", fontWeight: "bold" }}>
          IB INNOVATORS
        </span>
      </p> */}
      <br/>
      <div style={{fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '20px'}}>
      Parent / Guardian Information
      </div>
      <p>
        <span style={{ fontWeight: "bold" }}>Relation: </span>
      {editing===false ? 
      <>
      {userDetails?.otherInformation?.userDetails?.relation ? userDetails?.otherInformation?.userDetails?.relation : "N/A"} 
      </>
      :
      <input type="text" value={relation} onChange={(e) => {setRelation(e.target.value)}} placeholder="Enter relation with guardian" />
      }
      </p>
      <p>
        <span style={{ fontWeight: "bold" }}>First Name: </span>
      {editing===false ? 
      <>
      {userDetails?.otherInformation?.userDetails?.parentFirstName ? userDetails?.otherInformation?.userDetails?.parentFirstName : "N/A"} 
      </>
      :
      <input type="text" value={parentFirstName} onChange={(e) => {setParentFirstName(e.target.value)}} placeholder="Enter Guardian First Name" />
      }
      </p>

      <p>
        <span style={{ fontWeight: "bold" }}>Last Name: </span>
      {editing===false ? 
      <>
      {userDetails?.otherInformation?.userDetails?.parentLastName ? userDetails?.otherInformation?.userDetails?.parentLastName : "N/A"} 
      </>
      :
      <input type="text" value={parentLastName} onChange={(e) => {setParentLastName(e.target.value)}} placeholder="Enter Guardian Last Name" />
      }
      </p>

      <p>
        <span style={{ fontWeight: "bold" }}>Phone: </span>
      {editing===false ? 
      <>
      {userDetails?.otherInformation?.userDetails?.parentPhone ? userDetails?.otherInformation?.userDetails?.parentPhone : "N/A"} 
      </>
      :
      <input type="text" value={parentPhone} onChange={(e) => {setParentPhone(e.target.value)}} placeholder="Enter guardian phone" />
      }
      </p>

      <p>
        <span style={{ fontWeight: "bold" }}>Email: </span>
      {editing===false ? 
      <>
      {userDetails?.otherInformation?.userDetails?.parentEmail ? userDetails?.otherInformation?.userDetails?.parentEmail : "N/A"} 
      </>
      :
      <input type="text" value={parentEmail} onChange={(e) => {setParentEmail(e.target.value)}} placeholder="Enter guardian email" />
      }
      </p>


    </div>
  );
}

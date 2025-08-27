import React, { useState, useContext, useEffect } from "react";
import {
  collection,
  doc,
  getDocs,
  query,
  onSnapshot,
  where,
  updateDoc,
  setDoc
} from "firebase/firestore";
import { MyContext } from "../../../Context/MyContext";
import { db } from "../../../firebase";


export function EducationHistory() {
  const { userDetails, userId } = useContext(MyContext);
  
  const [savingDetails, setSavingDetails] = useState(false);
  const [editing, setEditing] = useState(false);
  const [educationRecords, setEducationRecords] = useState(userDetails?.educationRecords ? userDetails?.educationRecords : [] );

  const [newRecord, setNewRecord] = useState({
    id: null,
    qualificationTitle: "",
    yearOfGraduation: "",
    university: "",
    grade: "",
  });

  useEffect(() => {
    if(editing===false){
      setEducationRecords(userDetails?.educationRecords ? userDetails?.educationRecords : [])
    }
  }, [editing])

  const [addingNewRecord, setAddingNewRecord] = useState(false);

  async function savingChanges() {
    setSavingDetails(true);
  
    try {
      const userListRef = collection(db, "userList");
      const q = query(userListRef, where("userId", "==", userId));
      const querySnapshot = await getDocs(q);
  
      if (!querySnapshot.empty) {
        const docRef = querySnapshot.docs[0].ref;
  
        // Replace the entire educationRecords array in the document
        await setDoc(docRef, { educationRecords }, { merge: true });
      } 
  
      setSavingDetails(false);
      setEditing(false);
    } catch (e) {
      console.error("Error saving changes:", e);
      alert("Error saving changes. Please try again");
      setSavingDetails(false);
    }
  }

  const removeEducationRecord = (id) => {
    const updatedRecords = educationRecords.filter((record) => record.id !== id);
    setEducationRecords(updatedRecords);
  };

  const handleInputChange = (field, value) => {
    setNewRecord({ ...newRecord, [field]: value });
  };

  const renderEducationRecords = () => {
    return educationRecords.map((record) => (
      <div key={record.id} style={{ flex: 1, marginBottom: "20px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", flex: 1 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "small" }}>Qualification Title</div>
            <div style={{ fontSize: "medium" }}>{record.qualificationTitle}</div>
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "small" }}>Year of Graduation</div>
            <div style={{ fontSize: "medium" }}>{record.yearOfGraduation}</div>
          </div>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", flex: 1 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "small" }}>University</div>
            <div style={{ fontSize: "medium" }}>{record.university}</div>
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "small" }}>Grade (Or in progress)</div>
            <div style={{ fontSize: "medium" }}>{record.grade}/4</div>
          </div>
        </div>
{editing === true && 
        <button 
          style={{padding: '3px 6px', borderRadius: '0px', background: 'red'}} onClick={() => removeEducationRecord(record.id)}>
          Remove Record
        </button>

}
      </div>
    ));
  };

  const renderNewRecordInputs = () => {
    return (
      <div key={newRecord.id} style={{ flex: 1, marginBottom: "20px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", flex: 1 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "small" }}>Qualification Title</div>
            <input
              type="text"
              value={newRecord.qualificationTitle}
              onChange={(e) => handleInputChange("qualificationTitle", e.target.value)}
            />
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "small" }}>Year of Graduation</div>
            <input
              type="text"
              value={newRecord.yearOfGraduation}
              onChange={(e) => handleInputChange("yearOfGraduation", e.target.value)}
            />
          </div>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", flex: 1 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "small" }}>University</div>
            <input
              type="text"
              value={newRecord.university}
              onChange={(e) => handleInputChange("university", e.target.value)}
            />
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "small" }}>Grade (Or in progress)</div>
            <input
              type="text"
              value={newRecord.grade}
              onChange={(e) => handleInputChange("grade", e.target.value)}
            />
          </div>
        </div>
        <div style={{flex: 1, display: 'flex', gap: '10px', marginTop: '15px'}}>
        <button 
          style={{padding: '3px 6px', borderRadius: '0px', background: 'red'}} onClick={() => setAddingNewRecord(false)}>
          Cancel
        </button>
        <button
          style={{padding: '3px 6px', borderRadius: '0px', background: 'green'}}
          onClick={() => {
            setEducationRecords([...educationRecords, newRecord]);
            setAddingNewRecord(false);
          }}
        >
          Add
        </button>
        </div>
      </div>
    );
  };




  return (
    <div style={{paddingBottom: '10px'}}>

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
          Education History
        </div>

        {editing===false ? 
        <button onClick={() => {setEditing(true)}} style={{border: '1px solid #000', color: '#000', background: 'transparent', borderRadius: '0px', padding: '5px 10px'}}>EDIT</button>
            :
<div style={{display:'flex', gap: '10px'}}>
<button onClick={() => {setEditing(false)}} style={{border: '1px solid red', color: 'white', background: 'red', borderRadius: '0px', padding: '5px 10px'}}>CANCEL</button>

         <button 
         onClick={savingChanges} 
         style={{border: '1px solid green', color: 'white', background: 'green', borderRadius: '0px', padding: '5px 10px'}}>{savingDetails ? "SAVING" : "SAVE"}</button>
</div>
      }
      </div>
      
      {educationRecords.length !== 0 ? renderEducationRecords() : <div style={{marginBottom: '10px'}}>No Educational History</div>}
      

      {editing===true && 
      
      <>
      
      
      {addingNewRecord ? (
        renderNewRecordInputs()
      ) : (
        <button
          style={{padding: '3px 6px', borderRadius: '0px'}}
          onClick={() => {
            const newId = Math.floor(1000000000 + Math.random() * 9000000000);
            setNewRecord({
              id: newId,
              qualificationTitle: "",
              yearOfGraduation: "",
              university: "",
              grade: "",
            });
            setAddingNewRecord(true);
          }}
        >
          Add New Record
        </button>
      )}

</>
      }
    </div>
  );
}

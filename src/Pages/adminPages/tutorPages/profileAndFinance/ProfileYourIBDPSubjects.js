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
import { db } from "../../../../firebase";

export function ProfileYourIBDPSubjects({userDetails, userId}) {
  
  const [savingDetails, setSavingDetails] = useState(false);
  const [editing, setEditing] = useState(false);
  const [ibdpSubjects, setIbdpSubjects] = useState(userDetails?.yourIbdpSubjects ? userDetails?.yourIbdpSubjects : [] );

  const [newRecord, setNewRecord] = useState({
    id: null,
    subject: "",
    score: "",
    level: "",
  });

  useEffect(() => {
    if(editing===false){
        setIbdpSubjects(userDetails?.ibdpSubjects ? userDetails?.ibdpSubjects : [])
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
  
        // Replace the entire ibdpSubjects array in the document
        await setDoc(docRef, { ibdpSubjects }, { merge: true });
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
    const updatedRecords = ibdpSubjects.filter((record) => record.id !== id);
    setIbdpSubjects(updatedRecords);
  };

  const handleInputChange = (field, value) => {
    setNewRecord({ ...newRecord, [field]: value });
  };

  const renderIBDPSubjects = () => {
    return ibdpSubjects.map((record) => (
      <div key={record.id} style={{ flex: 1, marginBottom: "20px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", flex: 1 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "small" }}>Subject</div>
            <div style={{ fontSize: "medium" }}>{record.subject}</div>
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "small" }}>Score</div>
            <div style={{ fontSize: "medium" }}>{record.score}</div>
          </div>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", flex: 1 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "small" }}>Level</div>
            <div style={{ fontSize: "medium" }}>{record.level}</div>
          </div>

        </div>
{editing === true && 
        <button 
          style={{padding: '3px 6px', borderRadius: '0px', background: 'red'}} onClick={() => removeEducationRecord(record.id)}>
          Remove Subject
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
            <div style={{ fontSize: "small" }}>Subject</div>
            <input
              type="text"
              value={newRecord.subject}
              onChange={(e) => handleInputChange("subject", e.target.value)}
            />
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "small" }}>Score</div>
            <input
              type="text"
              value={newRecord.score}
              onChange={(e) => handleInputChange("score", e.target.value)}
            />
          </div>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", flex: 1 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "small" }}>Level</div>
            <input
              type="text"
              value={newRecord.level}
              onChange={(e) => handleInputChange("level", e.target.value)}
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
            setIbdpSubjects([...ibdpSubjects, newRecord]);
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
    <div style={{paddingBottom: '10px', borderBottom: '1px solid #ccc', marginTop: '20px'}}>

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
          Your IBDP Subjects
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
      
      {ibdpSubjects.length !== 0 ? renderIBDPSubjects() : <div style={{marginBottom: '10px'}}>No IBDP Subjects</div>}
      

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
              subject: "",
              score: "",
              level: "",
            });
            setAddingNewRecord(true);
          }}
        >
          Add New Subject
        </button>
      )}

</>
      }
    </div>
  );
}

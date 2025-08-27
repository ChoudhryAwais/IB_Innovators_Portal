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

export function ProfessionalTeachingExperience() {
  const { userDetails, userId } = useContext(MyContext);

  const [editing, setEditing] = useState(false);


  const [professionalIBTeacherExperience, setProfessionalIBTeacherExperience] = useState(userDetails?.professionalTeachingExperience?.professionalIBTeacherExperience ? userDetails?.professionalTeachingExperience?.professionalIBTeacherExperience : false)
    const [actedAsIBExaminer, setActedAsIBExaminer] = useState(userDetails?.professionalTeachingExperience?.actedAsIBExaminer ? userDetails?.professionalTeachingExperience?.actedAsIBExaminer : "")
    const [detailSubjectsAndPapersModerated, setDetailSubjectsAndPapersModerated] = useState(userDetails?.professionalTeachingExperience?.detailSubjectsAndPapersModerated ? userDetails?.professionalTeachingExperience?.detailSubjectsAndPapersModerated : "")
    const [supportingStudentWithSpecialNeeds, setSupportingStudentWithSpecialNeeds] = useState(userDetails?.professionalTeachingExperience?.supportingStudentWithSpecialNeeds ? userDetails?.professionalTeachingExperience?.supportingStudentWithSpecialNeeds : false)
    const [explainSENExperience, setExplainSENExperience] = useState(userDetails?.professionalTeachingExperience?.explainSENExperience ? userDetails?.professionalTeachingExperience?.explainSENExperience : '')
    const[otherEducationalProgrammes, setOtherEducationalProgrammes] = useState(userDetails?.professionalTeachingExperience?.otherEducationalProgrammes ? userDetails?.professionalTeachingExperience?.otherEducationalProgrammes  :"")

  const [savingDetails, setSavingDetails] = useState(false);

  async function savingChanges() {
    
      setSavingDetails(true);
      try {
        const details = { professionalTeachingExperience: {
            professionalIBTeacherExperience,
            actedAsIBExaminer,
            detailSubjectsAndPapersModerated,
            supportingStudentWithSpecialNeeds,
            explainSENExperience,
            otherEducationalProgrammes
        } };

        const userListRef = collection(db, "userList");
        const q = query(userListRef, where("userId", "==", userId));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const docRef = querySnapshot.docs[0].ref;

          // Update only the specified fields in the document
          await updateDoc(docRef, details);
        }

        setSavingDetails(false);
        setEditing(false);
      } catch (e) {
        console.error("Error saving changes:", e);
        alert("Error saving changes. Please try again");
        setSavingDetails(false);
      }
  }

  return (
    <div
      style={{
        marginTop: "20px",
        paddingBottom: "20px",
        borderBottom: "1px solid #ccc",
      }}
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
          Professional Teaching Experience
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


      <div style={{ marginBottom: '10px'}}>
      <span style={{ fontSize: "small" }}>Do you have experience working professionally as a teacher in on IB World School? </span>

      {editing === false ? (
        <span style={{ fontWeight: "bold" }}>
            {userDetails?.professionalTeachingExperience?.professionalIBTeacherExperience === true
    ? "Yes"
    : userDetails?.professionalTeachingExperience?.professionalIBTeacherExperience === false
    ? "No"
    : "N/A"}
            </span>
      ) : (
        <div >
          <label style={{marginRight: '20px'}}>
            <input
              type="radio"
              value={true}
              checked={professionalIBTeacherExperience === true}
              onChange={() => setProfessionalIBTeacherExperience(true)}
            />
            Yes
          </label>
          <label style={{marginRight: '20px'}}>
            <input
              type="radio"
              value={false}
              checked={professionalIBTeacherExperience === false}
              onChange={() => setProfessionalIBTeacherExperience(false)}
            />
            No
          </label>
        </div>
      )}
    </div>

    <div style={{ marginBottom: '10px'}}>
      <span style={{ fontSize: "small" }}>Have you ever acted as IB Examiner? </span>

      {editing === false ? (
        <span style={{ fontWeight: "bold" }}>
            {userDetails?.professionalTeachingExperience?.actedAsIBExaminer === true
    ? "Yes"
    : userDetails?.professionalTeachingExperience?.actedAsIBExaminer === false
    ? "No"
    : "N/A"}
            </span>
      ) : (
        <div >
          <label style={{marginRight: '20px'}}>
            <input
              type="radio"
              value={true}
              checked={actedAsIBExaminer === true}
              onChange={() => setActedAsIBExaminer(true)}
            />
            Yes
          </label>
          <label style={{marginRight: '20px'}}>
            <input
              type="radio"
              value={false}
              checked={actedAsIBExaminer === false}
              onChange={() => setActedAsIBExaminer(false)}
            />
            No
          </label>
        </div>
      )}
    </div>


    <div style={{ marginBottom: '10px'}}>
        <div style={{ fontSize: "small" }}>If yes then please detail subject(s) and paper(s) and year you've moderated</div>
        {editing === false ? (
          <div style={{fontWeight: 'bold'}}>
            {userDetails?.professionalTeachingExperience?.detailSubjectsAndPapersModerated
              ? userDetails?.professionalTeachingExperience?.detailSubjectsAndPapersModerated
              : "N/A"}
          </div>
        ) : (
          <input
            type="text"
            value={detailSubjectsAndPapersModerated}
            onChange={(e) => {
              setDetailSubjectsAndPapersModerated(e.target.value);
            }}
            placeholder="Enter details here"
          />
        )}
      </div>


<div style={{ marginBottom: '10px'}}>
      <span style={{ fontSize: "small" }}>Do you have any experience supporting students with Special Educational Needs (SEN)? </span>

      {editing === false ? (
        <span style={{ fontWeight: "bold" }}>
            {userDetails?.professionalTeachingExperience?.supportingStudentWithSpecialNeeds === true
    ? "Yes"
    : userDetails?.professionalTeachingExperience?.supportingStudentWithSpecialNeeds === false
    ? "No"
    : "N/A"}
            </span>
      ) : (
        <div >
          <label style={{marginRight: '20px'}}>
            <input
              type="radio"
              value={true}
              checked={supportingStudentWithSpecialNeeds === true}
              onChange={() => setSupportingStudentWithSpecialNeeds(true)}
            />
            Yes
          </label>
          <label style={{marginRight: '20px'}}>
            <input
              type="radio"
              value={false}
              checked={supportingStudentWithSpecialNeeds === false}
              onChange={() => setSupportingStudentWithSpecialNeeds(false)}
            />
            No
          </label>
        </div>
      )}
    </div>


    <div style={{ marginBottom: '10px'}}>
        <div style={{ fontSize: "small" }}>If yes then please detail the SENs you've had experience with</div>
        {editing === false ? (
          <div style={{fontWeight: 'bold'}}>
            {userDetails?.professionalTeachingExperience?.explainSENExperience
              ? userDetails?.professionalTeachingExperience?.explainSENExperience
              : "N/A"}
          </div>
        ) : (
          <input
            type="text"
            value={explainSENExperience}
            onChange={(e) => {
              setExplainSENExperience(e.target.value);
            }}
            placeholder="Enter details here"
          />
        )}
      </div>



      <div style={{ marginBottom: '10px'}}>
        <div style={{ fontSize: "small" }}>Other Educational Programmes</div>
        {editing === false ? (
          <div style={{fontWeight: 'bold'}}>
            {userDetails?.professionalTeachingExperience?.otherEducationalProgrammes
              ? userDetails?.professionalTeachingExperience?.otherEducationalProgrammes
              : "N/A"}
          </div>
        ) : (
          <input
            type="text"
            value={otherEducationalProgrammes}
            onChange={(e) => {
              setOtherEducationalProgrammes(e.target.value);
            }}
            placeholder="Enter details here"
          />
        )}
      </div>



    </div>
  );
}

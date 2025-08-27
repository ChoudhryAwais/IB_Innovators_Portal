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

export function ProfileAdditionalIBInfo({userDetails, userId}) {

  const [editing, setEditing] = useState(false);


  const [tokGrade, setTokGrade] = useState(
    userDetails?.profileAdditionalIBInfo?.tokGrade
      ? userDetails?.profileAdditionalIBInfo?.tokGrade
      : ""
  );
  const [totalIbScore, setTotalIbScore] = useState(
    userDetails?.profileAdditionalIBInfo?.totalIbScore
      ? userDetails?.profileAdditionalIBInfo?.totalIbScore
      : ""
  );
  const [eeSubjectArea, setEeSubjectArea] = useState(
    userDetails?.profileAdditionalIBInfo?.eeSubjectArea
      ? userDetails?.profileAdditionalIBInfo?.eeSubjectArea
      : ""
  );
  const [secondEeSubjectArea, setSecondEeSubjectArea] = useState(
    userDetails?.profileAdditionalIBInfo?.secondEeSubjectArea
      ? userDetails?.profileAdditionalIBInfo?.secondEeSubjectArea
      : ""
  );
  const [yourIbSchool, setYourIbSchool] = useState(
    userDetails?.profileAdditionalIBInfo?.yourIbSchool
      ? userDetails?.profileAdditionalIBInfo?.yourIbSchool
      : ""
  );
  const [additionalInfo, setAdditionalInfo] = useState(
    userDetails?.profileAdditionalIBInfo?.additionalInfo
      ? userDetails?.profileAdditionalIBInfo?.additionalInfo
      : ""
  );

  const [savingDetails, setSavingDetails] = useState(false);

  async function savingChanges() {
    
      setSavingDetails(true);
      try {
        const details = { profileAdditionalIBInfo: {
            tokGrade,
            totalIbScore,
            eeSubjectArea,
            secondEeSubjectArea,
            yourIbSchool,
            additionalInfo
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
          justifyContent: "flex-end",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          marginBottom: "10px",
        }}
      >
        {editing === false ? (
          <button
            onClick={() => {
              setEditing(true);
            }}
            style={{
              border: "1px solid #000",
              color: "#000",
              background: "transparent",
              borderRadius: "0px",
              padding: "5px 10px",
            }}
          >
            EDIT
          </button>
        ) : (
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={() => {
                setEditing(false);
              }}
              style={{
                border: "1px solid red",
                color: "white",
                background: "red",
                borderRadius: "0px",
                padding: "5px 10px",
              }}
            >
              CANCEL
            </button>

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
              {savingDetails ? "SAVING" : "SAVE"}
            </button>
          </div>
        )}
      </div>

      <div style={{display: 'flex', flex: 1, justifyContent: 'space-between', flexWrap: 'wrap', marginBottom: '10px'}}>

      <div style={{flex: 1}}>
        <div style={{ fontSize: "small" }}>TOK Grade</div>
        {editing === false ? (
          <div>
            {userDetails?.profileAdditionalIBInfo?.tokGrade
              ? userDetails?.profileAdditionalIBInfo?.tokGrade
              : "N/A"}
          </div>
        ) : (
          <input
            type="text"
            value={tokGrade}
            onChange={(e) => {
              setTokGrade(e.target.value);
            }}
            placeholder="Enter TOK Grade"
          />
        )}
      </div>

      <div style={{flex: 1}}>
        <div style={{ fontSize: "small" }}>Total IB Score</div>
        {editing === false ? (
          <div>
            {userDetails?.profileAdditionalIBInfo?.totalIbScore
              ? userDetails?.profileAdditionalIBInfo?.totalIbScore
              : "N/A"}
          </div>
        ) : (
          <input
            type="text"
            value={totalIbScore}
            onChange={(e) => {
              setTotalIbScore(e.target.value);
            }}
            placeholder="Enter Total IB Score"
          />
        )}
      </div>

      </div>


      <div style={{display: 'flex', flex: 1, justifyContent: 'space-between', flexWrap: 'wrap', marginBottom: '10px'}}>

      <div style={{flex: 1}}>
        <div style={{ fontSize: "small" }}>EE Subject Area</div>
        {editing === false ? (
          <div>
            {userDetails?.profileAdditionalIBInfo?.eeSubjectArea
              ? userDetails?.profileAdditionalIBInfo?.eeSubjectArea
              : "N/A"}
          </div>
        ) : (
          <input
            type="text"
            value={eeSubjectArea}
            onChange={(e) => {
              setEeSubjectArea(e.target.value);
            }}
            placeholder="Enter EE Subject Area"
          />
        )}
      </div>

      <div style={{flex: 1}}>
        <div style={{ fontSize: "small" }}>2nd EE Subject Area</div>
        {editing === false ? (
          <div>
            {userDetails?.profileAdditionalIBInfo?.secondEeSubjectArea
              ? userDetails?.profileAdditionalIBInfo?.secondEeSubjectArea
              : "N/A"}
          </div>
        ) : (
          <input
            type="text"
            value={secondEeSubjectArea}
            onChange={(e) => {
              setSecondEeSubjectArea(e.target.value);
            }}
            placeholder="Enter 2nd EE Subject Area"
          />
        )}
      </div>

      </div>

      <div style={{ marginBottom: '10px'}}>
        <div style={{ fontSize: "small" }}>Your IB School</div>
        {editing === false ? (
          <div>
            {userDetails?.profileAdditionalIBInfo?.yourIbSchool
              ? userDetails?.profileAdditionalIBInfo?.yourIbSchool
              : "N/A"}
          </div>
        ) : (
          <input
            type="text"
            value={yourIbSchool}
            onChange={(e) => {
              setYourIbSchool(e.target.value);
            }}
            placeholder="Enter Your IB School"
          />
        )}
      </div>

      <div>
        <div style={{ fontSize: "small" }}>
          Additional Information about your IB Education you think we should
          know about?
        </div>
        {editing === false ? (
          <div>
            {userDetails?.profileAdditionalIBInfo?.additionalInfo
              ? userDetails?.profileAdditionalIBInfo?.additionalInfo
              : "N/A"}
          </div>
        ) : (
          <input
            type="text"
            value={additionalInfo}
            onChange={(e) => {
              setAdditionalInfo(e.target.value);
            }}
            placeholder="Enter Additional Information"
          />
        )}
      </div>
    </div>
  );
}

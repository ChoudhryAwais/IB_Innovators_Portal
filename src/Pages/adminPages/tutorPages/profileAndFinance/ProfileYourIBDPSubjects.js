import React, { useState, useContext, useEffect } from "react";
import {
  collection,
  doc,
  getDocs,
  query,
  onSnapshot,
  where,
  updateDoc,
  setDoc,
} from "firebase/firestore";
import { db } from "../../../../firebase";

export function ProfileYourIBDPSubjects({ userDetails, userId }) {
  const [savingDetails, setSavingDetails] = useState(false);
  const [editing, setEditing] = useState(false);
  const [ibdpSubjects, setIbdpSubjects] = useState(
    userDetails?.yourIbdpSubjects ? userDetails?.yourIbdpSubjects : []
  );

  const [newRecord, setNewRecord] = useState({
    id: null,
    subject: "",
    score: "",
    level: "",
  });

  useEffect(() => {
    if (editing === false) {
      setIbdpSubjects(userDetails?.ibdpSubjects ? userDetails?.ibdpSubjects : []);
    }
  }, [editing]);

  const [addingNewRecord, setAddingNewRecord] = useState(false);

  async function savingChanges() {
    setSavingDetails(true);

    try {
      const userListRef = collection(db, "userList");
      const q = query(userListRef, where("userId", "==", userId));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docRef = querySnapshot.docs[0].ref;

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
      <div key={record.id} className="flex-1 mb-5">
        <div className="flex flex-wrap flex-1">
          <div className="flex-1">
            <div className="text-sm">Subject</div>
            <div className="text-base">{record.subject}</div>
          </div>

          <div className="flex-1">
            <div className="text-sm">Score</div>
            <div className="text-base">{record.score}</div>
          </div>
        </div>

        <div className="flex flex-wrap flex-1">
          <div className="flex-1">
            <div className="text-sm">Level</div>
            <div className="text-base">{record.level}</div>
          </div>
        </div>
        {editing === true && (
          <button
            className="px-2 py-1 rounded-none bg-red-600 text-white mt-2"
            onClick={() => removeEducationRecord(record.id)}
          >
            Remove Subject
          </button>
        )}
      </div>
    ));
  };

  const renderNewRecordInputs = () => {
    return (
      <div key={newRecord.id} className="flex-1 mb-5">
        <div className="flex flex-wrap flex-1">
          <div className="flex-1">
            <div className="text-sm">Subject</div>
            <input
              type="text"
              value={newRecord.subject}
              onChange={(e) => handleInputChange("subject", e.target.value)}
              className="border px-2 py-1 w-full"
            />
          </div>

          <div className="flex-1">
            <div className="text-sm">Score</div>
            <input
              type="text"
              value={newRecord.score}
              onChange={(e) => handleInputChange("score", e.target.value)}
              className="border px-2 py-1 w-full"
            />
          </div>
        </div>

        <div className="flex flex-wrap flex-1">
          <div className="flex-1">
            <div className="text-sm">Level</div>
            <input
              type="text"
              value={newRecord.level}
              onChange={(e) => handleInputChange("level", e.target.value)}
              className="border px-2 py-1 w-full"
            />
          </div>
        </div>
        <div className="flex-1 flex gap-3 mt-4">
          <button
            className="px-2 py-1 rounded-none bg-red-600 text-white"
            onClick={() => setAddingNewRecord(false)}
          >
            Cancel
          </button>
          <button
            className="px-2 py-1 rounded-none bg-green-600 text-white"
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
    <div className="pb-2 border-b border-gray-300 mt-5">
      <div className="flex justify-between flex-wrap items-center mb-5">
        <div className="text-left text-xl font-bold">Your IBDP Subjects</div>

        {editing === false ? (
          <button
            onClick={() => {
              setEditing(true);
            }}
            className="border border-black text-black bg-transparent rounded-none px-3 py-1"
          >
            EDIT
          </button>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={() => {
                setEditing(false);
              }}
              className="border border-red-600 text-white bg-red-600 rounded-none px-3 py-1"
            >
              CANCEL
            </button>

            <button
              onClick={savingChanges}
              className="border border-green-600 text-white bg-green-600 rounded-none px-3 py-1"
            >
              {savingDetails ? "SAVING" : "SAVE"}
            </button>
          </div>
        )}
      </div>

      {ibdpSubjects.length !== 0 ? (
        renderIBDPSubjects()
      ) : (
        <div className="mb-2">No IBDP Subjects</div>
      )}

      {editing === true && (
        <>
          {addingNewRecord ? (
            renderNewRecordInputs()
          ) : (
            <button
              className="px-2 py-1 rounded-none border"
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
      )}
    </div>
  );
}

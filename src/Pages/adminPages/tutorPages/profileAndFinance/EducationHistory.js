import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  setDoc,
} from "firebase/firestore";
import { db } from "../../../../firebase";

export function EducationHistory({ userDetails, userId }) {
  const [savingDetails, setSavingDetails] = useState(false);
  const [editing, setEditing] = useState(false);
  const [educationRecords, setEducationRecords] = useState(
    userDetails?.educationRecords ? userDetails?.educationRecords : []
  );

  const [newRecord, setNewRecord] = useState({
    id: null,
    qualificationTitle: "",
    yearOfGraduation: "",
    university: "",
    grade: "",
  });

  useEffect(() => {
    if (editing === false) {
      setEducationRecords(
        userDetails?.educationRecords ? userDetails?.educationRecords : []
      );
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
    const updatedRecords = educationRecords.filter(
      (record) => record.id !== id
    );
    setEducationRecords(updatedRecords);
  };

  const handleInputChange = (field, value) => {
    setNewRecord({ ...newRecord, [field]: value });
  };

  const renderEducationRecords = () => {
    return educationRecords.map((record) => (
      <div key={record.id} className="flex-1 mb-5">
        <div className="flex flex-wrap flex-1">
          <div className="flex-1">
            <div className="text-xs">Qualification Title</div>
            <div className="text-base">{record.qualificationTitle}</div>
          </div>

          <div className="flex-1">
            <div className="text-xs">Year of Graduation</div>
            <div className="text-base">{record.yearOfGraduation}</div>
          </div>
        </div>

        <div className="flex flex-wrap flex-1">
          <div className="flex-1">
            <div className="text-xs">University</div>
            <div className="text-base">{record.university}</div>
          </div>

          <div className="flex-1">
            <div className="text-xs">Grade (Or in progress)</div>
            <div className="text-base">{record.grade}/4</div>
          </div>
        </div>

        {editing === true && (
          <button
            className="px-2 py-1 bg-red-600 text-white rounded-none"
            onClick={() => removeEducationRecord(record.id)}
          >
            Remove Record
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
            <div className="text-xs">Qualification Title</div>
            <input
              type="text"
              value={newRecord.qualificationTitle}
              onChange={(e) =>
                handleInputChange("qualificationTitle", e.target.value)
              }
              className="border p-1 w-full"
            />
          </div>

          <div className="flex-1">
            <div className="text-xs">Year of Graduation</div>
            <input
              type="text"
              value={newRecord.yearOfGraduation}
              onChange={(e) =>
                handleInputChange("yearOfGraduation", e.target.value)
              }
              className="border p-1 w-full"
            />
          </div>
        </div>

        <div className="flex flex-wrap flex-1">
          <div className="flex-1">
            <div className="text-xs">University</div>
            <input
              type="text"
              value={newRecord.university}
              onChange={(e) =>
                handleInputChange("university", e.target.value)
              }
              className="border p-1 w-full"
            />
          </div>

          <div className="flex-1">
            <div className="text-xs">Grade (Or in progress)</div>
            <input
              type="text"
              value={newRecord.grade}
              onChange={(e) => handleInputChange("grade", e.target.value)}
              className="border p-1 w-full"
            />
          </div>
        </div>

        <div className="flex flex-1 gap-2 mt-4">
          <button
            className="px-2 py-1 bg-red-600 text-white rounded-none"
            onClick={() => setAddingNewRecord(false)}
          >
            Cancel
          </button>
          <button
            className="px-2 py-1 bg-green-600 text-white rounded-none"
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
    <div className="pb-2.5 border-b border-gray-300">
      <div className="flex flex-1 justify-between items-center flex-wrap mb-5">
        <div className="text-left text-2xl font-bold">
          Education History
        </div>

        {editing === false ? (
          <button
            onClick={() => {
              setEditing(true);
            }}
            className="border border-black text-black bg-transparent rounded-none px-3 py-1.5"
          >
            EDIT
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => {
                setEditing(false);
              }}
              className="border border-red-600 text-white bg-red-600 rounded-none px-3 py-1.5"
            >
              CANCEL
            </button>

            <button
              onClick={savingChanges}
              className="border border-green-600 text-white bg-green-600 rounded-none px-3 py-1.5"
            >
              {savingDetails ? "SAVING" : "SAVE"}
            </button>
          </div>
        )}
      </div>

      {educationRecords.length !== 0 ? (
        renderEducationRecords()
      ) : (
        <div className="mb-2.5">No Educational History</div>
      )}

      {editing === true && (
        <>
          {addingNewRecord ? (
            renderNewRecordInputs()
          ) : (
            <button
              className="px-2 py-1 border border-gray-400 rounded-none"
              onClick={() => {
                const newId = Math.floor(
                  1000000000 + Math.random() * 9000000000
                );
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
      )}
    </div>
  );
}

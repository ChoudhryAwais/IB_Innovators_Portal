import React, { useState } from "react";

import { db } from "../../../../firebase";
import {
  collection,
  getDocs,
  query,
  where,
  updateDoc,
} from "firebase/firestore";

export function ProfileIBForm({ userDetails, userId }) {
  const [editing, setEditing] = useState(false);

  const [ibDiploma, setIbDiploma] = useState(
    userDetails?.ibCompletion?.ibDiploma
      ? userDetails?.ibCompletion?.ibDiploma
      : false
  );
  const [ibMyp, setIbMyp] = useState(
    userDetails?.ibCompletion?.ibMyp ? userDetails?.ibCompletion?.ibMyp : false
  );
  const [ibPyp, setIbPyp] = useState(
    userDetails?.ibCompletion?.ibPyp ? userDetails?.ibCompletion?.ibPyp : false
  );

  const [savingDetails, setSavingDetails] = useState(false);

  async function savingChanges() {
    setSavingDetails(true);
    try {
      const details = { ibCompletion: { ibDiploma, ibMyp, ibPyp } };

      const userListRef = collection(db, "userList");
      const q = query(userListRef, where("userId", "==", userId));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docRef = querySnapshot.docs[0].ref;

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
    <div className="mt-5 pb-5 border-b border-gray-300">
      <div className="flex flex-1 justify-between flex-wrap items-center mb-5">
        <div className="text-left text-2xl font-bold">
          International Baccalaureate
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
          <div className="flex gap-2.5">
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

      <p>
        <span className="text-sm">Did you complete IB Diploma?</span>
        <br />
        {editing === false ? (
          <span className="font-bold">
            {userDetails?.ibCompletion?.ibDiploma === true
              ? "Yes"
              : userDetails?.ibCompletion?.ibDiploma === false
              ? "No"
              : "N/A"}
          </span>
        ) : (
          <div>
            <label className="mr-5">
              <input
                type="radio"
                value={true}
                checked={ibDiploma === true}
                onChange={() => setIbDiploma(true)}
              />
              <span className="ml-1">Yes</span>
            </label>
            <label className="mr-5">
              <input
                type="radio"
                value={false}
                checked={ibDiploma === false}
                onChange={() => setIbDiploma(false)}
              />
              <span className="ml-1">No</span>
            </label>
          </div>
        )}
      </p>

      <p>
        <span className="text-sm">Did you complete IB MYP?</span>
        <br />
        {editing === false ? (
          <span className="font-bold">
            {userDetails?.ibCompletion?.ibMyp === true
              ? "Yes"
              : userDetails?.ibCompletion?.ibMyp === false
              ? "No"
              : "N/A"}
          </span>
        ) : (
          <div>
            <label className="mr-5">
              <input
                type="radio"
                value={true}
                checked={ibMyp === true}
                onChange={() => setIbMyp(true)}
              />
              <span className="ml-1">Yes</span>
            </label>
            <label className="mr-5">
              <input
                type="radio"
                value={false}
                checked={ibMyp === false}
                onChange={() => setIbMyp(false)}
              />
              <span className="ml-1">No</span>
            </label>
          </div>
        )}
      </p>

      <p>
        <span className="text-sm">Did you complete IB PYP?</span>
        <br />
        {editing === false ? (
          <span className="font-bold">
            {userDetails?.ibCompletion?.ibPyp === true
              ? "Yes"
              : userDetails?.ibCompletion?.ibPyp === false
              ? "No"
              : "N/A"}
          </span>
        ) : (
          <div>
            <label className="mr-5">
              <input
                type="radio"
                value={true}
                checked={ibPyp === true}
                onChange={() => setIbPyp(true)}
              />
              <span className="ml-1">Yes</span>
            </label>
            <label className="mr-5">
              <input
                type="radio"
                value={false}
                checked={ibPyp === false}
                onChange={() => setIbPyp(false)}
              />
              <span className="ml-1">No</span>
            </label>
          </div>
        )}
      </p>
    </div>
  );
}

import React, { useState } from "react";

import { db } from "../../../../firebase";
import {
  collection,
  getDocs,
  query,
  where,
  updateDoc,
} from "firebase/firestore";

export function ProfileAdditionalIBInfo({ userDetails, userId }) {
  const [editing, setEditing] = useState(false);

  const [tokGrade, setTokGrade] = useState(
    userDetails?.profileAdditionalIBInfo?.tokGrade || ""
  );
  const [totalIbScore, setTotalIbScore] = useState(
    userDetails?.profileAdditionalIBInfo?.totalIbScore || ""
  );
  const [eeSubjectArea, setEeSubjectArea] = useState(
    userDetails?.profileAdditionalIBInfo?.eeSubjectArea || ""
  );
  const [secondEeSubjectArea, setSecondEeSubjectArea] = useState(
    userDetails?.profileAdditionalIBInfo?.secondEeSubjectArea || ""
  );
  const [yourIbSchool, setYourIbSchool] = useState(
    userDetails?.profileAdditionalIBInfo?.yourIbSchool || ""
  );
  const [additionalInfo, setAdditionalInfo] = useState(
    userDetails?.profileAdditionalIBInfo?.additionalInfo || ""
  );

  const [savingDetails, setSavingDetails] = useState(false);

  async function savingChanges() {
    setSavingDetails(true);
    try {
      const details = {
        profileAdditionalIBInfo: {
          tokGrade,
          totalIbScore,
          eeSubjectArea,
          secondEeSubjectArea,
          yourIbSchool,
          additionalInfo,
        },
      };

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
      {/* Action Buttons */}
      <div className="flex-1 flex justify-end flex-wrap items-center mb-2.5">
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

      {/* TOK & Total IB Score */}
      <div className="flex flex-1 justify-between flex-wrap mb-2.5">
        <div className="flex-1">
          <div className="text-sm">TOK Grade</div>
          {editing === false ? (
            <div>
              {userDetails?.profileAdditionalIBInfo?.tokGrade || "N/A"}
            </div>
          ) : (
            <input
              type="text"
              value={tokGrade}
              onChange={(e) => {
                setTokGrade(e.target.value);
              }}
              placeholder="Enter TOK Grade"
              className="border p-1 rounded w-full"
            />
          )}
        </div>

        <div className="flex-1">
          <div className="text-sm">Total IB Score</div>
          {editing === false ? (
            <div>
              {userDetails?.profileAdditionalIBInfo?.totalIbScore || "N/A"}
            </div>
          ) : (
            <input
              type="text"
              value={totalIbScore}
              onChange={(e) => {
                setTotalIbScore(e.target.value);
              }}
              placeholder="Enter Total IB Score"
              className="border p-1 rounded w-full"
            />
          )}
        </div>
      </div>

      {/* EE Subject Areas */}
      <div className="flex flex-1 justify-between flex-wrap mb-2.5">
        <div className="flex-1">
          <div className="text-sm">EE Subject Area</div>
          {editing === false ? (
            <div>
              {userDetails?.profileAdditionalIBInfo?.eeSubjectArea || "N/A"}
            </div>
          ) : (
            <input
              type="text"
              value={eeSubjectArea}
              onChange={(e) => {
                setEeSubjectArea(e.target.value);
              }}
              placeholder="Enter EE Subject Area"
              className="border p-1 rounded w-full"
            />
          )}
        </div>

        <div className="flex-1">
          <div className="text-sm">2nd EE Subject Area</div>
          {editing === false ? (
            <div>
              {userDetails?.profileAdditionalIBInfo?.secondEeSubjectArea ||
                "N/A"}
            </div>
          ) : (
            <input
              type="text"
              value={secondEeSubjectArea}
              onChange={(e) => {
                setSecondEeSubjectArea(e.target.value);
              }}
              placeholder="Enter 2nd EE Subject Area"
              className="border p-1 rounded w-full"
            />
          )}
        </div>
      </div>

      {/* IB School */}
      <div className="mb-2.5">
        <div className="text-sm">Your IB School</div>
        {editing === false ? (
          <div>
            {userDetails?.profileAdditionalIBInfo?.yourIbSchool || "N/A"}
          </div>
        ) : (
          <input
            type="text"
            value={yourIbSchool}
            onChange={(e) => {
              setYourIbSchool(e.target.value);
            }}
            placeholder="Enter Your IB School"
            className="border p-1 rounded w-full"
          />
        )}
      </div>

      {/* Additional Info */}
      <div>
        <div className="text-sm">
          Additional Information about your IB Education you think we should
          know about?
        </div>
        {editing === false ? (
          <div>
            {userDetails?.profileAdditionalIBInfo?.additionalInfo || "N/A"}
          </div>
        ) : (
          <input
            type="text"
            value={additionalInfo}
            onChange={(e) => {
              setAdditionalInfo(e.target.value);
            }}
            placeholder="Enter Additional Information"
            className="border p-1 rounded w-full"
          />
        )}
      </div>
    </div>
  );
}

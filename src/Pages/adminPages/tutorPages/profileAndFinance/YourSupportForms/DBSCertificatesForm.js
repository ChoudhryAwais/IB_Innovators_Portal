import React, { useState } from "react";
import { db } from "../../../../../firebase";
import {
  collection,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";

export function DBSCertificates({ userDetails, userId }) {
  const [savingDetails, setSavingDetails] = useState("SAVE");
  const [enhancedCertificate, setEnhancedCertificate] = useState(
    userDetails?.dbsCertificate?.enhancedCertificate
      ? userDetails?.dbsCertificate?.enhancedCertificate
      : false
  );

  async function savingChanges() {
    setSavingDetails("SAVING");
    try {
      const details = { dbsCertificate: { enhancedCertificate } };

      const userListRef = collection(db, "userList");
      const q = query(userListRef, where("userId", "==", userId));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docRef = querySnapshot.docs[0].ref;
        await updateDoc(docRef, details);
      }

      setSavingDetails("SAVED");

      setTimeout(() => {
        setSavingDetails("SAVE");
      }, 1000);
    } catch (e) {
      console.error("Error saving changes:", e);
      alert("Error saving changes. Please try again");
      setSavingDetails("SAVE");
    }
  }

  return (
    <div className="mt-[30px]">
      <div className="flex flex-1 justify-between flex-wrap items-center mb-5">
        <div className="text-2xl">DBS Certificates</div>

        <button
          onClick={savingChanges}
          className="border border-green-600 bg-green-600 text-white px-3 py-1 rounded-none"
        >
          {savingDetails}
        </button>
      </div>

      <p className="mb-[15px]">
        DBS Certificates are issued by the UK Government to demonstrate that you
        have not been barred from working with young people. We may ask you for
        DBS in order to tutor students.
      </p>

      <p>
        Did you have enhanced DBS Certificate issued in last two years?
        <br />
        <span className="font-bold flex justify-around">
          <span>
            <input
              type="radio"
              id="yes"
              name="enhancedCertificate"
              checked={enhancedCertificate === true}
              onChange={() => setEnhancedCertificate(true)}
            />
            <label htmlFor="yes" className="ml-1">
              Yes
            </label>
          </span>
          <span>
            <input
              type="radio"
              id="no"
              name="enhancedCertificate"
              checked={enhancedCertificate === false}
              onChange={() => setEnhancedCertificate(false)}
            />
            <label htmlFor="no" className="ml-1">
              No
            </label>
          </span>
        </span>
      </p>

      <div className="mb-5 text-2xl mt-[30px]">Update your DBS Record</div>

      <p className="mb-[15px] mt-[15px]">
        If you have enhanced DBS Certificate so please send to{" "}
        <span className="underline">contact@ibinnovators.com</span> so we can
        update your profile accordingly.
      </p>
    </div>
  );
}

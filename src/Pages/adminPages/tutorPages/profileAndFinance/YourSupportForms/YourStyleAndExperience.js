import React, { useState } from "react";
import { db } from "../../../../../firebase";
import {
  collection,
  getDocs,
  query,
  where,
  updateDoc,
} from "firebase/firestore";

export function YourStyleAndExperience({ userDetails, userId }) {
  const [firstStyleBox, setFirstStyleBox] = useState(
    userDetails?.YourStyleAndExperience?.firstStyleBox
      ? userDetails?.YourStyleAndExperience?.firstStyleBox
      : ""
  );

  const [secondStyleBox, setSecondStyleBox] = useState(
    userDetails?.YourStyleAndExperience?.secondStyleBox
      ? userDetails?.YourStyleAndExperience?.secondStyleBox
      : ""
  );

  const [savingDetails, setSavingDetails] = useState("SAVE");

  async function savingChanges() {
    setSavingDetails("SAVING");
    try {
      const details = {
        YourStyleAndExperience: { firstStyleBox, secondStyleBox },
      };

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
      <div className="flex flex-1 flex-wrap items-center justify-between mb-[20px]">
        <div className="text-[1.5rem]">Your Style and Experience</div>

        <button
          onClick={savingChanges}
          className="border border-green-600 text-white bg-green-600 rounded-none px-[10px] py-[5px]"
        >
          {savingDetails}
        </button>
      </div>

      <p className="mb-[15px]">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed faucibus
        odio a ligula cursus, in ultricies justo pharetra. Suspendisse potenti.
        Nulla facilisi. Proin quis risus vel odio ullamcorper vestibulum.
      </p>

      <div className="text-[1.3rem]">Your Style</div>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed faucibus
        odio a ligula cursus, in ultricies justo pharetra. Suspendisse potenti.
        Nulla facilisi. Proin quis risus vel odio ullamcorper vestibulum.
      </p>

      <p>
        <input
          className="flex-1 rounded-none mt-[15px] mb-[15px] w-full border-2 border-dotted border-white bg-white/30 outline-none"
          type="text"
          value={firstStyleBox}
          onChange={(e) => {
            setFirstStyleBox(e.target.value);
          }}
          placeholder="Enter details here"
        />
      </p>

      <div className="text-[1.3rem] mt-[15px]">Your Experience</div>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed faucibus
        odio a ligula cursus, in ultricies justo pharetra. Suspendisse potenti.
        Nulla facilisi. Proin quis risus vel odio ullamcorper vestibulum.
      </p>

      <p>
        <input
          className="flex-1 rounded-none mt-[15px] mb-[15px] w-full border-2 border-dotted border-white bg-white/30 outline-none"
          type="text"
          value={secondStyleBox}
          onChange={(e) => {
            setSecondStyleBox(e.target.value);
          }}
          placeholder="Enter details here"
        />
      </p>
    </div>
  );
}

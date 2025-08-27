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
import { EducationHistory } from "./EducationHistory";

export function Education() {
  const { userDetails, userId } = useContext(MyContext);
  


  return (
    <div>

      <EducationHistory />

    </div>
  );
}

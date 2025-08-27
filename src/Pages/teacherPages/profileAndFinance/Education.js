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
import { ProfileIBForm } from "./ProfileIBForm";
import { ProfileYourIBDPSubjects } from "./ProfileYourIBDPSubjects";
import { ProfileAdditionalIBInfo } from "./ProfileAdditionalIBInfo";
import { ProfessionalTeachingExperience } from "./ProfessionalTeachingExperience";

export function Education() {
  const { userDetails, userId } = useContext(MyContext);
  


  return (
    <div>

      <EducationHistory />
      <ProfileIBForm />
      <ProfileYourIBDPSubjects />
      <ProfileAdditionalIBInfo />
      <ProfessionalTeachingExperience />

    </div>
  );
}

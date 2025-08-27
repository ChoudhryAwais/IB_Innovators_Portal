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
import { db } from "../../../../firebase";
import { EducationHistory } from "./EducationHistory";
import { ProfileIBForm } from "./ProfileIBForm";
import { ProfileYourIBDPSubjects } from "./ProfileYourIBDPSubjects";
import { ProfileAdditionalIBInfo } from "./ProfileAdditionalIBInfo";
import { ProfessionalTeachingExperience } from "./ProfessionalTeachingExperience";

export function Education({userDetails, userId}) {
  


  return (
    <div>

      <EducationHistory userDetails={userDetails} userId={userId} />
      <ProfileIBForm userDetails={userDetails} userId={userId} />
      <ProfileYourIBDPSubjects userDetails={userDetails} userId={userId} />
      <ProfileAdditionalIBInfo  userDetails={userDetails} userId={userId}/>
      <ProfessionalTeachingExperience userDetails={userDetails} userId={userId} />

    </div>
  );
}

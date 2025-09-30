"use client"

import { useState } from "react"
import { db } from "../../../../firebase"
import { collection, getDocs, query, where, updateDoc } from "firebase/firestore"

import { EducationHistory } from "./EducationHistory"
import { ProfileIBForm } from "./ProfileIBForm"
import { ProfileYourIBDPSubjects } from "./ProfileYourIBDPSubjects"
import { ProfileAdditionalIBInfo } from "./ProfileAdditionalIBInfo"
import { ProfessionalTeachingExperience } from "./ProfessionalTeachingExperience"

export function Education({ userDetails, userId }) {
  const [editing, setEditing] = useState(false)

  // Local state for fields
  const [firstName, setFirstName] = useState(userDetails?.userName?.split(" ")[0] || "")
  const [lastName, setLastName] = useState(userDetails?.userName?.split(" ").slice(1).join(" ") || "")
  const [phone, setPhone] = useState(userDetails?.phone || "")
  const [email] = useState(userDetails?.email || "")
  const [relation, setRelation] = useState(userDetails?.relation || "Parent")
  const [gender, setGender] = useState(userDetails?.gender || "Male")
  const [city, setCity] = useState(userDetails?.city || "")
  const [state, setState] = useState(userDetails?.state || "")
  const [address, setAddress] = useState(userDetails?.address || "")
  const [zip, setZip] = useState(userDetails?.zip || "")

  const [savingDetails, setSavingDetails] = useState(false)

  async function saveChanges() {
    if (!firstName || !lastName || !phone || !city || !state || !zip) {
      alert("Please fill all required fields")
      return
    }

    setSavingDetails(true)
    try {
      const details = {
        userName: `${firstName} ${lastName}`,
        phone,
        city,
        state,
        zip,
        address,
        relation,
        gender,
      }

      const userListRef = collection(db, "userList")
      const q = query(userListRef, where("userId", "==", userId))
      const querySnapshot = await getDocs(q)

      if (!querySnapshot.empty) {
        const docRef = querySnapshot.docs[0].ref
        await updateDoc(docRef, details)
      }

      setEditing(false)
    } catch (e) {
      console.error("Error saving education info:", e)
      alert("Error saving changes. Please try again")
    } finally {
      setSavingDetails(false)
    }
  }

  return (
    <div className="bg-white rounded-lg">
      <div className="mt-2 space-y-6">
        <EducationHistory userDetails={userDetails} userId={userId} />
        <ProfileIBForm userDetails={userDetails} userId={userId} />
        <ProfileYourIBDPSubjects userDetails={userDetails} userId={userId} />
        <ProfileAdditionalIBInfo userDetails={userDetails} userId={userId} />
        <ProfessionalTeachingExperience userDetails={userDetails} userId={userId} />
      </div>
    </div>
  )
}

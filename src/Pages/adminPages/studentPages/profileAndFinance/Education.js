"use client"

import { useState } from "react"
import { db } from "../../../../firebase"
import { collection, getDocs, query, where, updateDoc } from "firebase/firestore"

import { EducationHistory } from "./EducationHistory"

export function Education({ userDetails, userId }) {
  const [editing, setEditing] = useState(false)
  const [savingDetails, setSavingDetails] = useState(false)

  async function saveChanges(updatedEducationData) {
    setSavingDetails(true)
    try {
      const userListRef = collection(db, "userList")
      const q = query(userListRef, where("userId", "==", userId))
      const querySnapshot = await getDocs(q)

      if (!querySnapshot.empty) {
        const docRef = querySnapshot.docs[0].ref
        await updateDoc(docRef, {
          educationHistory: updatedEducationData
        })
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
      <EducationHistory
        userDetails={userDetails}
        userId={userId}
      />
    </div>
  )
}

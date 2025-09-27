"use client"

import { useState } from "react"
import { db } from "../../../../../firebase"
import { collection, getDocs, query, where, updateDoc } from "firebase/firestore"

import { EditEducationHistory } from "./EditEducationHistory"

export function EditEducation({ userDetails, userId }) {
  const [educationRecords, setEducationRecords] = useState(userDetails?.educationRecords || [])

  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    try {
      const updatedDetails = {
        educationRecords,
      }

      const userListRef = collection(db, "userList")
      const q = query(userListRef, where("userId", "==", userId))
      const querySnapshot = await getDocs(q)

      if (!querySnapshot.empty) {
        const docRef = querySnapshot.docs[0].ref
        await updateDoc(docRef, updatedDetails)
      }

      alert("Education history updated successfully ✅")
    } catch (err) {
      console.error("Error saving education info:", err)
      alert("Error saving changes. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-white rounded-lg ">
      {/* Section: Education History */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">
          Education History
        </h2>
        <EditEducationHistory data={educationRecords} setData={setEducationRecords} />
      </div>

      {/* Global Save Button */}
      <div className="flex justify-end mt-8">
        <button
          onClick={handleSave}
          className={`px-6 py-2 rounded-md text-white font-medium transition-colors ${
            saving
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
          disabled={saving}
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  )
}

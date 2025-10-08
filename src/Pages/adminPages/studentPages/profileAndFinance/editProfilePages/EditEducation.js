"use client"

import { useState } from "react"
import { db } from "../../../../../firebase"
import { collection, getDocs, query, where, updateDoc } from "firebase/firestore"
import Button from "@mui/material/Button"

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
        <Button
          onClick={handleSave}
          className="ml-4 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
              style={{
                borderRadius: "8px",
                width: "140px",
                height: "50px",
                color: "#FFFFFF",
                backgroundColor: "#4071B6",
                fontSize: "12px",
                fontWeight: 600,
                textTransform: "none",
              }}
          disabled={saving}
        >
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  )
}

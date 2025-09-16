"use client"

import { useState } from "react"
import { db } from "../../../../../firebase"
import { collection, getDocs, query, where, updateDoc } from "firebase/firestore"
import TextField from "@mui/material/TextField"
import Button from "@mui/material/Button"

export function EditYourSupport({ userDetails, userId }) {
  // Subjects are stored as an object in userDetails?.subjects
  const [subjects, setSubjects] = useState(
    Object.keys(userDetails?.subjects || {}).join(", ")
  )
  const [hasDBS, setHasDBS] = useState(userDetails?.hasDBS || "No")
  const [dbsDetails, setDbsDetails] = useState(userDetails?.dbsDetails || "")

  const [saving, setSaving] = useState(false)

  async function saveChanges() {
    setSaving(true)
    try {
      const details = {
        subjects: subjects
          .split(",")
          .map((s) => s.trim())
          .reduce((acc, subject) => {
            if (subject) acc[subject] = true
            return acc
          }, {}),
        hasDBS,
        dbsDetails,
      }

      const userListRef = collection(db, "userList")
      const q = query(userListRef, where("userId", "==", userId))
      const querySnapshot = await getDocs(q)

      if (!querySnapshot.empty) {
        const docRef = querySnapshot.docs[0].ref
        await updateDoc(docRef, details)
      }

      alert("Your Support info updated successfully!")
    } catch (e) {
      console.error("Error saving changes:", e)
      alert("Error saving changes. Please try again")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-white rounded-lg">
      {/* Subjects */}
      <div className="mb-8 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-500 mb-4">
          Subjects you are cleared to tutor in
        </h3>
        <TextField
          fullWidth
          multiline
          minRows={2}
          value={subjects}
          onChange={(e) => setSubjects(e.target.value)}
          placeholder="Enter subjects separated by commas"
        />
        <p className="text-gray-700 mt-2 mb-8">
          To request to tutor in additional subjects please fill out the APPLY FOR NEW SUBJECT form here.
        </p>
      </div>

      {/* DBS Info */}
      <div className="mb-8 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-500 mb-4">DBS Certificates</h3>
        <p className="text-gray-900 mb-4 leading-relaxed">
          DBS Certificates are issued by the UK Government to demonstrate that you have not been barred from working
          with young people. We may ask you for DBS in order to tutor students.
        </p>

        <TextField
          fullWidth
          label="Do you have an enhanced DBS Certificate issued in last two years?"
          value={hasDBS}
          onChange={(e) => setHasDBS(e.target.value)}
          placeholder="Yes / No"
        />
      </div>

      {/* DBS Details */}
      <div className="mb-8 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-500 mb-4">DBS Details</h3>
        <TextField
          fullWidth
          multiline
          minRows={3}
          value={dbsDetails}
          onChange={(e) => setDbsDetails(e.target.value)}
          placeholder="Enter any DBS related details"
        />
      </div>

      {/* Update Instruction */}
      <div>
        <h3 className="text-lg font-medium text-gray-500 mb-4">Update your DBS Record</h3>
        <p className="text-gray-900 leading-relaxed">
          If you have enhanced DBS Certificate so please send to contact@ibinnovators.com so we can update your profile
          accordingly.
        </p>
      </div>

      {/* Save Button */}
      <div className="flex justify-end mt-8">
        <Button
          variant="contained"
          color="primary"
          onClick={saveChanges}
          disabled={saving}
        >
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  )
}

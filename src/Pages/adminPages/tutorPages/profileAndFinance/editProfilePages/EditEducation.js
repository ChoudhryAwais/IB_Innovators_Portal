"use client"

import { useState } from "react"
import { db } from "../../../../../firebase"
import { collection, getDocs, query, where, updateDoc } from "firebase/firestore"

import { EditEducationHistory } from "./editEducationPages/EditEducationHistory"
import { EditProfileIBForm } from "./editEducationPages/EditProfileIBForm"
import { EditProfileYourIBDPSubjects } from "./editEducationPages/EditProfileYourIBDPSubjects"
import { EditProfileAdditionalIBInfo } from "./editEducationPages/EditProfileAdditionalIBInfo"
import { EditProfessionalTeachingExperience } from "./editEducationPages/EditProfessionalTeachingExperience"

export function EditEducation({ userDetails, userId }) {
  // Lifted-up state for each section
  const [educationHistory, setEducationHistory] = useState(userDetails?.educationRecords || [])
  const [ibdpSubjects, setIbdpSubjects] = useState(userDetails?.ibdpSubjects || [])
  const [ibForm, setIbForm] = useState(userDetails?.ibForm || [])
  const [additionalInfo, setAdditionalInfo] = useState(userDetails?.additionalInfo || [])
  const [teachingExperience, setTeachingExperience] = useState(userDetails?.teachingExperience || [])

  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    try {
      const updatedDetails = {
        educationRecords: educationHistory,
        ibForm,
        ibdpSubjects,
        additionalInfo,
        teachingExperience,
      }

      const userListRef = collection(db, "userList")
      const q = query(userListRef, where("userId", "==", userId))
      const querySnapshot = await getDocs(q)

      if (!querySnapshot.empty) {
        const docRef = querySnapshot.docs[0].ref
        await updateDoc(docRef, updatedDetails)
      }

      alert("Profile updated successfully ✅")
    } catch (err) {
      console.error("Error saving education info:", err)
      alert("Error saving changes. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-white rounded-lg">
      <div className="space-y-4">
        <EditEducationHistory data={educationHistory} setData={setEducationHistory} />
        <EditProfileIBForm data={ibForm} setData={setIbForm} />
        <EditProfileYourIBDPSubjects data={ibdpSubjects} setData={setIbdpSubjects} />
        <EditProfileAdditionalIBInfo data={additionalInfo} setData={setAdditionalInfo} />
        <EditProfessionalTeachingExperience
          data={teachingExperience}
          setData={setTeachingExperience}
        />
      </div>

      {/* Global Save Button */}
      <div className="flex justify-end mt-8">
        <button
          onClick={handleSave}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          disabled={saving}
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  )
}

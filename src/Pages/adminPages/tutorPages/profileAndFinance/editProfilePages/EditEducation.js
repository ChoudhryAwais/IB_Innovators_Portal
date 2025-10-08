"use client"

import { useState } from "react"
import { db } from "../../../../../firebase"
import { collection, getDocs, query, where, updateDoc } from "firebase/firestore"
import Button from "@mui/material/Button"


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
  const [profileAdditionalIBInfo, setProfileAdditionalIBInfo] = useState(
    userDetails?.profileAdditionalIBInfo || {
      tokGrade: "",
      totalIbScore: "",
      eeSubjectArea: "",
      secondEeSubjectArea: "",
      yourIbSchool: "",
      additionalInfo: "",
    }
  )

  // ✅ use professionalTeachingExperience consistently
  const [professionalTeachingExperience, setProfessionalTeachingExperience] = useState(
    userDetails?.professionalTeachingExperience || {
      professionalIBTeacherExperience: null,
      actedAsIBExaminer: null,
      detailSubjectsAndPapersModerated: "",
      supportingStudentWithSpecialNeeds: null,
      explainSENExperience: "",
      otherEducationalProgrammes: "",
    }
  )

  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    try {
      const updatedDetails = {
        educationRecords: educationHistory,
        ibForm,
        ibdpSubjects,
        profileAdditionalIBInfo,
        professionalTeachingExperience,
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
        <EditProfileAdditionalIBInfo data={profileAdditionalIBInfo} setData={setProfileAdditionalIBInfo} />
        <EditProfessionalTeachingExperience
          data={professionalTeachingExperience}
          setData={setProfessionalTeachingExperience}
        />
      </div>

      {/* Global Save Button */}
      <div className="flex justify-end mt-8">
        <Button
          variant="contained"
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
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  )
}

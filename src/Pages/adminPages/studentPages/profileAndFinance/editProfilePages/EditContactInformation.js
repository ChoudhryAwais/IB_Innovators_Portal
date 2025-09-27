"use client"

import { useState } from "react"
import { db } from "../../../../../firebase"
import { collection, getDocs, query, where, updateDoc } from "firebase/firestore"
import Button from "@mui/material/Button"

export function EditContactInformation({ userDetails, userId }) {
  const [editing, setEditing] = useState(true)
  const [savingDetails, setSavingDetails] = useState(false)

  // Initialize state with correct fields
  const [firstName, setFirstName] = useState(userDetails?.otherInformation?.userDetails?.firstName || "")
  const [lastName, setLastName] = useState(userDetails?.otherInformation?.userDetails?.lastName || "")
  const [phone, setPhone] = useState(userDetails?.phone || "")
  const [email, setEmail] = useState(userDetails?.email || "")
  const [dob, setDob] = useState(userDetails?.dob || "")
  const [gender, setGender] = useState(userDetails?.gender || "")
  const [city, setCity] = useState(userDetails?.otherInformation?.userDetails?.city || "")
  const [state, setState] = useState(userDetails?.otherInformation?.userDetails?.state || "")
  const [address, setAddress] = useState(userDetails?.otherInformation?.userDetails?.address || "")
  const [zip, setZip] = useState(userDetails?.otherInformation?.userDetails?.zip || "")

  // Save changes to Firestore
  const saveChanges = async () => {
    if (!firstName || !lastName || !phone || !email || !dob || !gender || !city || !state || !address || !zip) {
      alert("Please fill all fields")
      return
    }

    setSavingDetails(true)
    try {
      const updatedData = {
        phone,
        email,
        dob,
        gender,
        otherInformation: {
          ...userDetails?.otherInformation,
          userDetails: {
            ...userDetails?.otherInformation?.userDetails,
            firstName,
            lastName,
            city,
            state,
            address,
            zip,
          },
        },
      }

      const userListRef = collection(db, "userList")
      const q = query(userListRef, where("userId", "==", userId))
      const querySnapshot = await getDocs(q)

      if (!querySnapshot.empty) {
        const docRef = querySnapshot.docs[0].ref
        await updateDoc(docRef, updatedData)
        alert("Profile updated successfully!")
      } else {
        alert("Student not found")
      }

      setSavingDetails(false)
      setEditing(false)
    } catch (error) {
      console.error("Error updating student profile:", error)
      alert("Error saving changes. Please try again.")
      setSavingDetails(false)
    }
  }

  return (
    <div>
      <div className="flex flex-col gap-6">
        {/* Profile Image */}
        <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center border border-gray-300">
          <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
              clipRule="evenodd"
            />
          </svg>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-6">
          {/* First Name */}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">First Name</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Last Name</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Phone</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Date of Birth</label>
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Gender</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* City */}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">City</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* State */}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">State</label>
            <input
              type="text"
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Zip */}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Zip Code</label>
            <input
              type="text"
              value={zip}
              onChange={(e) => setZip(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end mt-8">
          <Button
            variant="contained"
            color="primary"
            onClick={saveChanges}
            disabled={savingDetails}
          >
            {savingDetails ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  )
}

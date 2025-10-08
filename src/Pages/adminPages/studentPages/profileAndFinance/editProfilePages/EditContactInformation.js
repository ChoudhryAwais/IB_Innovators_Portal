"use client"

import { useState, useRef } from "react"
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

  const [image, setImage] = useState(userDetails?.image || null)
  const fileInputRef = useRef(null)

  const handleImageClick = () => {
    fileInputRef.current.click()
  }

  const handleImageChange = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImage(e.target.result) // show preview
      }
      reader.readAsDataURL(file)

      // Optionally, assign to userDetails (if mutable)
      userDetails.image = file
    }
  }

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
        image,
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
        <div className="flex-shrink-0">
          <div
            onClick={handleImageClick}
            className="w-24 h-24 bg-[#A2A1A80D] rounded-[10px] flex items-center justify-center border border-[#A2A1A833] cursor-pointer overflow-hidden"
          >
            {image ? (
              <img
                src={image}
                alt={userDetails?.userName || "User"}
                className="w-full h-full object-cover"
              />
            ) : (
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M15 2H6C3.79086 2 2 3.79086 2 6V18C2 20.2091 3.79086 22 6 22H18C20.2091 22 22 20.2091 22 18V9M22 14L19.061 11.8839C17.5338 10.7843 15.4467 10.898 14.0479 12.1569L9.95209 15.8431C8.55331 17.102 6.4662 17.2157 4.93901 16.1161L2 14M11 8.5C11 9.88071 9.88071 11 8.5 11C7.11929 11 6 9.88071 6 8.5C6 7.11929 7.11929 6 8.5 6C9.88071 6 11 7.11929 11 8.5ZM19.1292 2.43934L15.7081 5.86045C15.5791 5.9894 15.4879 6.15116 15.4442 6.32823L15.015 8.06973C14.925 8.4348 15.255 8.76484 15.6201 8.67486L17.3616 8.2456C17.5387 8.20196 17.7004 8.11072 17.8294 7.98177L21.2505 4.56066C21.8363 3.97487 21.8363 3.02513 21.2505 2.43934C20.6647 1.85355 19.715 1.85355 19.1292 2.43934Z"
                  stroke="#28303F"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>

          {/* Hidden file input */}
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageChange}
            className="hidden"
          />
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-6">
          {/* First Name */}
          <div>
            <label className="block text-[14px] font-light text-[#A2A1A8] mb-1">
              First Name
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Not entered"
              className="w-full text-[16px] font-light text-[#16151C] border-b border-gray-200 pb-2 focus:outline-none focus:border-b-2 focus:border-[#16151C]"
            />
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-[14px] font-light text-[#A2A1A8] mb-1">
              Last Name
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Not entered"
              className="w-full text-[16px] font-light text-[#16151C] border-b border-gray-200 pb-2 focus:outline-none focus:border-b-2 focus:border-[#16151C]"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-[14px] font-light text-[#A2A1A8] mb-1">
              Mobile Number
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Not entered"
              className="w-full text-[16px] font-light text-[#16151C] border-b border-gray-200 pb-2 focus:outline-none focus:border-b-2 focus:border-[#16151C]"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-[14px] font-light text-[#A2A1A8] mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Not entered"
              className="w-full text-[16px] font-light text-[#16151C] border-b border-gray-200 pb-2 focus:outline-none focus:border-b-2 focus:border-[#16151C]"
            />
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block text-[14px] font-light text-[#A2A1A8] mb-1">
              Date of Birth
            </label>
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="w-full text-[16px] font-light text-[#16151C] border-b border-gray-200 pb-2 focus:outline-none focus:border-b-2 focus:border-[#16151C]"
            />
          </div>

          {/* Gender */}
          <div>
            <label className="block text-[14px] font-light text-[#A2A1A8] mb-1">
              Gender
            </label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full text-[16px] font-light text-[#16151C] border-b border-gray-200 pb-2 focus:outline-none focus:border-b-2 focus:border-[#16151C]"
            >
              <option value="">Not entered</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* City */}
          <div>
            <label className="block text-[14px] font-light text-[#A2A1A8] mb-1">
              City
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Not entered"
              className="w-full text-[16px] font-light text-[#16151C] border-b border-gray-200 pb-2 focus:outline-none focus:border-b-2 focus:border-[#16151C]"
            />
          </div>

          {/* State */}
          <div>
            <label className="block text-[14px] font-light text-[#A2A1A8] mb-1">
              State
            </label>
            <input
              type="text"
              value={state}
              onChange={(e) => setState(e.target.value)}
              placeholder="Not entered"
              className="w-full text-[16px] font-light text-[#16151C] border-b border-gray-200 pb-2 focus:outline-none focus:border-b-2 focus:border-[#16151C]"
            />
          </div>

          {/* Address */}
          <div>
            <label className="block text-[14px] font-light text-[#A2A1A8] mb-1">
              Address
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Not added"
              className="w-full text-[16px] font-light text-[#16151C] border-b border-gray-200 pb-2 focus:outline-none focus:border-b-2 focus:border-[#16151C]"
            />
          </div>

          {/* Zip */}
          <div>
            <label className="block text-[14px] font-light text-[#A2A1A8] mb-1">
              Zip Code
            </label>
            <input
              type="text"
              value={zip}
              onChange={(e) => setZip(e.target.value)}
              placeholder="Not entered"
              className="w-full text-[16px] font-light text-[#16151C] border-b border-gray-200 pb-2 focus:outline-none focus:border-b-2 focus:border-[#16151C]"
            />
          </div>
        </div>

        {/* Save Button */}
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

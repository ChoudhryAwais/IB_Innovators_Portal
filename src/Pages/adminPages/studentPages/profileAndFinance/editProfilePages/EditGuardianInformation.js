"use client"

import { useState, useRef } from "react"
import { db } from "../../../../../firebase"
import { collection, getDocs, query, where, updateDoc } from "firebase/firestore"
import Button from "@mui/material/Button"

export function EditGuardianInformation({ userDetails, userId }) {

  // Initial values from Firestore
  const [relation, setRelation] = useState(userDetails?.otherInformation?.userDetails?.relation || "")
  const [firstName, setFirstName] = useState(userDetails?.otherInformation?.userDetails?.parentFirstName || "")
  const [lastName, setLastName] = useState(userDetails?.otherInformation?.userDetails?.parentLastName || "")
  const [phone, setPhone] = useState(userDetails?.otherInformation?.userDetails?.parentPhone || "")
  const [email, setEmail] = useState(userDetails?.otherInformation?.userDetails?.parentEmail || "")
  const [gender, setGender] = useState(userDetails?.otherInformation?.userDetails?.parentGender || "")
  const [city, setCity] = useState(userDetails?.otherInformation?.userDetails?.parentCity || "")
  const [state, setState] = useState(userDetails?.otherInformation?.userDetails?.parentState || "")
  const [address, setAddress] = useState(userDetails?.otherInformation?.userDetails?.parentAddress || "")
  const [zip, setZip] = useState(userDetails?.otherInformation?.userDetails?.parentZip || "")
  const [image, setImage] = useState(
    userDetails?.otherInformation?.userDetails?.parentimage || null
  )
  const fileInputRef = useRef(null)
  const [savingDetails, setSavingDetails] = useState(false)
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

      // Optionally, update userDetails object if needed
      userDetails.otherInformation.userDetails.parentimage = file
    }
  }


  async function saveChanges() {
    if (
      relation !== "" &&
      firstName !== "" &&
      lastName !== "" &&
      phone !== "" &&
      email !== "" &&
      gender !== "" &&
      city !== "" &&
      state !== "" &&
      address !== "" &&
      zip !== ""
    ) {
      setSavingDetails(true)
      try {
        const details = {
          otherInformation: {
            ...userDetails?.otherInformation,
            userDetails: {
              ...userDetails?.otherInformation?.userDetails,
              relation,
              parentFirstName: firstName,
              parentLastName: lastName,
              parentPhone: phone,
              parentEmail: email,
              parentGender: gender,
              parentCity: city,
              parentState: state,
              parentAddress: address,
              parentZip: zip,
            },
          },
        }

        const userListRef = collection(db, "userList")
        const q = query(userListRef, where("userId", "==", userId))
        const querySnapshot = await getDocs(q)

        if (!querySnapshot.empty) {
          const docRef = querySnapshot.docs[0].ref
          await updateDoc(docRef, details)
        }

        alert("Guardian information updated successfully ✅")
      } catch (e) {
        console.error("Error saving changes:", e)
        alert("Error saving changes. Please try again")
      } finally {
        setSavingDetails(false)
      }
    } else {
      alert("Please fill all fields")
    }
  }

  return (
    <div>
      {/* Profile Image */}
      <div className="flex flex-col items-start gap-6">
        <div className="flex-shrink-0">
          <div
            onClick={handleImageClick}
            className="w-24 h-24 bg-[#A2A1A80D] rounded-[10px] flex items-center justify-center border border-[#A2A1A833] cursor-pointer overflow-hidden"
          >
            {image ? (
              <img
                src={image}
                alt={firstName || "User"}
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

        {/* Profile Details Grid */}
        <div className="w-full">
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
                Phone
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
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Not entered"
                className="w-full text-[16px] font-light text-[#16151C] border-b border-gray-200 pb-2 focus:outline-none focus:border-b-2 focus:border-[#16151C]"
              />
            </div>

            {/* Relation */}
            <div>
              <label className="block text-[14px] font-light text-[#A2A1A8] mb-1">
                Relation
              </label>
              <input
                type="text"
                value={relation}
                onChange={(e) => setRelation(e.target.value)}
                placeholder="Not entered"
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
                <option value="" disabled>Not entered</option>
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
                placeholder="Not entered"
                className="w-full text-[16px] font-light text-[#16151C] border-b border-gray-200 pb-2 focus:outline-none focus:border-b-2 focus:border-[#16151C]"
              />
            </div>

            {/* Zip Code */}
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
          <div className="mt-6 justify-end flex">
            <Button
              onClick={saveChanges}
              disabled={savingDetails}
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
            >
              {savingDetails ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

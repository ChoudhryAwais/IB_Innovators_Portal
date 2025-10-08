"use client"

import { useState } from "react"
import { db } from "../../../../firebase"
import { collection, getDocs, query, where, updateDoc } from "firebase/firestore"
import { faUser } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
export function ContactInformation({ userDetails, userId }) {
  const [editing, setEditing] = useState(false)

  // Fetch data properly
  const [firstName, setFirstName] = useState(
    userDetails?.otherInformation?.userDetails?.firstName || ""
  )
  const [lastName, setLastName] = useState(
    userDetails?.otherInformation?.userDetails?.lastName || ""
  )
  const [city, setCity] = useState(userDetails?.otherInformation?.userDetails?.city || "")
  const [state, setState] = useState(userDetails?.otherInformation?.userDetails?.state || "")
  const [postal, setPostal] = useState(userDetails?.otherInformation?.userDetails?.zip || "")
  const [phone, setPhone] = useState(userDetails?.phone || "")
  const [address, setAddress] = useState(userDetails?.otherInformation?.userDetails?.address || "")
  const [dob, setDob] = useState(userDetails?.dob || "")
  const [gender, setGender] = useState(userDetails?.gender || "")

  const [savingDetails, setSavingDetails] = useState(false)

  async function savingChanges() {
    if (
      firstName !== "" &&
      lastName !== "" &&
      city !== "" &&
      state !== "" &&
      postal !== "" &&
      address !== ""
    ) {
      setSavingDetails(true)
      try {
        const details = {
          phone,
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
              zip: postal,
              address,
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

        setSavingDetails(false)
        setEditing(false)
      } catch (e) {
        console.error("Error saving changes:", e)
        alert("Error saving changes. Please try again")
        setSavingDetails(false)
      }
    } else {
      alert("Please Fill All Fields")
    }
  }

  return (
    <div>
      {/* Profile Image */}
      <div className="flex flex-col items-start gap-6">
        <div className="flex-shrink-0">
          {/* Avatar */}
          <div className="w-24 h-24 bg-[#4071B6] rounded-[4px] flex items-center justify-center overflow-hidden">
            {userDetails?.image ? (
              <img
                src={userDetails.image}
                alt={userDetails?.userName || "User"}
                className="w-full h-full object-cover"
              />
            ) : (
              <FontAwesomeIcon
                icon={faUser} 
                className="text-white text-4xl"
              />
            )}
          </div>
        </div>


        {/* Profile Details Grid */}
        <div className="w-full">
          <div className="grid grid-cols-2 gap-x-8 gap-y-6">
            {/* First Name */}
            <div>
              <label className="block text-[14px] font-light text-[#A2A1A8] mb-1">
                First Name
              </label>
              <div className="text-[16px] font-light text-[#16151C] border-b border-gray-200 pb-2">
                {firstName || "Not entered"}
              </div>
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-[14px] font-light text-[#A2A1A8] mb-1">
                Last Name
              </label>
              <div className="text-[16px] font-light text-[#16151C] border-b border-gray-200 pb-2">
                {lastName || "Not entered"}
              </div>
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-[14px] font-light text-[#A2A1A8] mb-1">
                Mobile Number
              </label>
              <div className="text-[16px] font-light text-[#16151C] border-b border-gray-200 pb-2">
                {phone || "Not entered"}
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-[14px] font-light text-[#A2A1A8] mb-1">
                Email Address
              </label>
              <div className="text-[16px] font-light text-[#16151C] border-b border-gray-200 pb-2">
                {userDetails?.email || "Not entered"}
              </div>
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-[14px] font-light text-[#A2A1A8] mb-1">
                Date of Birth
              </label>
              <div className="text-[16px] font-light text-[#16151C] border-b border-gray-200 pb-2">
                {dob || "Not entered"}
              </div>
            </div>

            {/* Gender */}
            <div>
              <label className="block text-[14px] font-light text-[#A2A1A8] mb-1">
                Gender
              </label>
              <div className="text-[16px] font-light text-[#16151C] border-b border-gray-200 pb-2">
                {gender || "Not entered"}
              </div>
            </div>

            {/* City */}
            <div>
              <label className="block text-[14px] font-light text-[#A2A1A8] mb-1">
                City
              </label>
              <div className="text-[16px] font-light text-[#16151C] border-b border-gray-200 pb-2">
                {city || "Not entered"}
              </div>
            </div>

            {/* State */}
            <div>
              <label className="block text-[14px] font-light text-[#A2A1A8] mb-1">
                State
              </label>
              <div className="text-[16px] font-light text-[#16151C] border-b border-gray-200 pb-2">
                {state || "Not entered"}
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-[14px] font-light text-[#A2A1A8] mb-1">
                Address
              </label>
              <div className="text-[16px] font-light text-[#16151C] border-b border-gray-200 pb-2">
                {address || "Not added"}
              </div>
            </div>

            {/* Zip Code */}
            <div>
              <label className="block text-[14px] font-light text-[#A2A1A8] mb-1">
                Zip Code
              </label>
              <div className="text-[16px] font-light text-[#16151C] border-b border-gray-200 pb-2">
                {postal || "Not entered"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

}

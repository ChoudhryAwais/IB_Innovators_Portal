"use client"

import React, { useState } from "react"
import { db } from "../../../../firebase"
import { collection, getDocs, query, where, updateDoc } from "firebase/firestore"
import { faUser } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
export function GuardianInformation({ userDetails, userId }) {

  const [editing, setEditing] = useState(false)

  const [relation, setRelation] = useState(userDetails?.otherInformation?.userDetails?.relation || "")
  const [firstName, setFirstName] = useState(userDetails?.otherInformation?.userDetails?.parentFirstName || "")
  const [lastName, setLastName] = useState(userDetails?.otherInformation?.userDetails?.parentLastName || "")
  const [phone, setPhone] = useState(userDetails?.otherInformation?.userDetails?.parentPhone || "")
  const [email, setEmail] = useState(userDetails?.otherInformation?.userDetails?.parentEmail || "")

  // New Fields
  const [gender, setGender] = useState(userDetails?.otherInformation?.userDetails?.parentGender || "")
  const [city, setCity] = useState(userDetails?.otherInformation?.userDetails?.city || "")
  const [state, setState] = useState(userDetails?.otherInformation?.userDetails?.state || "")
  const [address, setAddress] = useState(userDetails?.otherInformation?.userDetails?.address || "")
  const [zip, setZip] = useState(userDetails?.otherInformation?.userDetails?.zip || "")

  const [savingDetails, setSavingDetails] = useState(false)

  async function savingChanges() {
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
          <div className="w-24 h-24 bg-[#4071B6] rounded-[4px] flex items-center justify-center overflow-hidden">
            {userDetails?.otherInformation?.userDetails?.parentimage ? (
              <img
                src={userDetails.otherInformation.userDetails.parentimage}
                alt={firstName || "User"}
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

            {/* Phone */}
            <div>
              <label className="block text-[14px] font-light text-[#A2A1A8] mb-1">
                Phone
              </label>
              <div className="text-[16px] font-light text-[#16151C] border-b border-gray-200 pb-2">
                {phone || "Not entered"}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-[14px] font-light text-[#A2A1A8] mb-1">
                Email
              </label>
              <div className="text-[16px] font-light text-[#16151C] border-b border-gray-200 pb-2">
                {email || "Not entered"}
              </div>
            </div>

            {/* Relation */}
            <div>
              <label className="block text-[14px] font-light text-[#A2A1A8] mb-1">
                Relation
              </label>
              <div className="text-[16px] font-light text-[#16151C] border-b border-gray-200 pb-2">
                {relation || "Not entered"}
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
                {address || "Not entered"}
              </div>
            </div>

            {/* Zip */}
            <div>
              <label className="block text-[14px] font-light text-[#A2A1A8] mb-1">
                Zip Code
              </label>
              <div className="text-[16px] font-light text-[#16151C] border-b border-gray-200 pb-2">
                {zip || "Not entered"}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

"use client"

import React, { useState } from "react"
import { db } from "../../../../firebase"
import { collection, getDocs, query, where, updateDoc } from "firebase/firestore"

export function GuardianInformation({ userDetails, userId }) {
  console.log("UserDetails (Guardian):", userDetails)

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
    <div className="flex flex-col items-start gap-6">
      {/* Profile Image */}
      <div className="flex-shrink-0">
        <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center border border-gray-300">
          <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>

      {/* Profile Details Grid */}
      <div className="w-full">
        <div className="grid grid-cols-2 gap-x-8 gap-y-6">
          {/* First Name */}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">First Name</label>
            {editing === false ? (
              <div className="text-gray-900 font-medium border-b border-gray-200 pb-2">
                {firstName || "Not entered"}
              </div>
            ) : (
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Enter Guardian First Name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Last Name</label>
            {editing === false ? (
              <div className="text-gray-900 font-medium border-b border-gray-200 pb-2">
                {lastName || "Not entered"}
              </div>
            ) : (
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Enter Guardian Last Name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Phone</label>
            {editing === false ? (
              <div className="text-gray-900 font-medium border-b border-gray-200 pb-2">
                {phone || "Not entered"}
              </div>
            ) : (
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter Guardian Phone"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
            {editing === false ? (
              <div className="text-gray-900 font-medium border-b border-gray-200 pb-2">
                {email || "Not entered"}
              </div>
            ) : (
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter Guardian Email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
          </div>

          {/* Relation */}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Relation</label>
            {editing === false ? (
              <div className="text-gray-900 font-medium border-b border-gray-200 pb-2">
                {relation || "Not entered"}
              </div>
            ) : (
              <input
                type="text"
                value={relation}
                onChange={(e) => setRelation(e.target.value)}
                placeholder="Enter relation with guardian"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Gender</label>
            {editing === false ? (
              <div className="text-gray-900 font-medium border-b border-gray-200 pb-2">
                {gender || "Not entered"}
              </div>
            ) : (
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
            )}
          </div>

          {/* City */}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">City</label>
            {editing === false ? (
              <div className="text-gray-900 font-medium border-b border-gray-200 pb-2">
                {city || "Not entered"}
              </div>
            ) : (
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Enter City"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
          </div>

          {/* State */}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">State</label>
            {editing === false ? (
              <div className="text-gray-900 font-medium border-b border-gray-200 pb-2">
                {state || "Not entered"}
              </div>
            ) : (
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="Enter State"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Address</label>
            {editing === false ? (
              <div className="text-gray-900 font-medium border-b border-gray-200 pb-2">
                {address || "Not entered"}
              </div>
            ) : (
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter Address"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
          </div>

          {/* Zip */}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Zip Code</label>
            {editing === false ? (
              <div className="text-gray-900 font-medium border-b border-gray-200 pb-2">
                {zip || "Not entered"}
              </div>
            ) : (
              <input
                type="text"
                value={zip}
                onChange={(e) => setZip(e.target.value)}
                placeholder="Enter Zip Code"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

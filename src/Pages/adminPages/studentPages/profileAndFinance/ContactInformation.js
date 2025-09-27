"use client"

import { useState } from "react"
import { db } from "../../../../firebase"
import { collection, getDocs, query, where, updateDoc } from "firebase/firestore"

export function ContactInformation({ userDetails, userId }) {
  console.log("UserDetails (Student):", userDetails)
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
                  placeholder="Enter First Name"
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
                  placeholder="Enter Last Name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Mobile Number</label>
              {editing === false ? (
                <div className="text-gray-900 font-medium border-b border-gray-200 pb-2">
                  {phone || "Not entered"}
                </div>
              ) : (
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter Phone Number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Email Address</label>
              <div className="text-gray-900 font-medium border-b border-gray-200 pb-2">
                {userDetails?.email || "Not entered"}
              </div>
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Date of Birth</label>
              {editing === false ? (
                <div className="text-gray-900 font-medium border-b border-gray-200 pb-2">
                  {dob || "Not entered"}
                </div>
              ) : (
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
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
              <div className="text-gray-900 font-medium border-b border-gray-200 pb-2">
                {address || "Not added"}
              </div>
            </div>

            {/* Zip Code */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Zip Code</label>
              {editing === false ? (
                <div className="text-gray-900 font-medium border-b border-gray-200 pb-2">
                  {postal || "Not entered"}
                </div>
              ) : (
                <input
                  type="text"
                  value={postal}
                  onChange={(e) => setPostal(e.target.value)}
                  placeholder="Enter Postal Code"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

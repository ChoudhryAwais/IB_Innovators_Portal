"use client"

import { useState } from "react"
import { db } from "../../../../firebase"
import { collection, getDocs, query, where, updateDoc } from "firebase/firestore"

import { EducationHistory } from "./EducationHistory"
import { ProfileIBForm } from "./ProfileIBForm"
import { ProfileYourIBDPSubjects } from "./ProfileYourIBDPSubjects"
import { ProfileAdditionalIBInfo } from "./ProfileAdditionalIBInfo"
import { ProfessionalTeachingExperience } from "./ProfessionalTeachingExperience"

export function Education({ userDetails, userId }) {
  const [editing, setEditing] = useState(false)

  // Local state for fields
  const [firstName, setFirstName] = useState(userDetails?.userName?.split(" ")[0] || "")
  const [lastName, setLastName] = useState(userDetails?.userName?.split(" ").slice(1).join(" ") || "")
  const [phone, setPhone] = useState(userDetails?.phone || "")
  const [email] = useState(userDetails?.email || "")
  const [relation, setRelation] = useState(userDetails?.relation || "Parent")
  const [gender, setGender] = useState(userDetails?.gender || "Male")
  const [city, setCity] = useState(userDetails?.city || "")
  const [state, setState] = useState(userDetails?.state || "")
  const [address, setAddress] = useState(userDetails?.address || "")
  const [zip, setZip] = useState(userDetails?.zip || "")

  const [savingDetails, setSavingDetails] = useState(false)

  async function saveChanges() {
    if (!firstName || !lastName || !phone || !city || !state || !zip) {
      alert("Please fill all required fields")
      return
    }

    setSavingDetails(true)
    try {
      const details = {
        userName: `${firstName} ${lastName}`,
        phone,
        city,
        state,
        zip,
        address,
        relation,
        gender,
      }

      const userListRef = collection(db, "userList")
      const q = query(userListRef, where("userId", "==", userId))
      const querySnapshot = await getDocs(q)

      if (!querySnapshot.empty) {
        const docRef = querySnapshot.docs[0].ref
        await updateDoc(docRef, details)
      }

      setEditing(false)
    } catch (e) {
      console.error("Error saving education info:", e)
      alert("Error saving changes. Please try again")
    } finally {
      setSavingDetails(false)
    }
  }

  return (
    <div className="bg-white rounded-lg">
      {/* Education Form */}
        
      {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">First Name</label>
          {editing ? (
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            />
          ) : (
            <div className="text-base text-gray-900 border-b border-gray-200 pb-2">{firstName}</div>
          )}
        </div>

       
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">Last Name</label>
          {editing ? (
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            />
          ) : (
            <div className="text-base text-gray-900 border-b border-gray-200 pb-2">{lastName}</div>
          )}
        </div>

       
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">Mobile Number</label>
          {editing ? (
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            />
          ) : (
            <div className="text-base text-gray-900 border-b border-gray-200 pb-2">{phone}</div>
          )}
        </div>

        
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">Email Address</label>
          <div className="text-base text-gray-900 border-b border-gray-200 pb-2">{email}</div>
        </div>

        
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">Relation</label>
          {editing ? (
            <input
              type="text"
              value={relation}
              onChange={(e) => setRelation(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            />
          ) : (
            <div className="text-base text-gray-900 border-b border-gray-200 pb-2">{relation}</div>
          )}
        </div>

   
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">Gender</label>
          {editing ? (
            <input
              type="text"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            />
          ) : (
            <div className="text-base text-gray-900 border-b border-gray-200 pb-2">{gender}</div>
          )}
        </div>


        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">City</label>
          {editing ? (
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            />
          ) : (
            <div className="text-base text-gray-900 border-b border-gray-200 pb-2">{city}</div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">State</label>
          {editing ? (
            <input
              type="text"
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            />
          ) : (
            <div className="text-base text-gray-900 border-b border-gray-200 pb-2">{state}</div>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-500 mb-1">Address</label>
          {editing ? (
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            />
          ) : (
            <div className="text-base text-gray-900 border-b border-gray-200 pb-2">{address}</div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">Zip Code</label>
          {editing ? (
            <input
              type="text"
              value={zip}
              onChange={(e) => setZip(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            />
          ) : (
            <div className="text-base text-gray-900 border-b border-gray-200 pb-2">{zip}</div>
          )}
        </div>
      </div>

      <div className="flex justify-end mt-6">
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Edit
          </button>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={() => setEditing(false)}
              className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={saveChanges}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
              disabled={savingDetails}
            >
              {savingDetails ? "Saving..." : "Save"}
            </button>
          </div>
        )}
      </div> */}

      {/* Extra sections below */}
      <div className="mt-8 space-y-6">
        <EducationHistory userDetails={userDetails} userId={userId} />
        <ProfileIBForm userDetails={userDetails} userId={userId} />
        <ProfileYourIBDPSubjects userDetails={userDetails} userId={userId} />
        <ProfileAdditionalIBInfo userDetails={userDetails} userId={userId} />
        <ProfessionalTeachingExperience userDetails={userDetails} userId={userId} />
      </div>
    </div>
  )
}

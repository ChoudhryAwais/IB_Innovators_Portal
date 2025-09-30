"use client"

import { useState } from "react"
import { db } from "../../../../firebase"
import { collection, getDocs, query, where, updateDoc } from "firebase/firestore"

export function ContactInformation({ userDetails, userId }) {
  const [editing, setEditing] = useState(false)

  const [name, setName] = useState(userDetails?.userName)
  const [city, setCity] = useState(userDetails?.city)
  const [state, setState] = useState(userDetails?.state)
  const [postal, setPostal] = useState(userDetails?.zip)
  const [phone, setPhone] = useState(userDetails?.phone)

  const [savingDetails, setSavingDetails] = useState(false)

  async function savingChanges() {
    if (name !== "" && city !== "" && state !== "" && postal !== "") {
      setSavingDetails(true)
      try {
        let details = {}
        if (name !== "" && city !== "" && state !== "" && postal !== "") {
          details = {
            userName: name,
            city: city,
            state: state,
            zip: postal,
            phone: phone,
          }
        } else if (name !== "") {
          details = { userName: name }
        } else if (city !== "") {
          details = { city }
        } else if (state !== "") {
          details = { state }
        } else if (postal !== "") {
          details = { zip: postal }
        } else if (phone !== "") {
          details = { phone }
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
          <svg
            className="w-12 h-12 text-gray-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
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
            <label className="block text-[14px] font-light text-[#A2A1A8] mb-1">
              First Name
            </label>
            
              <div className="text-[16px] font-light  text-[#16151C] border-b border-gray-200 pb-2">
                {userDetails?.userName?.split(" ")[0] || "Not entered"}
              </div>
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-[14px] font-light text-[#A2A1A8] mb-1">
              Last Name
            </label>
            
              <div className="text-[16px] font-light  text-[#16151C] border-b border-gray-200 pb-2">
                {userDetails?.userName?.split(" ").slice(1).join(" ") ||
                  "Not entered"}
              </div>
          </div>

          {/* Mobile Number */}
          <div>
            <label className="block text-[14px] font-light text-[#A2A1A8] mb-1">
              Mobile Number
            </label>
            
              <div className="text-[16px] font-light  text-[#16151C] border-b border-gray-200 pb-2">
                {userDetails?.phone || "not entered"}
              </div>
            
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-[14px] font-light text-[#A2A1A8] mb-1">
              Email Address
            </label>
              <div className="text-[16px] font-light  text-[#16151C] border-b border-gray-200 pb-2">
              {userDetails?.email || "Not entered"}
            </div>
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block text-[14px] font-light text-[#A2A1A8] mb-1">
              Date of Birth
            </label>
              <div className="text-[16px] font-light  text-[#16151C] border-b border-gray-200 pb-2">
              {userDetails?.dob || "Not entered"}
              </div>
          </div>

          {/* Gender */}
          <div>
            <label className="block text-[14px] font-light text-[#A2A1A8] mb-1">
              Gender
            </label>
              <div className="text-[16px] font-light  text-[#16151C] border-b border-gray-200 pb-2">
              {userDetails?.gender || "Not entered"}
              </div>
          </div>

          {/* City */}
          <div>
            <label className="block text-[14px] font-light text-[#A2A1A8] mb-1">
              City
            </label>
            
              <div className="text-[16px] font-light  text-[#16151C] border-b border-gray-200 pb-2">
                {userDetails?.city || "Not entered"}
              </div>
            
          </div>

          {/* State */}
          <div>
            <label className="block text-[14px] font-light text-[#A2A1A8] mb-1">
              State
            </label>
          
              <div className="text-[16px] font-light  text-[#16151C] border-b border-gray-200 pb-2">
                {userDetails?.state || "Not entered"}
              </div>
            
          </div>

          {/* Address */}
          <div>
            <label className="block text-[14px] font-light text-[#A2A1A8] mb-1">
              Address
            </label>
              <div className="text-[16px] font-light  text-[#16151C] border-b border-gray-200 pb-2">
              {userDetails?.address || "Not added"}
            </div>
          </div>

          {/* Zip Code */}
          <div>
            <label className="block text-[14px] font-light text-[#A2A1A8] mb-1">
              Zip Code
            </label>
            
              <div className="text-[16px] font-light  text-[#16151C] border-b border-gray-200 pb-2">
                {userDetails?.zip || "Not added"}
              </div>
          </div>
        </div>

      </div>
    </div>
  </div>
)

}

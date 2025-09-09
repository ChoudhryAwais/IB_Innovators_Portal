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
      <div className="flex items-start gap-8">
        <div className="flex-shrink-0">
          <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center border border-gray-300">
            <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </div>
        </div>

        {/* Profile Details Grid */}
        <div className="flex-1">
          <div className="grid grid-cols-2 gap-x-8 gap-y-6">
            {/* First Name */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">First Name</label>
              {editing === false ? (
                <div className="text-gray-900 font-medium">{userDetails?.userName?.split(" ")[0] || "Youssry"}</div>
              ) : (
                <input
                  type="text"
                  value={name?.split(" ")[0] || ""}
                  onChange={(e) => {
                    const lastName = name?.split(" ").slice(1).join(" ") || ""
                    setName(e.target.value + (lastName ? " " + lastName : ""))
                  }}
                  placeholder="Enter First Name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Last Name</label>
              {editing === false ? (
                <div className="text-gray-900 font-medium">
                  {userDetails?.userName?.split(" ").slice(1).join(" ") || "El-Sadi"}
                </div>
              ) : (
                <input
                  type="text"
                  value={name?.split(" ").slice(1).join(" ") || ""}
                  onChange={(e) => {
                    const firstName = name?.split(" ")[0] || ""
                    setName(firstName + (e.target.value ? " " + e.target.value : ""))
                  }}
                  placeholder="Enter Last Name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Mobile Number</label>
              {editing === false ? (
                <div className="text-gray-900 font-medium">{userDetails?.phone || "+92 111 4585587"}</div>
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
              <div className="text-gray-900 font-medium">{userDetails?.email || "tutor@example.com"}</div>
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Date of Birth</label>
              <div className="text-gray-900 font-medium">July 01, 1995</div>
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Gender</label>
              <div className="text-gray-900 font-medium">Male</div>
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">City</label>
              {editing === false ? (
                <div className="text-gray-900 font-medium">{userDetails?.city || "California"}</div>
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
                <div className="text-gray-900 font-medium">{userDetails?.state || "United State"}</div>
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
              <div className="text-gray-900 font-medium">2464 Royal Ln. Mesa, New Jersey</div>
            </div>

            {/* Zip Code */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Zip Code</label>
              {editing === false ? (
                <div className="text-gray-900 font-medium">{userDetails?.zip || "35624"}</div>
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

          {/* Edit/Save Buttons */}
          <div className="flex justify-end mt-8">
            {editing === false ? (
              <button
                onClick={() => setEditing(true)}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Edit Profile
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
                  onClick={savingChanges}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  disabled={savingDetails}
                >
                  {savingDetails ? "Saving..." : "Save Changes"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

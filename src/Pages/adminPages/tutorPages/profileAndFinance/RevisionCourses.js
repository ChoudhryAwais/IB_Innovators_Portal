"use client"

import { useState } from "react"

import { db } from "../../../../firebase"
import { collection, getDocs, query, where, updateDoc } from "firebase/firestore"

export function RevisionCourses({ userDetails, userId }) {
  const [wantToTeachRevisionCourse, setWantToTeachRevisionCourse] = useState(
    userDetails?.wantToTeachRevisionCourse ? userDetails?.wantToTeachRevisionCourse : false,
  )

  const [editing, setEditing] = useState(false)
  const [savingDetails, setSavingDetails] = useState(false)

  async function savingChanges() {
    setSavingDetails(true)
    try {
      const details = { wantToTeachRevisionCourse }

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
  }

  return (
    <div className="bg-white p-6 rounded-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Revision Courses</h2>

        {/* Toggle Switch */}
        <div className="relative">
          <input
            type="checkbox"
            id="revision-toggle"
            className="sr-only"
            checked={wantToTeachRevisionCourse}
            onChange={(e) => setWantToTeachRevisionCourse(e.target.checked)}
          />
          <label
            htmlFor="revision-toggle"
            className={`flex items-center cursor-pointer w-12 h-6 rounded-full transition-colors duration-200 ${
              wantToTeachRevisionCourse ? "bg-green-500" : "bg-gray-300"
            }`}
          >
            <span
              className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 ${
                wantToTeachRevisionCourse ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </label>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-gray-700 mb-2">I'm interested in teaching a revision course</p>

        {wantToTeachRevisionCourse ? (
          <p className="font-semibold">
            <span className="text-green-600">Yes,</span> I am able to teach them at the moment.
          </p>
        ) : (
          <p className="text-gray-600 font-semibold">No, I am unable to teach them at the moment.</p>
        )}
      </div>

      {/* Keep edit functionality but hide it for now to match design */}
      {editing && (
        <div className="mt-6 flex gap-2">
          <button
            onClick={() => setEditing(false)}
            className="border border-red-600 text-white bg-red-600 rounded-none px-3 py-1.5"
          >
            CANCEL
          </button>
          <button
            onClick={savingChanges}
            className="border border-green-600 text-white bg-green-600 rounded-none px-3 py-1.5"
          >
            {savingDetails ? "SAVING" : "SAVE"}
          </button>
        </div>
      )}
    </div>
  )
}

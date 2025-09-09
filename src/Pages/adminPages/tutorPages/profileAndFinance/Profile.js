"use client"

import { useState } from "react"

import { ContactInformation } from "./ContactInformation"
import { Education } from "./Education"
import { YourSupport } from "./YourSupport"
import { RevisionCourses } from "./RevisionCourses"

export function Profile({ userDetails, userId }) {
  const [curr, setCurr] = useState("Personal Information")

  return (
    <div className="h-full">
      <div className="border-b border-gray-200">
        <div className="flex gap-0">
          <button
            className={`px-6 py-4 text-sm font-medium border-b-2 transition-all duration-200 ${
              curr === "Personal Information"
                ? "border-blue-500 text-blue-600 bg-blue-50"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
            onClick={() => {
              setCurr("Personal Information")
            }}
          >
            Personal Information
          </button>

          <button
            className={`px-6 py-4 text-sm font-medium border-b-2 transition-all duration-200 ${
              curr === "Education"
                ? "border-blue-500 text-blue-600 bg-blue-50"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
            onClick={() => {
              setCurr("Education")
            }}
          >
            Education
          </button>

          <button
            className={`px-6 py-4 text-sm font-medium border-b-2 transition-all duration-200 ${
              curr === "Your Support"
                ? "border-blue-500 text-blue-600 bg-blue-50"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
            onClick={() => {
              setCurr("Your Support")
            }}
          >
            Your Support
          </button>

          <button
            className={`px-6 py-4 text-sm font-medium border-b-2 transition-all duration-200 ${
              curr === "Revision Course"
                ? "border-blue-500 text-blue-600 bg-blue-50"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
            onClick={() => {
              setCurr("Revision Course")
            }}
          >
            Revision Course
          </button>
        </div>
      </div>

      <div className="p-6">
        {curr === "Personal Information" && <ContactInformation userDetails={userDetails} userId={userId} />}
        {curr === "Education" && <Education userDetails={userDetails} userId={userId} />}
        {curr === "Your Support" && <YourSupport userDetails={userDetails} userId={userId} />}
        {curr === "Revision Course" && <RevisionCourses userDetails={userDetails} userId={userId} />}
      </div>
    </div>
  )
}

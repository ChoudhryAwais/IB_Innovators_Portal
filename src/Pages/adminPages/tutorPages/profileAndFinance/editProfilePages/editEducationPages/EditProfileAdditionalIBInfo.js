"use client"

import React from "react"

export function EditProfileAdditionalIBInfo({ data, setData }) {
  const handleChange = (field, value) => {
    setData({
      ...data,
      [field]: value,
    })
  }

  return (
    <div className="mt-5 pb-5 border-b border-gray-300">
      <div className="text-left text-xl font-bold mb-5">
        Additional IB Information
      </div>

      {/* TOK & Total IB Score */}
      <div className="flex flex-1 justify-between flex-wrap mb-2.5">
        <div className="flex-1 mr-2">
          <div className="text-sm">TOK Grade</div>
          <input
            type="text"
            value={data?.tokGrade || ""}
            onChange={(e) => handleChange("tokGrade", e.target.value)}
            placeholder="Enter TOK Grade"
            className="border p-1 rounded w-full"
          />
        </div>

        <div className="flex-1 ml-2">
          <div className="text-sm">Total IB Score</div>
          <input
            type="text"
            value={data?.totalIbScore || ""}
            onChange={(e) => handleChange("totalIbScore", e.target.value)}
            placeholder="Enter Total IB Score"
            className="border p-1 rounded w-full"
          />
        </div>
      </div>

      {/* EE Subject Areas */}
      <div className="flex flex-1 justify-between flex-wrap mb-2.5">
        <div className="flex-1 mr-2">
          <div className="text-sm">EE Subject Area</div>
          <input
            type="text"
            value={data?.eeSubjectArea || ""}
            onChange={(e) => handleChange("eeSubjectArea", e.target.value)}
            placeholder="Enter EE Subject Area"
            className="border p-1 rounded w-full"
          />
        </div>

        <div className="flex-1 ml-2">
          <div className="text-sm">2nd EE Subject Area</div>
          <input
            type="text"
            value={data?.secondEeSubjectArea || ""}
            onChange={(e) => handleChange("secondEeSubjectArea", e.target.value)}
            placeholder="Enter 2nd EE Subject Area"
            className="border p-1 rounded w-full"
          />
        </div>
      </div>

      {/* IB School */}
      <div className="mb-2.5">
        <div className="text-sm">Your IB School</div>
        <input
          type="text"
          value={data?.yourIbSchool || ""}
          onChange={(e) => handleChange("yourIbSchool", e.target.value)}
          placeholder="Enter Your IB School"
          className="border p-1 rounded w-full"
        />
      </div>

      {/* Additional Info */}
      <div>
        <div className="text-sm">
          Additional Information about your IB Education
        </div>
        <textarea
          value={data?.additionalInfo || ""}
          onChange={(e) => handleChange("additionalInfo", e.target.value)}
          placeholder="Enter Additional Information"
          className="border p-1 rounded w-full min-h-[80px]"
        />
      </div>
    </div>
  )
}

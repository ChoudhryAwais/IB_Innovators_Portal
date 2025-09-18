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
    <div className="border-b border-gray-300 pb-5 mt-5">
      {/* Header row (same style/spacing as EditEducationHistory) */}
      <div className="flex justify-between items-start">
        <div className="w-full text-left text-xl font-bold">
          Additional IB Information

          {/* Fields container */}
          <div className="mt-4">
            {/* TOK & Total IB Score */}
            <div className="grid grid-cols-2 gap-6 mb-4">
              <div>
                <div className="text-sm text-[#A2A1A8] font-light">TOK Grade</div>
                <input
                  type="text"
                  value={data?.tokGrade || ""}
                  onChange={(e) => handleChange("tokGrade", e.target.value)}
                  placeholder="Enter TOK Grade"
                  className="border-b p-1  w-full placeholder:text-lg placeholder:text-[#16151C] focus:placeholder:text-gray-400"
                />
              </div>

              <div>
                <div className="text-sm text-[#A2A1A8] font-light">Total IB Score</div>
                <input
                  type="text"
                  value={data?.totalIbScore || ""}
                  onChange={(e) => handleChange("totalIbScore", e.target.value)}
                  placeholder="Enter Total IB Score"
                  className="border-b p-1  w-full placeholder:text-lg placeholder:text-[#16151C] focus:placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* EE Subject Areas */}
            <div className="grid grid-cols-2 gap-6 mb-4">
              <div>
                <div className="text-sm text-[#A2A1A8] font-light">EE Subject Area</div>
                <input
                  type="text"
                  value={data?.eeSubjectArea || ""}
                  onChange={(e) => handleChange("eeSubjectArea", e.target.value)}
                  placeholder="Enter EE Subject Area"
                  className="border-b p-1  w-full placeholder:text-lg placeholder:text-[#16151C] focus:placeholder:text-gray-400"
                />
              </div>

              <div>
                <div className="text-sm text-[#A2A1A8] font-light">2nd EE Subject Area</div>
                <input
                  type="text"
                  value={data?.secondEeSubjectArea || ""}
                  onChange={(e) => handleChange("secondEeSubjectArea", e.target.value)}
                  placeholder="Enter 2nd EE Subject Area"
                  className="border-b p-1  w-full placeholder:text-lg placeholder:text-[#16151C] focus:placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* IB School */}
            <div className="mb-4">
              <div className="text-sm text-[#A2A1A8] font-light">Your IB School</div>
              <input
                type="text"
                value={data?.yourIbSchool || ""}
                onChange={(e) => handleChange("yourIbSchool", e.target.value)}
                placeholder="Enter Your IB School"
                className="border-b p-1  w-full placeholder:text-lg placeholder:text-[#16151C] focus:placeholder:text-gray-400"
              />
            </div>

            {/* Additional Info */}
            <div>
              <div className="text-sm text-[#A2A1A8] font-light">
                Additional Information about your IB Education you think we should know about
              </div>
              <textarea
                value={data?.additionalInfo || ""}
                onChange={(e) => handleChange("additionalInfo", e.target.value)}
                placeholder="Write a Note"
                className="border p-1 w-full min-h-[80px] placeholder:text-lg placeholder:text-[#16151C] focus:placeholder:text-gray-400"
              />
            </div>
          </div>
        </div>

        {/* Empty placeholder for button space (so alignment matches EditEducationHistory) */}
        <div className="w-80"></div>
      </div>
    </div>
  )
}

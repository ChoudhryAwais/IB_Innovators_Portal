"use client"

import React from "react"

export function EditProfileIBForm({ data, setData }) {
  const handleChange = (field, value) => {
    setData({
      ...data,
      [field]: value,
    })
  }

  return (
    <div className="pb-3 border-b border-gray-300">
      <div className="text-left text-xl font-bold mb-3">
        International Baccalaureate
      </div>

      {/* Grid with 2 columns */}
      <div className="grid grid-cols-2 gap-2">
        {/* IB Diploma */}
        <div>
          <p className="mb-2 border-b border-gray-200 pb-2">
            <span className="text-sm text-[#A2A1A8] font-light">Did you complete IB Diploma?</span>
            <br />
            <div>
              <label className="mr-16">
                <input
                  type="radio"
                  checked={data?.ibDiploma === true}
                  onChange={() => handleChange("ibDiploma", true)}
                />
                <span className="ml-1">Yes</span>
              </label>
              <label className="mr-5">
                <input
                  type="radio"
                  checked={data?.ibDiploma === false}
                  onChange={() => handleChange("ibDiploma", false)}
                />
                <span className="ml-1">No</span>
              </label>
            </div>
          </p>
        </div>

        {/* IB MYP */}
        <div>
          <p className="mb-2 border-b border-gray-200 pb-2">
            <span className="text-sm text-[#A2A1A8] font-light">Did you complete IB MYP?</span>
            <br />
            <div>
              <label className="mr-16">
                <input
                  type="radio"
                  checked={data?.ibMyp === true}
                  onChange={() => handleChange("ibMyp", true)}
                />
                <span className="ml-1">Yes</span>
              </label>
              <label className="mr-5">
                <input
                  type="radio"
                  checked={data?.ibMyp === false}
                  onChange={() => handleChange("ibMyp", false)}
                />
                <span className="ml-1">No</span>
              </label>
            </div>
          </p>
        </div>

        {/* IB PYP */}
        <div>
          <p className="mb-1">
            <span className="text-sm text-[#A2A1A8] font-light">Did you complete IB PYP?</span>
            <br />
            <div>
              <label className="mr-16">
                <input
                  type="radio"
                  checked={data?.ibPyp === true}
                  onChange={() => handleChange("ibPyp", true)}
                />
                <span className="ml-1">Yes</span>
              </label>
              <label className="mr-16">
                <input
                  type="radio"
                  checked={data?.ibPyp === false}
                  onChange={() => handleChange("ibPyp", false)}
                />
                <span className="ml-1">No</span>
              </label>
            </div>
          </p>
        </div>
      </div>
    </div>
  )
}

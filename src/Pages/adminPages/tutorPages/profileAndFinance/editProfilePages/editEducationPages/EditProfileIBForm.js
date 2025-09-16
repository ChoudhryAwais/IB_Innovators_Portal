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
    <div className="mt-5 pb-5 border-b border-gray-300">
      <div className="text-left text-2xl font-bold mb-5">
        International Baccalaureate
      </div>

      {/* IB Diploma */}
      <p className="mb-4">
        <span className="text-sm">Did you complete IB Diploma?</span>
        <br />
        <div>
          <label className="mr-5">
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

      {/* IB MYP */}
      <p className="mb-4">
        <span className="text-sm">Did you complete IB MYP?</span>
        <br />
        <div>
          <label className="mr-5">
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

      {/* IB PYP */}
      <p className="mb-4">
        <span className="text-sm">Did you complete IB PYP?</span>
        <br />
        <div>
          <label className="mr-5">
            <input
              type="radio"
              checked={data?.ibPyp === true}
              onChange={() => handleChange("ibPyp", true)}
            />
            <span className="ml-1">Yes</span>
          </label>
          <label className="mr-5">
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
  )
}

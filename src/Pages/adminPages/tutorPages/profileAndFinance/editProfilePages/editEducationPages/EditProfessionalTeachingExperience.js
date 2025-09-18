"use client"

import React from "react"

export function EditProfessionalTeachingExperience({ data, setData }) {
  const handleChange = (field, value) => {
    setData({
      ...data,
      [field]: value,
    })
  }

  return (
    <div className="mt-5 pb-5">
      {/* Header row styled like EditEducationHistory */}
      <div className="flex justify-between items-start">
        {/* Left side: heading + fields */}
        <div className="w-full text-left">
          <span className="text-2xl font-bold">Professional Teaching Experience</span>
          {/* Fields go directly under heading */}
          <div className="mt-4">
            {/* IB World School Teacher */}
            <div className="mb-2.5 border-b border-gray-200 pb-2">
              <span className="text-sm text-[#A2A1A8] font-light">
                Do you have experience working professionally as a teacher in an IB World School?
              </span>
              <div>
                <label className="mr-16">
                  <input
                    type="radio"
                    value="yes"
                    checked={data?.professionalIBTeacherExperience === true}
                    onChange={() => handleChange("professionalIBTeacherExperience", true)}
                  />
                  <span className="ml-1">Yes</span>
                </label>
                <label className="mr-5">
                  <input
                    type="radio"
                    value="no"
                    checked={data?.professionalIBTeacherExperience === false}
                    onChange={() => handleChange("professionalIBTeacherExperience", false)}
                  />
                  <span className="ml-1">No</span>
                </label>
              </div>
            </div>

            {/* Acted as IB Examiner */}
            <div className="mb-2.5 border-b border-gray-200 pb-2">
              <span className="text-sm text-[#A2A1A8] font-light">Have you ever acted as IB Examiner?</span>
              <div>
                <label className="mr-16">
                  <input
                    type="radio"
                    value="yes"
                    checked={data?.actedAsIBExaminer === true}
                    onChange={() => handleChange("actedAsIBExaminer", true)}
                  />
                  <span className="ml-1">Yes</span>
                </label>
                <label className="mr-5">
                  <input
                    type="radio"
                    value="no"
                    checked={data?.actedAsIBExaminer === false}
                    onChange={() => handleChange("actedAsIBExaminer", false)}
                  />
                  <span className="ml-1">No</span>
                </label>
              </div>
            </div>

            {/* Subjects & Papers Moderated */}
            <div className="mb-2.5">
              <div className="text-sm text-[#A2A1A8] font-light">
                If yes then please detail subject(s), paper(s), and year moderated
              </div>
              <input
                type="text"
                value={data?.detailSubjectsAndPapersModerated || ""}
                onChange={(e) =>
                  handleChange("detailSubjectsAndPapersModerated", e.target.value)
                }
                placeholder="Enter details here"
                className="border-b p-1  w-full placeholder:text-lg placeholder:text-[#16151C] focus:placeholder:text-gray-400"
              />
            </div>

            {/* SEN Support */}
            <div className="mb-2.5 border-b border-gray-200 pb-2">
              <span className="text-sm text-[#A2A1A8] font-light">
                Do you have any experience supporting students with Special Educational Needs (SEN)?
              </span>
              <div>
                <label className="mr-16">
                  <input
                    type="radio"
                    value="yes"
                    checked={data?.supportingStudentWithSpecialNeeds === true}
                    onChange={() => handleChange("supportingStudentWithSpecialNeeds", true)}
                  />
                  <span className="ml-1">Yes</span>
                </label>
                <label className="mr-5">
                  <input
                    type="radio"
                    value="no"
                    checked={data?.supportingStudentWithSpecialNeeds === false}
                    onChange={() => handleChange("supportingStudentWithSpecialNeeds", false)}
                  />
                  <span className="ml-1">No</span>
                </label>
              </div>
            </div>

            {/* SEN Details */}
            <div className="mb-2.5">
              <div className="text-sm text-[#A2A1A8] font-light">
                If yes then please detail the SENs you've had experience with
              </div>
              <input
                type="text"
                value={data?.explainSENExperience || ""}
                onChange={(e) => handleChange("explainSENExperience", e.target.value)}
                placeholder="Enter details here"
                className="border-b p-1  w-full placeholder:text-lg placeholder:text-[#16151C] focus:placeholder:text-gray-400"
              />
            </div>

            {/* Other Educational Programmes */}
            <div className="mb-2.5">
              <div className="text-sm text-[#A2A1A8] font-light">Other Educational Programmes</div>
              <input
                type="text"
                value={data?.otherEducationalProgrammes || ""}
                onChange={(e) => handleChange("otherEducationalProgrammes", e.target.value)}
                placeholder="Enter details here"
                className="border-b p-1  w-full placeholder:text-lg placeholder:text-[#16151C] focus:placeholder:text-gray-400"
              />
            </div>
          </div>
        </div>

        {/* Right side: keep empty space to align with Add button in other form */}
        <div className="w-80 flex justify-end"></div>
      </div>
    </div>
  )
}

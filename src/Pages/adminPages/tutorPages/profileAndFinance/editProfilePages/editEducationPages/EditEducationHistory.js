"use client"

import React, { useState } from "react"

export function EditEducationHistory({ data, setData }) {
  const [addingNewRecord, setAddingNewRecord] = useState(false)

  const [newRecord, setNewRecord] = useState({
    id: null,
    qualificationTitle: "",
    yearOfGraduation: "",
    university: "",
    grade: "",
  })

  const removeEducationRecord = (id) => {
    const updatedRecords = data.filter((record) => record.id !== id)
    setData(updatedRecords)
  }

  const handleInputChange = (field, value) => {
    setNewRecord({ ...newRecord, [field]: value })
  }

  const renderEducationRecords = () => {
    return data.map((record) => (
      <div key={record.id} className="flex-1 mb-5 border-b border-gray-200 pb-4">
        <div className="flex flex-wrap flex-1 gap-6">
          <div className="flex-1">
            <div className="text-xs">Qualification Title</div>
            <input
              type="text"
              value={record.qualificationTitle}
              onChange={(e) =>
                setData(
                  data.map((r) =>
                    r.id === record.id ? { ...r, qualificationTitle: e.target.value } : r
                  )
                )
              }
              className="w-full border p-1 rounded"
            />
          </div>

          <div className="flex-1">
            <div className="text-xs">Year of Graduation</div>
            <input
              type="text"
              value={record.yearOfGraduation}
              onChange={(e) =>
                setData(
                  data.map((r) =>
                    r.id === record.id ? { ...r, yearOfGraduation: e.target.value } : r
                  )
                )
              }
              className="w-full border p-1 rounded"
            />
          </div>
        </div>

        <div className="flex flex-wrap flex-1 gap-6 mt-3">
          <div className="flex-1">
            <div className="text-xs">University</div>
            <input
              type="text"
              value={record.university}
              onChange={(e) =>
                setData(
                  data.map((r) =>
                    r.id === record.id ? { ...r, university: e.target.value } : r
                  )
                )
              }
              className="w-full border p-1 rounded"
            />
          </div>

          <div className="flex-1">
            <div className="text-xs">Grade (Or in progress)</div>
            <input
              type="text"
              value={record.grade}
              onChange={(e) =>
                setData(
                  data.map((r) =>
                    r.id === record.id ? { ...r, grade: e.target.value } : r
                  )
                )
              }
              className="w-full border p-1 rounded"
            />
          </div>
        </div>

        <button
          className="mt-3 px-2 py-1 bg-red-600 text-white rounded"
          onClick={() => removeEducationRecord(record.id)}
        >
          Remove Record
        </button>
      </div>
    ))
  }

  const renderNewRecordInputs = () => {
    return (
      <div key={newRecord.id} className="flex-1 mb-5">
        <div className="flex flex-wrap flex-1 gap-6">
          <div className="flex-1">
            <div className="text-xs">Qualification Title</div>
            <input
              type="text"
              value={newRecord.qualificationTitle}
              onChange={(e) => handleInputChange("qualificationTitle", e.target.value)}
              className="border p-1 w-full rounded"
            />
          </div>

          <div className="flex-1">
            <div className="text-xs">Year of Graduation</div>
            <input
              type="text"
              value={newRecord.yearOfGraduation}
              onChange={(e) => handleInputChange("yearOfGraduation", e.target.value)}
              className="border p-1 w-full rounded"
            />
          </div>
        </div>

        <div className="flex flex-wrap flex-1 gap-6 mt-3">
          <div className="flex-1">
            <div className="text-xs">University</div>
            <input
              type="text"
              value={newRecord.university}
              onChange={(e) => handleInputChange("university", e.target.value)}
              className="border p-1 w-full rounded"
            />
          </div>

          <div className="flex-1">
            <div className="text-xs">Grade (Or in progress)</div>
            <input
              type="text"
              value={newRecord.grade}
              onChange={(e) => handleInputChange("grade", e.target.value)}
              className="border p-1 w-full rounded"
            />
          </div>
        </div>

        <div className="flex flex-1 gap-2 mt-4">
          <button
            className="px-3 py-1 bg-gray-500 text-white rounded"
            onClick={() => setAddingNewRecord(false)}
          >
            Cancel
          </button>
          <button
            className="px-3 py-1 bg-green-600 text-white rounded"
            onClick={() => {
              const newId = Math.floor(1000000000 + Math.random() * 9000000000)
              setData([...data, { ...newRecord, id: newId }])
              setNewRecord({
                id: null,
                qualificationTitle: "",
                yearOfGraduation: "",
                university: "",
                grade: "",
              })
              setAddingNewRecord(false)
            }}
          >
            Add
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="pb-2.5 border-b border-gray-300">
      <div className="flex flex-1 justify-between items-center flex-wrap mb-5">
        <div className="text-left text-2xl font-bold">Education History</div>
      </div>

      {data.length !== 0 ? (
        renderEducationRecords()
      ) : (
        <div className="mb-2.5">No Educational History</div>
      )}

      {addingNewRecord ? (
        renderNewRecordInputs()
      ) : (
        <button
          className="px-3 py-1 border border-gray-400 rounded"
          onClick={() => setAddingNewRecord(true)}
        >
          Add New Record
        </button>
      )}
    </div>
  )
}

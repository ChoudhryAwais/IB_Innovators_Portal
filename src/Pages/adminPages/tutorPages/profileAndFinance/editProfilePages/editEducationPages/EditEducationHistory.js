"use client"

import React, { useState } from "react"
import Button from "@mui/material/Button"

export function EditEducationHistory({ data, setData }) {
  const [addingNewRecord, setAddingNewRecord] = useState(false)

  const [newRecord, setNewRecord] = useState({
    id: null,
    qualificationTitle: "",
    yearOfGraduation: "",
    university: "",
    grade: "",
  })

  const handleInputChange = (field, value) => {
    setNewRecord({ ...newRecord, [field]: value })
  }

  const removeEducationRecord = (id) => {
    setData(data.filter((record) => record.id !== id))
  }

  const renderEducationRecords = () => {
    return data.map((record) => (
      <div key={record.id} className="mb-5 border-b border-gray-200 pb-4">
        <div className="grid grid-cols-2 gap-6">
          <div>
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
          <div>
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

        <div className="grid grid-cols-2 gap-6 mt-3">
          <div>
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
          <div>
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
      </div>
    ))
  }

  const renderNewRecordInputs = () => {
    return (
      <div className="mb-5 mt-4">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <div className="text-xs">Qualification Title</div>
            <input
              type="text"
              value={newRecord.qualificationTitle}
              onChange={(e) => handleInputChange("qualificationTitle", e.target.value)}
              className="border p-1 w-full rounded"
            />
          </div>

          <div>
            <div className="text-xs">Year of Graduation</div>
            <input
              type="text"
              value={newRecord.yearOfGraduation}
              onChange={(e) => handleInputChange("yearOfGraduation", e.target.value)}
              className="border p-1 w-full rounded"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mt-3">
          <div>
            <div className="text-xs">University</div>
            <input
              type="text"
              value={newRecord.university}
              onChange={(e) => handleInputChange("university", e.target.value)}
              className="border p-1 w-full rounded"
            />
          </div>

          <div>
            <div className="text-xs">Grade (Or in progress)</div>
            <input
              type="text"
              value={newRecord.grade}
              onChange={(e) => handleInputChange("grade", e.target.value)}
              className="border p-1 w-full rounded"
            />
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <Button
            variant="outlined"
            color="inherit"
            onClick={() => setAddingNewRecord(false)}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="success"
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
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="">
      {/* Header row */}
      <div className="flex justify-between items-start ">
        <div className="w-full text-left text-2xl font-bold">
          Education History
          {/* Fields can start immediately below the heading */}
          <div className="mt-4">
            {data.length !== 0 && renderEducationRecords()}
            {addingNewRecord && renderNewRecordInputs()}
            {data.length === 0 && !addingNewRecord && (
              <div className="text-gray-500 mb-4 text-xl">No Educational History</div>
            )}
          </div>
        </div>

        {/* Add button top-right */}
        {!addingNewRecord && (
          <div className=" w-80 flex justify-end">
            <Button
              sx={{ padding: "10px" }}
              variant="outlined"
              onClick={() => setAddingNewRecord(true)}
            >
              Add New Record
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

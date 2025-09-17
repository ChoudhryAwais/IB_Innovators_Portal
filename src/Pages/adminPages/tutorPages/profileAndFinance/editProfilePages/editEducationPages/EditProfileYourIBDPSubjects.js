"use client"

import React, { useState } from "react"
import Button from "@mui/material/Button"

export function EditProfileYourIBDPSubjects({ data = [], setData }) {
  const [newRecord, setNewRecord] = useState({
    id: null,
    subject: "",
    score: "",
    level: "",
  })
  const [addingNewRecord, setAddingNewRecord] = useState(false)

  const handleInputChange = (field, value) => {
    setNewRecord({ ...newRecord, [field]: value })
  }

  const removeSubject = (id) => {
    const updated = data.filter((record) => record.id !== id)
    setData(updated)
  }

  const renderIBDPSubjects = () =>
    data.map((record) => (
      <div key={record.id} className="mb-5 border-b border-gray-200 pb-4">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <div className="text-xs">Subject</div>
            <input
              type="text"
              value={record.subject}
              onChange={(e) =>
                setData(
                  data.map((r) =>
                    r.id === record.id ? { ...r, subject: e.target.value } : r
                  )
                )
              }
              className="w-full border p-1 rounded"
            />
          </div>

          <div>
            <div className="text-xs">Score</div>
            <input
              type="text"
              value={record.score}
              onChange={(e) =>
                setData(
                  data.map((r) =>
                    r.id === record.id ? { ...r, score: e.target.value } : r
                  )
                )
              }
              className="w-full border p-1 rounded"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mt-3">
          <div>
            <div className="text-xs">Level</div>
            <input
              type="text"
              value={record.level}
              onChange={(e) =>
                setData(
                  data.map((r) =>
                    r.id === record.id ? { ...r, level: e.target.value } : r
                  )
                )
              }
              className="w-full border p-1 rounded"
            />
          </div>
        </div>

        {/* <Button
          variant="contained"
          color="error"
          size="small"
          sx={{ mt: 2 }}
          onClick={() => removeSubject(record.id)}
        >
          Remove Subject
        </Button> */}
      </div>
    ))

  const renderNewRecordInputs = () => (
    <div className="mb-5 mt-4">
      <div className="grid grid-cols-2 gap-6">
        <div>
          <div className="text-xs">Subject</div>
          <input
            type="text"
            value={newRecord.subject}
            onChange={(e) => handleInputChange("subject", e.target.value)}
            className="border p-1 w-full rounded"
          />
        </div>

        <div>
          <div className="text-xs">Score</div>
          <input
            type="text"
            value={newRecord.score}
            onChange={(e) => handleInputChange("score", e.target.value)}
            className="border p-1 w-full rounded"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mt-3">
        <div>
          <div className="text-xs">Level</div>
          <input
            type="text"
            value={newRecord.level}
            onChange={(e) => handleInputChange("level", e.target.value)}
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
            if (!newRecord.subject || !newRecord.level) {
              alert("Please fill subject and level before adding")
              return
            }
            const newId = Math.floor(1000000000 + Math.random() * 9000000000)
            setData([...data, { ...newRecord, id: newId }])
            setNewRecord({
              id: null,
              subject: "",
              score: "",
              level: "",
            })
            setAddingNewRecord(false)
          }}
        >
          Add
        </Button>
      </div>
    </div>
  )

  return (
    <div className="pb-2.5 border-b border-gray-300">
      {/* Header row */}
      <div className="flex justify-between items-start">
        <div className="w-full text-left text-2xl font-bold">
          Your IBDP Subjects
          <div className="mt-4">
            {renderIBDPSubjects()}
            {addingNewRecord && renderNewRecordInputs()}
            {data.length === 0 && !addingNewRecord && (
              <div className="text-gray-500 text-xl mb-4">No IBDP Subjects</div>
            )}
          </div>
        </div>

        {/* Add button top-right */}
        {!addingNewRecord && (
          <div className="w-80 flex justify-end">
            <Button
              sx={{ padding: "10px" }}
              variant="outlined"
              onClick={() => setAddingNewRecord(true)}
            >
              Add New Subject
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

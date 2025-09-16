"use client"

import React, { useState } from "react"

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
      <div key={record.id} className="flex-1 mb-5">
        <div className="flex flex-wrap flex-1">
          <div className="flex-1">
            <div className="text-sm">Subject</div>
            <div className="text-base">{record.subject}</div>
          </div>

          <div className="flex-1">
            <div className="text-sm">Score</div>
            <div className="text-base">{record.score}</div>
          </div>
        </div>

        <div className="flex flex-wrap flex-1">
          <div className="flex-1">
            <div className="text-sm">Level</div>
            <div className="text-base">{record.level}</div>
          </div>
        </div>

        <button
          className="px-2 py-1 rounded-none bg-red-600 text-white mt-2"
          onClick={() => removeSubject(record.id)}
        >
          Remove Subject
        </button>
      </div>
    ))

  const renderNewRecordInputs = () => (
    <div key={newRecord.id} className="flex-1 mb-5">
      <div className="flex flex-wrap flex-1">
        <div className="flex-1">
          <div className="text-sm">Subject</div>
          <input
            type="text"
            value={newRecord.subject}
            onChange={(e) => handleInputChange("subject", e.target.value)}
            className="border px-2 py-1 w-full"
          />
        </div>

        <div className="flex-1">
          <div className="text-sm">Score</div>
          <input
            type="text"
            value={newRecord.score}
            onChange={(e) => handleInputChange("score", e.target.value)}
            className="border px-2 py-1 w-full"
          />
        </div>
      </div>

      <div className="flex flex-wrap flex-1">
        <div className="flex-1">
          <div className="text-sm">Level</div>
          <input
            type="text"
            value={newRecord.level}
            onChange={(e) => handleInputChange("level", e.target.value)}
            className="border px-2 py-1 w-full"
          />
        </div>
      </div>

      <div className="flex-1 flex gap-3 mt-4">
        <button
          className="px-2 py-1 rounded-none bg-red-600 text-white"
          onClick={() => setAddingNewRecord(false)}
        >
          Cancel
        </button>
        <button
          className="px-2 py-1 rounded-none bg-green-600 text-white"
          onClick={() => {
            if (!newRecord.subject || !newRecord.level) {
              alert("Please fill subject and level before adding")
              return
            }
            setData([...data, newRecord])
            setAddingNewRecord(false)
          }}
        >
          Add
        </button>
      </div>
    </div>
  )

  return (
    <div className="pb-2 border-b border-gray-300 mt-5">
      <div className="text-left text-xl font-bold mb-5">
        Your IBDP Subjects
      </div>

      {data.length !== 0 ? (
        renderIBDPSubjects()
      ) : (
        <div className="mb-2">No IBDP Subjects</div>
      )}

      {addingNewRecord ? (
        renderNewRecordInputs()
      ) : (
        <button
          className="px-2 py-1 rounded-none border"
          onClick={() => {
            const newId = Math.floor(1000000000 + Math.random() * 9000000000)
            setNewRecord({
              id: newId,
              subject: "",
              score: "",
              level: "",
            })
            setAddingNewRecord(true)
          }}
        >
          Add New Subject
        </button>
      )}
    </div>
  )
}

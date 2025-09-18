"use client"

import React, { useState } from "react"
import Button from "@mui/material/Button"
import Divider from "@mui/material/Divider"
import TextField from "@mui/material/TextField"
import CustomModal from "../../../../../../Components/CustomModal/CustomModal.js" // adjust path

export function EditProfileYourIBDPSubjects({ data = [], setData }) {
  const [newRecord, setNewRecord] = useState({
    id: null,
    subject: "",
    score: "",
    level: "",
  })
  const [addingNewRecord, setAddingNewRecord] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleInputChange = (field, value) => {
    setNewRecord({ ...newRecord, [field]: value })
  }

  const handleModalSubmit = () => {
    if (!newRecord.subject || !newRecord.level) {
      alert("Please fill subject and level before adding")
      return
    }
    setLoading(true)
    setTimeout(() => {
      const newId = Math.floor(1000000000 + Math.random() * 9000000000)
      setData([...data, { ...newRecord, id: newId }])
      setNewRecord({
        id: null,
        subject: "",
        score: "",
        level: "",
      })
      setAddingNewRecord(false)
      setLoading(false)
    }, 500)
  }

  const renderIBDPSubjects = () =>
    data.map((record) => (
      <div
        key={record.id}
        className="mb-3 border-b border-gray-200 pb-9 last:border-b-0 last:pb-0"
      >
        <div className="grid grid-cols-2 gap-6">
          <div>
            <div className="text-xs text-[#A2A1A8] font-light">Subject</div>
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
              className="w-full border-b p-1"
            />
          </div>

          <div>
            <div className="text-xs text-[#A2A1A8] font-light">Score</div>
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
              className="w-full border-b p-1"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mt-3">
          <div>
            <div className="text-xs text-[#A2A1A8] font-light">Level</div>
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
              className="w-full border-b p-1"
            />
          </div>
        </div>
      </div>
    ))

  return (
    <div className="pb-2.5 border-b border-gray-300">
      {/* Header row */}
      <div className="flex justify-between items-start">
        <div className="w-full text-left text-xl font-bold mb-3">
          Your IBDP Subjects
          <div className="mt-4">
            {renderIBDPSubjects()}
            {data.length === 0 && !addingNewRecord && (
              <div className="text-[#A2A1A8] text-lg mb-3">No IBDP Subjects</div>
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

      {/* Modal for Adding New Subject */}
      <CustomModal
        open={addingNewRecord}
        onClose={() => setAddingNewRecord(false)}
        PaperProps={{
          sx: {
            width: "90vw",
            maxWidth: "740px",
            height: "auto",
            maxHeight: "90vh",
            overflow: "auto",
            borderRadius: "16px",
          },
        }}
      >
        <h2 className="text-xl font-semibold text-start text-[#16151C] mb-7">
          Your IBDP Subject
        </h2>

        <Divider sx={{ borderColor: "#E5E7EB", mb: 5 }} />

        {/* Fields stacked vertically */}
        <p className="text-sm text-[#6B7280] mb-1">Subject</p>
        <TextField
          type="text"
          value={newRecord.subject}
          onChange={(e) => handleInputChange("subject", e.target.value)}
          placeholder="Enter details"
          fullWidth
          sx={{
            mb: 4,
            "& .MuiInputBase-input::placeholder": {
              color: "black",
              opacity: 1, // make sure it's fully visible
            },
            "& .MuiInputBase-input:focus::placeholder": {
              color: "grey", // switch to grey when focused
            },
          }}
        />
        <p className="text-sm text-[#6B7280] mb-1">Score</p>
        <TextField
          type="text"
          value={newRecord.score}
          onChange={(e) => handleInputChange("score", e.target.value)}
          placeholder="Enter details"
          fullWidth
          sx={{
            mb: 4,
            "& .MuiInputBase-input::placeholder": {
              color: "black",
              opacity: 1, // make sure it's fully visible
            },
            "& .MuiInputBase-input:focus::placeholder": {
              color: "grey", // switch to grey when focused
            },
          }}
        />
        <p className="text-sm text-[#6B7280] mb-1">Level</p>
        <TextField
          type="text"
          value={newRecord.level}
          onChange={(e) => handleInputChange("level", e.target.value)}
          placeholder="Enter details"
          fullWidth
          sx={{
            mb: 4,
            "& .MuiInputBase-input::placeholder": {
              color: "black",
              opacity: 1, // make sure it's fully visible
            },
            "& .MuiInputBase-input:focus::placeholder": {
              color: "grey", // switch to grey when focused
            },
          }}
        />

        {/* Buttons */}
        <div className="flex gap-3 justify-end mt-6">
          <Button
            onClick={() => setAddingNewRecord(false)}
            variant="outlined"
            sx={{
              width: 166,
              height: 50,
              borderRadius: "10px",
              borderColor: "#A2A1A833",
              fontSize: "16px",
              fontWeight: 300,
              color: "#16151C",
            }}
          >
            Cancel
          </Button>
          <Button
            disabled={loading}
            variant="contained"
            sx={{
              width: 166,
              height: 50,
              borderRadius: "10px",
              backgroundColor: "#4071B6",
              fontSize: "20px",
              fontWeight: 300,
              color: "#FFFFFF",
            }}
            onClick={handleModalSubmit}
          >
            {loading ? "Submitting" : "Add"}
          </Button>
        </div>
      </CustomModal>
    </div>
  )
}

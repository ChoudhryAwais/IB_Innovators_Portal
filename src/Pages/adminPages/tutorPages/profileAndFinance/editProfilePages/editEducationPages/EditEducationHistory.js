"use client"

import React, { useState } from "react"
import Button from "@mui/material/Button"
import Divider from "@mui/material/Divider"
import TextField from "@mui/material/TextField"
import CustomModal from "../../../../../../Components/CustomModal/CustomModal.js" // make sure this path is correct

export function EditEducationHistory({ data, setData }) {
  const [addingNewRecord, setAddingNewRecord] = useState(false)
  const [loading, setLoading] = useState(false)

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

  const handleModalSubmit = () => {
    setLoading(true)
    setTimeout(() => {
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
      setLoading(false)
    }, 500)
  }

  const renderEducationRecords = () => {
    return data.map((record) => (
      <div
        key={record.id}
        className="mb-3 border-b border-gray-200 pb-9 last:border-b-0 last:pb-0"
      >
        <div className="grid grid-cols-2 gap-6">
          <div>
            <div className="text-xs text-[#A2A1A8] font-light">Qualification Title</div>
            <input
              type="text"
              value={record.qualificationTitle}
              onChange={(e) =>
                setData(
                  data.map((r) =>
                    r.id === record.id
                      ? { ...r, qualificationTitle: e.target.value }
                      : r
                  )
                )
              }
              className="w-full border-b p-1"
            />
          </div>
          <div>
            <div className="text-xs text-[#A2A1A8] font-light">Year of Graduation</div>
            <input
              type="text"
              value={record.yearOfGraduation}
              onChange={(e) =>
                setData(
                  data.map((r) =>
                    r.id === record.id
                      ? { ...r, yearOfGraduation: e.target.value }
                      : r
                  )
                )
              }
              className="w-full border-b p-1"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mt-3">
          <div>
            <div className="text-xs text-[#A2A1A8] font-light">University</div>
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
              className="w-full border-b p-1"
            />
          </div>
          <div>
            <div className="text-xs text-[#A2A1A8] font-light">
              Grade (Or in progress)
            </div>
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
              className="w-full border-b p-1"
            />
          </div>
        </div>
      </div>
    ))
  }

  return (
    <div>
      {/* Header row */}
      <div className="flex justify-between items-start border-b border-gray-300 pb-7 mb-3">
        <div className="w-full text-left text-xl font-bold ">
          Education History
          <div className="mt-4">
            {data.length !== 0 && renderEducationRecords()}
            {data.length === 0 && !addingNewRecord && (
              <div className="text-gray-500 mb-4 text-lg">
                No Educational History
              </div>
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

      {/* Modal for Adding New Record */}
      <CustomModal open={addingNewRecord} onClose={() => setAddingNewRecord(false)}
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
          Education History
        </h2>

        <Divider sx={{ borderColor: "#E5E7EB", mb: 5 }} />

        {/* Fields stacked vertically */}
        <p className="text-sm text-[#6B7280] mb-1">Qualification Title</p>

        <TextField
          type="text"
          value={newRecord.qualificationTitle}
          onChange={(e) => handleInputChange("qualificationTitle", e.target.value)}
          fullWidth
          placeholder="Enter details"
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
        <p className="text-sm text-[#6B7280] mb-1">Year of Graduation</p>

        <TextField
          type="text"
          value={newRecord.yearOfGraduation}
          onChange={(e) => handleInputChange("yearOfGraduation", e.target.value)}
          fullWidth
          placeholder="Enter details"
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
        <p className="text-sm text-[#6B7280] mb-1">University</p>

        <TextField
          type="text"
          value={newRecord.university}
          onChange={(e) => handleInputChange("university", e.target.value)}
          fullWidth
          placeholder="Enter details"
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
        <p className="text-sm text-[#6B7280] mb-1">Grade (Or in progress)</p>

        <TextField
          type="text"
          value={newRecord.grade}
          onChange={(e) => handleInputChange("grade", e.target.value)}
          fullWidth
          placeholder="Enter details"
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

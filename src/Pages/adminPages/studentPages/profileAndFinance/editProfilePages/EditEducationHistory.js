"use client"

import React, { useState } from "react"
import Button from "@mui/material/Button"
import Divider from "@mui/material/Divider"
import TextField from "@mui/material/TextField"
import CustomModal from "../../../../../Components/CustomModal/CustomModal.js"

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

  // Handle new record field updates
  const handleInputChange = (field, value) => {
    setNewRecord({ ...newRecord, [field]: value })
  }

  // Handle submit new record
  const handleModalSubmit = () => {
    setLoading(true)
    setTimeout(() => {
      const newId = Math.floor(1000000000 + Math.random() * 9000000000) // ✅ random id
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
    }, 400)
  }

  // Render existing education records (editable inline)
  const renderEducationRecords = () => {
    return data.map((record) => (
      <div
        key={record.id}
        className="mb-3 border-b border-gray-200 pb-6 last:border-b-0 last:pb-0"
      >
        <div className="grid grid-cols-2 gap-6">
          <div>
            <div className="text-xs text-gray-500">Qualification Title</div>
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
            <div className="text-xs text-gray-500">Year of Graduation</div>
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
            <div className="text-xs text-gray-500">University</div>
            <input
              type="text"
              value={record.university}
              onChange={(e) =>
                setData(
                  data.map((r) =>
                    r.id === record.id
                      ? { ...r, university: e.target.value }
                      : r
                  )
                )
              }
              className="w-full border-b p-1"
            />
          </div>
          <div>
            <div className="text-xs text-gray-500">Grade (Or in progress)</div>
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
      {/* Header */}
      <div className="flex justify-between items-start border-b border-gray-300 pb-6 mb-4">
        <h2 className="text-xl font-bold text-gray-800">Education History</h2>
        {!addingNewRecord && (
          <Button
            variant="outlined"
            onClick={() => setAddingNewRecord(true)}
            sx={{
              borderRadius: "8px",
              width: "180px",
              height: "40px",
              color: "#4071B6",
              backgroundColor: "#4071B60D",
              borderColor: "#4071B6",
              fontSize: "16px",
              padding: 0,
              fontWeight: 600,
              textTransform: "none",
            }}
          >
           + Add New Record
          </Button>
        )}
      </div>

      {/* Records */}
      <div className="mt-2">
        {data.length > 0 && renderEducationRecords()}
        {data.length === 0 && !addingNewRecord && (
          <p className="text-gray-500">No Educational History</p>
        )}
      </div>

      {/* Add New Record Modal */}
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
            borderRadius: "20px",
            padding: 0,
          },
        }}
      >
        <div className="h-full overflow-auto p-6" // ✅ scrollbar inside modal
          style={{
            boxSizing: "border-box",
          }}
        >
          <h3 className="text-xl font-semibold text-gray-900 mb-5">
            Add Education Record
          </h3>
          <Divider sx={{ borderColor: "#E5E7EB", mb: 5 }} />

          {/* Qualification Title */}
          <p className="text-sm text-gray-600 mb-1">Qualification Title</p>
          <TextField
            fullWidth
            value={newRecord.qualificationTitle}
            onChange={(e) => handleInputChange("qualificationTitle", e.target.value)}
            placeholder="Enter details"
            sx={{ mb: 4 }}
          />

          {/* Year of Graduation */}
          <p className="text-sm text-gray-600 mb-1">Year of Graduation</p>
          <TextField
            fullWidth
            value={newRecord.yearOfGraduation}
            onChange={(e) => handleInputChange("yearOfGraduation", e.target.value)}
            placeholder="Enter details"
            sx={{ mb: 4 }}
          />

          {/* University */}
          <p className="text-sm text-gray-600 mb-1">University</p>
          <TextField
            fullWidth
            value={newRecord.university}
            onChange={(e) => handleInputChange("university", e.target.value)}
            placeholder="Enter details"
            sx={{ mb: 4 }}
          />

          {/* Grade */}
          <p className="text-sm text-gray-600 mb-1">Grade (Or in progress)</p>
          <TextField
            fullWidth
            value={newRecord.grade}
            onChange={(e) => handleInputChange("grade", e.target.value)}
            placeholder="Enter details"
            sx={{ mb: 4 }}
          />

          {/* Buttons */}
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outlined" onClick={() => setAddingNewRecord(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleModalSubmit}
              disabled={loading}
              variant="contained"
              sx={{ backgroundColor: "#4071B6" }}
            >
              {loading ? "Submitting..." : "Add"}
            </Button>
          </div>
        </div>
      </CustomModal>
    </div>
  )
}

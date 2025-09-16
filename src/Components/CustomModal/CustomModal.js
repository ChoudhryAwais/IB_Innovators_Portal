import React from "react"
import { Dialog } from "@mui/material"

export default function CustomModal({
  open,
  onClose,
  children,
  PaperProps = {},
  slotProps = {},
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        className: "bg-white shadow-xl p-6 mx-4",
        sx: {
          borderRadius: "24px",
          width: 382, // default width
          height: 318, // default height
          ...PaperProps.sx, // allow override
        },
        ...PaperProps, // allow full override
      }}
      slotProps={{
        backdrop: {
          sx: {
            bgcolor: "#16151C33",
            backdropFilter: "blur(8px)",
          },
          ...slotProps.backdrop,
        },
        ...slotProps,
      }}
    >
      {children}
    </Dialog>
  )
}

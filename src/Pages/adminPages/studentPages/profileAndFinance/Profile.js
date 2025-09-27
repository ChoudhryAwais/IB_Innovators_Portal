"use client"

import { useState } from "react"
import Tabs from "@mui/material/Tabs"
import Tab from "@mui/material/Tab"
import Box from "@mui/material/Box"

import { ContactInformation } from "./ContactInformation"
import { Education } from "./Education"
import { GuardianInformation } from "./GuardianInformation"

export function Profile({ userDetails, userId }) {
  const [curr, setCurr] = useState("Contact Information")

  const handleChange = (event, newValue) => {
    setCurr(newValue)
  }

  return (
    <div className="h-full">
      {/* Tabs header */}
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={curr}
          onChange={handleChange}
          textColor="primary"
          indicatorColor="primary"
          sx={{
            "& .MuiTab-root": {
              fontSize: "0.875rem",
              fontWeight: 500,
              textTransform: "none",
              padding: "12px 24px",
              borderBottom: "2px solid transparent",
              transition: "all 0.2s",
              "&:hover": {
                color: "text.primary",
                borderBottom: "2px solid",
                borderColor: "grey.300",
              },
            },
            "& .Mui-selected": {
              color: "primary.main",
              borderBottom: "2px solid",
              borderColor: "primary.main",
            },
          }}
        >
          <Tab label="Contact Information" value="Contact Information" />
          <Tab label="Parent/Guardian Information" value="Guardian Information" />
          <Tab label="Education" value="Education" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      <div className="p-6">
        {curr === "Contact Information" && (
          <ContactInformation userDetails={userDetails} userId={userId} />
        )}
        {curr === "Education" && (
          <Education userDetails={userDetails} userId={userId} />
        )}
        {curr === "Guardian Information" && (
          <GuardianInformation userDetails={userDetails} userId={userId} />
        )}
      </div>
    </div>
  )
}

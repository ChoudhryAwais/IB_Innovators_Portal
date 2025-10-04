"use client"

import { useState } from "react"

import { ContactInformation } from "./ContactInformation"
import { Education } from "./Education"
import { YourSupport } from "./YourSupport"
import { RevisionCourses } from "./RevisionCourses"
import Tabs from "@mui/material/Tabs"
import Tab from "@mui/material/Tab"
import Box from "@mui/material/Box"
import { useTheme, useMediaQuery } from "@mui/material"

export function Profile({ userDetails, userId }) {
  const [curr, setCurr] = useState("Personal Information")
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const handleChange = (event, newValue) => {
    setCurr(newValue)
  }

  // Define your tabs with active/inactive icons
  const tabConfig = [
    {
      value: "Personal Information",
      label: isMobile ? "Personal" : "Personal Information",
      inactiveIcon: (
        <svg className="w-4 h-4 md:w-6 md:h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="12" cy="17.5" rx="7" ry="3.5" stroke="#16151C" strokeWidth="1.5" strokeLinejoin="round" />
          <circle cx="12" cy="7" r="4" stroke="#16151C" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      ),
      activeIcon: (
        <svg className="w-3 h-4 md:w-[14px] md:h-[18px]" viewBox="0 0 14 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" clipRule="evenodd" d="M7 8C9.20914 8 11 6.20914 11 4C11 1.79086 9.20914 0 7 0C4.79086 0 3 1.79086 3 4C3 6.20914 4.79086 8 7 8ZM7 18C10.866 18 14 16.2091 14 14C14 11.7909 10.866 10 7 10C3.13401 10 0 11.7909 0 14C0 16.2091 3.13401 18 7 18Z" fill="#4071B6" />
        </svg>
      ),
    },
    {
      value: "Education",
      label: "Education",
      inactiveIcon: (
        <svg className="w-4 h-4 md:w-6 md:h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M11 2.125H13C14.7949 2.125 16.25 3.58007 16.25 5.375V6.375C16.25 6.51307 16.1381 6.625 16 6.625C15.8619 6.625 15.75 6.51307 15.75 6.375V5.375C15.75 3.85622 14.5188 2.625 13 2.625H11C9.48122 2.625 8.25 3.85622 8.25 5.375V6.375C8.25 6.51307 8.13807 6.625 8 6.625C7.86193 6.625 7.75 6.51307 7.75 6.375V5.375C7.75 3.58007 9.20507 2.125 11 2.125Z" stroke="#16151C" strokeLinecap="round" />
          <path d="M2.5 12.7139C3.83758 13.3527 6.26401 14.2167 10.0029 14.5322C10.0357 15.6081 10.9162 16.4707 12 16.4707C13.0451 16.4707 13.9009 15.6685 13.9902 14.6465C17.7159 14.445 20.1498 13.515 21.5 12.8008V18.375C21.5 20.308 19.933 21.875 18 21.875H6C4.067 21.875 2.5 20.308 2.5 18.375V12.7139ZM6 6.875H18C19.8575 6.875 21.3754 8.32211 21.4912 10.1504C21.4298 10.1989 21.3513 10.2602 21.2529 10.3291C20.9633 10.5319 20.5093 10.8117 19.8721 11.1016C18.6312 11.6659 16.6857 12.2699 13.8877 12.4131C13.6156 11.6317 12.8745 11.0703 12 11.0703C11.1533 11.0703 10.4318 11.5966 10.1396 12.3389C7.32346 12.1003 5.36522 11.5099 4.11523 10.9824C3.47392 10.7117 3.01779 10.4572 2.72656 10.2744C2.63912 10.2195 2.56806 10.1684 2.50977 10.1279C2.63657 8.31026 4.1501 6.875 6 6.875Z" stroke="#16151C" strokeLinecap="round" />
          <rect x="11.25" y="12.375" width="1.5" height="2.79403" rx="0.75" fill="#16151C" />
        </svg>
      ),
      activeIcon: (
        <svg className="w-4 h-4 md:w-6 md:h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" clipRule="evenodd" d="M11 3.125C9.75736 3.125 8.75 4.13236 8.75 5.375V6.375C8.75 6.78921 8.41421 7.125 8 7.125C7.58579 7.125 7.25 6.78921 7.25 6.375V5.375C7.25 3.30393 8.92893 1.625 11 1.625H13C15.0711 1.625 16.75 3.30393 16.75 5.375V6.375C16.75 6.78921 16.4142 7.125 16 7.125C15.5858 7.125 15.25 6.78921 15.25 6.375V5.375C15.25 4.13236 14.2426 3.125 13 3.125H11Z" fill="#4071B6" />
          <path d="M6 6.375H18C20.2091 6.375 22 8.16586 22 10.375C22 10.375 19.648 12.6767 13.6848 12.925C13.5789 12.9294 13.4876 12.8491 13.4647 12.7456C13.3164 12.0733 12.7169 11.5703 12 11.5703C11.3044 11.5703 10.7194 12.0438 10.5497 12.6861C10.5227 12.7882 10.4288 12.8645 10.3235 12.8564C4.34828 12.3973 2 10.375 2 10.375C2 8.16586 3.79086 6.375 6 6.375Z" fill="#4071B6" />
          <path d="M10.5 14.2583C10.5 14.1532 10.4173 14.0661 10.3126 14.0581C5.6231 13.7023 3.00088 12.4687 2 11.8876V18.375C2 20.5842 3.79086 22.375 6 22.375H18C20.2091 22.375 22 20.5842 22 18.375V11.9294C20.9969 12.5867 18.3689 13.9605 13.6942 14.1644C13.5867 14.1691 13.5 14.2574 13.5 14.3651V14.4703C13.5 15.2987 12.8284 15.9703 12 15.9703C11.1716 15.9703 10.5 15.2987 10.5 14.4703V14.2583Z" fill="#4071B6" />
          <rect x="11.25" y="12.375" width="1.5" height="2.79403" rx="0.75" fill="#4071B6" />
        </svg>
      ),
    },
    {
      value: "Your Support",
      label: isMobile ? "Support" : "Your Support",
      inactiveIcon: (
        <svg className="w-4 h-4 md:w-6 md:h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 6C4 3.79086 5.79086 2 8 2H15.3431C16.404 2 17.4214 2.42143 18.1716 3.17157L20.8284 5.82843C21.5786 6.57857 22 7.59599 22 8.65685V18C22 20.2091 20.2091 22 18 22H8C5.79086 22 4 20.2091 4 18V6Z" stroke="#16151C" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M9 7L17 7" stroke="#16151C" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M9 12H17" stroke="#16151C" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M9 17H13" stroke="#16151C" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
      activeIcon: (
        <svg className="w-4 h-4 md:w-6 md:h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 6C4 3.79086 5.79086 2 8 2H15.3431C16.404 2 17.4214 2.42143 18.1716 3.17157L20.8284 5.82843C21.5786 6.57857 22 7.59599 22 8.65685V18C22 20.2091 20.2091 22 18 22H8C5.79086 22 4 20.2091 4 18V6Z" fill="#4071B6" stroke="#4071B6" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M9 7L17 7" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M9 12H17" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M9 17H13" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      value: "Revision Course",
      label: isMobile ? "Revision" : "Revision Course",
      inactiveIcon: (
        <svg className="w-4 h-4 md:w-6 md:h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 6C4 3.79086 5.79086 2 8 2H15.3431C16.404 2 17.4214 2.42143 18.1716 3.17157L20.8284 5.82843C21.5786 6.57857 22 7.59599 22 8.65685V18C22 20.2091 20.2091 22 18 22H8C5.79086 22 4 20.2091 4 18V6Z" stroke="#16151C" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M9 7L17 7" stroke="#16151C" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M9 12H17" stroke="#16151C" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M9 17H13" stroke="#16151C" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
      activeIcon: (
        <svg className="w-4 h-4 md:w-6 md:h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 6C4 3.79086 5.79086 2 8 2H15.3431C16.404 2 17.4214 2.42143 18.1716 3.17157L20.8284 5.82843C21.5786 6.57857 22 7.59599 22 8.65685V18C22 20.2091 20.2091 22 18 22H8C5.79086 22 4 20.2091 4 18V6Z" fill="#4071B6" stroke="#4071B6" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M9 7L17 7" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M9 12H17" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M9 17H13" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
    },
  ]

  return (
    <div className="h-full">
      {/* Tabs header */}
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={curr}
          onChange={handleChange}
          variant={isMobile ? "scrollable" : "standard"}
          scrollButtons={isMobile ? "auto" : false}
          allowScrollButtonsMobile
          sx={{
            "& .MuiTab-root": {
              fontSize: { xs: "14px", md: "16px" },
              fontWeight: 300,
              textTransform: "none",
              padding: { xs: "8px 6px", md: "12px 10px" },
              minWidth: { xs: "auto", md: "160px" },
              minHeight: { xs: "48px", md: "auto" },
              borderBottom: "2px solid transparent",
              transition: "all 0.2s",
              color: "#16151C",
              "&:hover": {
                borderBottom: "2px solid",
                borderColor: "grey.300",
              },
            },
            "& .Mui-selected": {
              color: "#4071B6",
              borderBottom: "2px solid",
              borderColor: "#4071B6",
              fontWeight: 600,
            },
            "& .MuiTabs-scrollButtons": {
              color: "#16151C",
              "&.Mui-disabled": {
                opacity: 0.3,
              },
            },
            "& .MuiTabs-indicator": {
              backgroundColor: "#4071B6",
            },
          }}
        >
          {tabConfig.map((tab) => (
            <Tab
              key={tab.value}
              value={tab.value}
              label={
                <div className="flex items-center gap-1 md:gap-2">
                  {curr === tab.value ? tab.activeIcon : tab.inactiveIcon}
                  <span className="whitespace-nowrap">{tab.label}</span>
                </div>
              }
            />
          ))}
        </Tabs>
      </Box>

      {/* Tab Content */}
      <div className="p-4 md:p-6">
        {curr === "Personal Information" && (
          <ContactInformation userDetails={userDetails} userId={userId} />
        )}
        {curr === "Education" && (
          <Education userDetails={userDetails} userId={userId} />
        )}
        {curr === "Your Support" && (
          <YourSupport userDetails={userDetails} userId={userId} />
        )}
        {curr === "Revision Course" && (
          <RevisionCourses userDetails={userDetails} userId={userId} />
        )}
      </div>
    </div>
  )
}
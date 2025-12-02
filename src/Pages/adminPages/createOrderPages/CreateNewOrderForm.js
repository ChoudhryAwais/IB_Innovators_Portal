"use client"

import { useState, useContext, useEffect } from "react"
import { MyContext } from "../../../Context/MyContext"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faGraduationCap } from "@fortawesome/free-solid-svg-icons"

import { collection, addDoc, doc, updateDoc, query, where, getDocs } from "firebase/firestore"
import { db } from "../../../firebase"
import emailjs from "emailjs-com"
import toast from "react-hot-toast"

import { Autocomplete, Box, MenuItem, Select, TextField, FormControl, Button } from "@mui/material"
import getCourseRequestedEmailTemplate from "../../../Components/getEmailTemplate/getCourseRequestedEmailTemplate"
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { InputAdornment } from "@mui/material";
import { faUser } from "@fortawesome/free-solid-svg-icons"

export function CreateNewOrderForm({ item, handleClose }) {
  const { userDetails, subjectsArray } = useContext(MyContext)

  const [slotRequired, setSlotRequired] = useState([])
  const [subject, setSubject] = useState("")
  const [tutorTier, setTutorTier] = useState("")
  const [yearOfGraduation, setYearOfGraduation] = useState("")
  const [timeZone, setTimeZone] = useState("GMT")
  const [requestedHours, setRequestedHours] = useState("")
  const [gradePredicted, setGradePredicted] = useState("")
  const [gradeAimed, setGradeAimed] = useState("")
  const [startDate, setStartDate] = useState("Immediately")
  const [country, setCountry] = useState("")
  const [countryObject, setCountryObject] = useState(null)
  const [gmt, setGmt] = useState("")
  const [session, setSession] = useState("")

  const [startDateType, setStartDateType] = useState("")
  const [customStartDate, setCustomStartDate] = useState("")

  const [tutorHourlyRate, setTutorHourlyRate] = useState(null)
  const [price, setPrice] = useState(null)

  const [submitting, setSubmitting] = useState(false)

  const [graduationYears, setGraduationYears] = useState([]);

  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth(); // 0 = Jan, 4 = May, 10 = Nov

    let startYear = currentYear;

    if (session === "May Session") {
      // If current month is after May (i.e. > 4), start from next year
      startYear = currentMonth > 4 ? currentYear + 1 : currentYear;
    } else if (session === "November Session") {
      // If current month is after November (i.e. > 10), start from next year
      startYear = currentMonth > 10 ? currentYear + 1 : currentYear;
    }

    // Generate up to 10 years or however long you want
    const years = Array.from({ length: 11 }, (_, i) => (startYear + i).toString());
    setGraduationYears(years);
  }, [session]);

  const handleStartDateTypeChange = (e) => {
    setStartDateType(e.target.value)

    if (e.target.value !== "Other") {
      setStartDate("Immediately")
    } else if (e.target.value !== "Other") {
      setCustomStartDate("")
      setStartDate("")
    }
  }

  const handleCustomStartDateChange = (e) => {
    setCustomStartDate(e.target.value)
    setStartDate(e.target.value)
  }

  const handleSlotClick = (day, time) => {
    const slot = `${day}-${time}`
    setSlotRequired((prevSelectedSlots) =>
      prevSelectedSlots.includes(slot) ? prevSelectedSlots.filter((s) => s !== slot) : [...prevSelectedSlots, slot],
    )
  }

  const isSelected = (day, time) => slotRequired.includes(`${day}-${time}`)

  const timePeriods = ["Before 12PM", "12PM - 3PM", "3PM - 6PM", "After 6PM"]
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

  async function submittingForm() {
    if (
      slotRequired?.length === 0 ||
      subject === "" ||
      yearOfGraduation === "" ||
      timeZone === "" ||
      requestedHours === "" ||
      startDate === "" ||
      !tutorHourlyRate ||
      tutorHourlyRate <= 0 ||
      country === "" ||
      !price ||
      price <= 0 ||
      gmt === "" ||
      session === ""
    ) {
      toast.error("Please Fill All Details")
      return
    }

    try {
      setSubmitting(true)
      const details = {
        subject,
        studentName: item?.userName,
        country: country,
        credits: item?.credits || 0,
        yearOfGraduation,
        timeZone,
        slotRequired,
        requestedHours,
        startDate,
        studentInformation: item,
        gmt,
        session,
        tutorHourlyRate,
        price,
        createdOn: new Date(),
      }

      const userListRef = collection(db, "orders")
      const docRef = await addDoc(userListRef, details)
      const docId = docRef.id
      await updateDoc(doc(db, "orders", docId), { id: docId })
      console.log("Form submitted successfully!");

      handleClose(false)

      const checkTeacherEligibility = (teacher) => {
        const filteredSubjects = Object.entries(teacher.subjects)
          .filter(([_, value]) => value === true)
          .map(([subject]) => subject)
        return filteredSubjects.includes(subject)
      }

      const userListRefSecond = collection(db, "userList")
      const q = query(userListRefSecond, where("type", "==", "teacher"))

      const querySnapshot = await getDocs(q)
      const teachersData = querySnapshot.docs.map((doc) => doc.data())
      const eligibleTeacherEmails = teachersData
        .filter((teacher) => checkTeacherEligibility(teacher, subject))
        .map(({ email, userId }) => ({ email, userId }))

      const serviceId = process.env.REACT_APP_EMAILSERVICEID;
      const templateId = process.env.REACT_APP_EMAILTEMPLATEID;
      const userId = process.env.REACT_APP_EMAILUSERID;

      eligibleTeacherEmails.forEach((e) => {
        const emailTemplate = getCourseRequestedEmailTemplate(
          item?.userName,
          subject,
          yearOfGraduation,
          country,
          startDate,
          `https://portal.ibinnovators.com/jobOpenings/${docId}?gimeg02j0i3jrg03i43g0n=${e?.userId}`,
        )

        const emailParams = {
          from_name: "IBInnovators",
          to_name: "",
          send_to: e.email,
          subject: `New Job Available for ${subject}`,
          message: emailTemplate,
        }

        emailjs
          .send(serviceId, templateId, emailParams, userId)
          .then((response) => console.log("Email sent successfully"))
          .catch((error) => console.error("Error sending email:", error))
      })

      toast.success("Job created successfully")
    } catch (error) {
      console.error("Error submitting form:", error)
      toast.error("Error Submitting Form")
    } finally {
      setSubmitting(false)
    }
  }

  //added to bypass price problem
  useEffect(() => {
    if (tutorHourlyRate && requestedHours) {
      setPrice(Number(tutorHourlyRate) * Number(requestedHours))
    } else {
      setPrice(null)
    }
  }, [tutorHourlyRate, requestedHours])

  return (
    <div className="w-full md:w-4xl mx-auto h-full overflow-auto p-4 md:p-6"
      style={{
        boxSizing: "border-box",
      }}
    >
      <div className="">
        <h1 className="text-[18px] md:text-[20px] font-semibold text-[#16151C] mb-4">Create Job</h1>

        {/* Student Info Section */}
        <div className="flex flex-col sm:flex-row items-start gap-4 mb-6">
          {/* Image */}
          <div className="w-10 h-10 sm:w-14 sm:h-14 bg-[#4071B6] rounded-[4px] flex items-center justify-center mb-2 sm:mb-0 overflow-hidden">
            {item?.image ? (
              <img
                src={item.image}
                alt={item?.userName || "Student"}
                className="w-full h-full object-cover"
              />
            ) : (
              <FontAwesomeIcon
                className="text-white text-base sm:text-lg"
                icon={faUser}
              />
            )}
          </div>

          {/* Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 w-full sm:w-auto">
            <div className="font-light text-[14px] text-[#16151C]">Student Name:</div>
            <div className="font-medium text-[14px] text-[#16151C] mb-2 sm:mb-0">{item?.userName}</div>

            <div className="font-light text-[14px] text-[#16151C]">Email:</div>
            <div className="font-medium text-[14px] text-[#16151C]">{item?.email}</div>
          </div>
        </div>
      </div>

      <div className="mb-8">
        {/* Heading + Legends */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4 gap-4">
          <h2 className="text-[18px] md:text-[20px] font-semibold text-[#16151C]">Select your Timing Slots</h2>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#57AD85] rounded-full"></div>
              <span className="text-[14px] sm:text-[16px] font-light text-[#16151C]">Selected by Tutor</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#F49342] rounded-full"></div>
              <span className="text-[14px] sm:text-[16px] font-light text-[#16151C]">Selected by Student</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#00C8FF] rounded-full"></div>
              <span className="text-[14px] sm:text-[16px] font-light text-[#16151C]">Both selected same slot</span>
            </div>
          </div>
        </div>

        {/* Time Slots Grid */}
        <div className="rounded-[10px] overflow-hidden bg-[#A2A1A80D]">
          {/* Header */}
          <div className="hidden md:grid grid-cols-8">
            <div className="p-3 font-semibold text-[14px] text-[#16151C]">Time & Day</div>
            {days.map((day) => (
              <div
                key={day}
                className="p-3 font-semibold text-[14px] text-[#16151C] text-center"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Mobile header (scrollable) */}
          <div className="md:hidden overflow-x-auto">
            <table className="min-w-full text-left">
              <thead>
                <tr>
                  <th className="p-3 font-semibold text-[14px] text-[#16151C]">Time & Day</th>
                  {days.map((day) => (
                    <th
                      key={day}
                      className="p-3 font-semibold text-[14px] text-[#16151C] text-center"
                    >
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timePeriods.map((time) => (
                  <tr key={time}>
                    <td className="p-3 text-[#16151C] font-light text-[14px] text-left whitespace-nowrap">
                      {time.replace("PM", " pm").replace("AM", " am")}
                    </td>
                    {days.map((day) => (
                      <td key={day} className="p-2 text-center">
                        <div
                          onClick={() => handleSlotClick(day, time)}
                          className={`w-[20px] h-[20px] border-1 border-[#16151C] rounded-[4px] cursor-pointer transition-all duration-200 
                            ${isSelected(day, time)
                              ? "bg-[#F49342]"
                              : "bg-white hover:border-gray-400"
                            }`}
                        >
                          {isSelected(day, time) && (
                            <div className="w-full h-full flex items-center justify-center">
                              <svg
                                className="w-6 h-6"
                                viewBox="0 0 20 20"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  fillRule="evenodd"
                                  clipRule="evenodd"
                                  d="M14.592 7.46049C14.8463 7.13353 14.7874 6.66232 14.4605 6.40802C14.1335 6.15372 13.6623 6.21262 13.408 6.53958L9.40099 11.6914C9.31189 11.806 9.14429 11.8209 9.03641 11.7238L6.50173 9.44256C6.19385 9.16547 5.71963 9.19043 5.44254 9.49831C5.16544 9.80619 5.1904 10.2804 5.49828 10.5575L8.03296 12.8387C8.78809 13.5183 9.9613 13.4143 10.585 12.6123L14.592 7.46049Z"
                                  fill="white"
                                />
                              </svg>
                            </div>
                          )}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Desktop grid */}
          <div className="hidden md:block">
            {timePeriods.map((time) => (
              <div key={time} className="grid grid-cols-8">
                <div className="p-3 text-[#16151C] font-light text-[14px] text-left">
                  {time.replace("PM", " pm").replace("AM", " am")}
                </div>
                {days.map((day) => (
                  <div key={day} className="p-2 flex justify-center items-center">
                    <div
                      onClick={() => handleSlotClick(day, time)}
                      className={`w-[20px] h-[20px] border-1 border-[#16151C] rounded-[4px] cursor-pointer transition-all duration-200 ${isSelected(day, time)
                        ? "bg-[#F49342]"
                        : "bg-white hover:border-gray-400"
                        }`}
                    >
                      {isSelected(day, time) && (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg
                            className="w-6 h-6"
                            viewBox="0 0 20 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M14.592 7.46049C14.8463 7.13353 14.7874 6.66232 14.4605 6.40802C14.1335 6.15372 13.6623 6.21262 13.408 6.53958L9.40099 11.6914C9.31189 11.806 9.14429 11.8209 9.03641 11.7238L6.50173 9.44256C6.19385 9.16547 5.71963 9.19043 5.44254 9.49831C5.16544 9.80619 5.1904 10.2804 5.49828 10.5575L8.03296 12.8387C8.78809 13.5183 9.9613 13.4143 10.585 12.6123L14.592 7.46049Z"
                              fill="white"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-[18px] md:text-[20px] font-semibold text-[#16151C] mb-6">Additional Information</h2>

        {/* Row 1: Subject & Tutor Tier */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6">
          <div className="w-full">
            <label className="block text-[12px] font-light text-[#A2A1A8] mb-1">Subject</label>
            <FormControl fullWidth size="small">
              <Select
                value={subject}
                required
                onChange={(e) => setSubject(e.target.value)}
                displayEmpty
                className="bg-white h-14"
                sx={{
                  height: 56,
                  borderRadius: "10px",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#A2A1A833",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#16151C",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#16151C",
                  },
                }}
                IconComponent={KeyboardArrowDownIcon}
              >
                <MenuItem value="" disabled>
                  <span className="text-gray-400">Subject</span>
                </MenuItem>
                {subjectsArray?.map((item) => (
                  <MenuItem key={item} value={item}>
                    {item}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>

          <div className="w-full">
            <label className="block text-[12px] font-light text-[#A2A1A8] mb-1">Tutor Tier</label>
            <FormControl fullWidth size="small">
              <Select
                value={tutorTier}
                onChange={(e) => setTutorTier(e.target.value)}
                displayEmpty
                className="bg-white h-14"
                sx={{
                  height: 56,
                  borderRadius: "10px",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#A2A1A833",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#16151C",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#16151C",
                  },
                }}
                IconComponent={KeyboardArrowDownIcon}
              >
                <MenuItem value="" disabled>
                  <span className="text-gray-400">Tier</span>
                </MenuItem>
                <MenuItem value="Advanced">Advanced Level</MenuItem>
                <MenuItem value="Expert">Expert Level</MenuItem>
              </Select>
            </FormControl>
          </div>
        </div>

        {/* Row 2: Requested Hours, Session, Year of Graduation, Country */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
          <div className="w-full">
            <label className="block text-[12px] font-light text-[#A2A1A8] mb-1">
              Requested Hours
            </label>
            <div className="relative w-full">
              <TextField
                type="number"
                placeholder="Enter hours"
                value={requestedHours}
                onChange={(e) => setRequestedHours(e.target.value)}
                required
                size="small"
                className="h-14 w-full"
                InputProps={{
                  sx: {
                    height: 56,
                    borderRadius: "10px",
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#A2A1A833",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#16151C",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#16151C",
                    },
                  },
                }}
              />
            </div>
          </div>


          <div className="w-full">
            <label className="block text-[12px] font-light text-[#A2A1A8] mb-1">Session</label>
            <FormControl size="small" className="h-14 w-full">
              <Select
                value={session}
                required
                onChange={(e) => {
                  setSession(e.target.value)
                  setYearOfGraduation("") // reset year when session changes
                }}
                displayEmpty
                className="bg-white h-14 w-full"
                sx={{
                  height: 56,
                  borderRadius: "10px",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#A2A1A833",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#16151C",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#16151C",
                  },
                }}
                IconComponent={KeyboardArrowDownIcon}
              >
                <MenuItem value="" disabled>
                  <span className="text-gray-400">Session</span>
                </MenuItem>
                <MenuItem value="May Session">May Session</MenuItem>
                <MenuItem value="November Session">November Session</MenuItem>
              </Select>
            </FormControl>
          </div>

          <div className="w-full">
            <label className="block text-[12px] font-light text-[#A2A1A8] mb-1">Year of Graduation</label>
            <FormControl size="small" className="h-14 w-full">
              <Select
                value={yearOfGraduation}
                required
                onChange={(e) => setYearOfGraduation(e.target.value)}
                displayEmpty
                className="bg-white h-14 w-full"
                sx={{
                  height: 56,
                  borderRadius: "10px",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#A2A1A833",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#16151C",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#16151C",
                  },
                }}
                IconComponent={KeyboardArrowDownIcon}
              >
                <MenuItem value="" disabled>
                  <span className="text-gray-400">Year</span>
                </MenuItem>
                {graduationYears?.map((item) => (
                  <MenuItem key={item} value={item}>
                    {item}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>

          <div className="w-full">
            <label className="block text-[12px] font-light text-[#A2A1A8] mb-1">Country</label>
            <Autocomplete
              id="country-select-demo"
              options={countries}
              value={countryObject}
              onChange={(item, newValue) => {
                setCountry(newValue?.label)
                setCountryObject(newValue)
              }}
              IconComponent={KeyboardArrowDownIcon}
              autoHighlight
              getOptionLabel={(option) => option.label}
              renderOption={(props, option) => (
                <Box component="li" sx={{ "& > img": { mr: 2, flexShrink: 0 } }} {...props}>
                  <img
                    className="w-5 object-contain mr-2"
                    loading="lazy"
                    srcSet={`https://flagcdn.com/w40/${option.code.toLowerCase()}.png 2x`}
                    src={`https://flagcdn.com/w20/${option.code.toLowerCase()}.png`}
                    alt=""
                  />
                  {option.label}
                </Box>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Country"
                  required
                  size="small"
                  className="h-14 w-full"
                  InputProps={{
                    ...params.InputProps,
                    sx: {
                      height: 56,
                      borderRadius: "10px",
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#A2A1A833",
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#16151C",
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#16151C",
                      },
                    },
                    endAdornment: (
                      <InputAdornment position="end" sx={{ marginRight: -4 }}>
                        <KeyboardArrowDownIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </div>
        </div>

        {/* Row 3: Time Zone, Start Date, Other (conditionally), Tutor Hourly Rate */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
          {/* Time Zone */}
          <div className="w-full">
            <label className="block text-[12px] font-light text-[#A2A1A8] mb-1">Time Zone</label>
            <FormControl size="small" className="h-14 w-full">
              <Select
                value={gmt}
                onChange={(e) => setGmt(e.target.value)}
                displayEmpty
                className="bg-white h-14 w-full"
                sx={{
                  height: 56,
                  borderRadius: "10px",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#A2A1A833",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#16151C",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#16151C",
                  },
                }}
                IconComponent={KeyboardArrowDownIcon}
              >
                <MenuItem value="" disabled>
                  <span className="text-gray-400">Time</span>
                </MenuItem>
                {timezones.map((item, index) => (
                  <MenuItem key={index} value={item}>
                    {item}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>

          {/* Start Date */}
          <div className="w-full">
            <label className="block text-[12px] font-light text-[#A2A1A8] mb-1">Start Date</label>
            <FormControl size="small" className="h-14 w-full">
              <Select
                required
                value={startDateType}
                onChange={handleStartDateTypeChange}
                displayEmpty
                className="bg-white h-14 w-full"
                sx={{
                  height: 56,
                  borderRadius: "10px",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#A2A1A833",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#16151C",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#16151C",
                  },
                }}
                IconComponent={KeyboardArrowDownIcon}
              >
                <MenuItem value="" disabled>
                  <span className="text-gray-400">Date</span>
                </MenuItem>
                <MenuItem value="Immediately">Immediately</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>
          </div>

          {/* Other Date (conditionally rendered as its own column) */}
          {startDateType === "Other" && (
            <div className="w-full">
              <label className="block text-[12px] font-light text-[#A2A1A8] mb-1">Start Date</label>
              <TextField
                type="date"
                required
                value={customStartDate}
                onChange={handleCustomStartDateChange}
                size="small"
                className="h-14 w-full"
                InputProps={{
                  sx: {
                    height: 56,
                    borderRadius: "10px",
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#A2A1A833",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#16151C",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#16151C",
                    },
                  }
                }}
              />
            </div>
          )}

          {/* Tutor Hourly Rate */}
          <div className="w-full">
            <label className="block text-[12px] font-light text-[#A2A1A8] mb-1">Tutor Hourly Rate (USD)*</label>
            <div className="relative w-full">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <TextField
                type="number"
                placeholder="Tutor Rate"
                value={tutorHourlyRate}
                onChange={(e) => setTutorHourlyRate(e.target.value)}
                required
                size="small"
                className="pl-8 h-14 w-full"
                InputProps={{
                  sx: {
                    paddingLeft: "2rem",
                    height: 56,
                    borderRadius: "10px",
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#A2A1A833",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#16151C",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#16151C",
                    },
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>


      <div className="flex justify-end gap-3 pt-4">
        <Button
          disabled={submitting}
          variant="outlined"
          onClick={() => handleClose(false)}
          className="px-6 py-2 text-gray-600 border-gray-300 hover:bg-gray-50"
          sx={{
            width: 166,
            height: 50,
            textTransform: "none",
            fontSize: "16px",
            fontWeight: 400,
            borderRadius: "8px",
            padding: "12px 32px",
            color: "#16151C",
            borderColor: "#D1D5DB",
            "&:hover": {
              backgroundColor: "#F9FAFB",
              borderColor: "#D1D5DB",
            },
          }}
        >
          Cancel
        </Button>
        <Button
          disabled={submitting}
          variant="contained"
          onClick={submittingForm}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700"
          sx={{
            width: 166,
            height: 50,
            textTransform: "none",
            fontSize: "16px",
            fontWeight: 600,
            borderRadius: "10px",
            padding: "12px 32px",
            backgroundColor: "#4071B6",
            "&:hover": {
              backgroundColor: "#3763a0ff",
            },
          }}
        >
          {submitting ? "Creating..." : "Create Job"}
        </Button>
      </div>
    </div>
  )
}

const countries = [
  { code: "AD", label: "Andorra", phone: "376" },
  {
    code: "AE",
    label: "United Arab Emirates",
    phone: "971",
  },
  { code: "AF", label: "Afghanistan", phone: "93" },
  {
    code: "AG",
    label: "Antigua and Barbuda",
    phone: "1-268",
  },
  { code: "AI", label: "Anguilla", phone: "1-264" },
  { code: "AL", label: "Albania", phone: "355" },
  { code: "AM", label: "Armenia", phone: "374" },
  { code: "AO", label: "Angola", phone: "244" },
  { code: "AQ", label: "Antarctica", phone: "672" },
  { code: "AR", label: "Argentina", phone: "54" },
  { code: "AS", label: "American Samoa", phone: "1-684" },
  { code: "AT", label: "Austria", phone: "43" },
  {
    code: "AU",
    label: "Australia",
    phone: "61",
    suggested: true,
  },
  { code: "AW", label: "Aruba", phone: "297" },
  { code: "AX", label: "Alland Islands", phone: "358" },
  { code: "AZ", label: "Azerbaijan", phone: "994" },
  {
    code: "BA",
    label: "Bosnia and Herzegovina",
    phone: "387",
  },
  { code: "BB", label: "Barbados", phone: "1-246" },
  { code: "BD", label: "Bangladesh", phone: "880" },
  { code: "BE", label: "Belgium", phone: "32" },
  { code: "BF", label: "Burkina Faso", phone: "226" },
  { code: "BG", label: "Bulgaria", phone: "359" },
  { code: "BH", label: "Bahrain", phone: "973" },
  { code: "BI", label: "Burundi", phone: "257" },
  { code: "BJ", label: "Benin", phone: "229" },
  { code: "BL", label: "Saint Barthelemy", phone: "590" },
  { code: "BM", label: "Bermuda", phone: "1-441" },
  { code: "BN", label: "Brunei Darussalam", phone: "673" },
  { code: "BO", label: "Bolivia", phone: "591" },
  { code: "BR", label: "Brazil", phone: "55" },
  { code: "BS", label: "Bahamas", phone: "1-242" },
  { code: "BT", label: "Bhutan", phone: "975" },
  { code: "BV", label: "Bouvet Island", phone: "47" },
  { code: "BW", label: "Botswana", phone: "267" },
  { code: "BY", label: "Belarus", phone: "375" },
  { code: "BZ", label: "Belize", phone: "501" },
  {
    code: "CA",
    label: "Canada",
    phone: "1",
    suggested: true,
  },
  {
    code: "CC",
    label: "Cocos (Keeling) Islands",
    phone: "61",
  },
  {
    code: "CD",
    label: "Congo, Democratic Republic of the",
    phone: "243",
  },
  {
    code: "CF",
    label: "Central African Republic",
    phone: "236",
  },
  {
    code: "CG",
    label: "Congo, Republic of the",
    phone: "242",
  },
  { code: "CH", label: "Switzerland", phone: "41" },
  { code: "CI", label: "Cote d'Ivoire", phone: "225" },
  { code: "CK", label: "Cook Islands", phone: "682" },
  { code: "CL", label: "Chile", phone: "56" },
  { code: "CM", label: "Cameroon", phone: "237" },
  { code: "CN", label: "China", phone: "86" },
  { code: "CO", label: "Colombia", phone: "57" },
  { code: "CR", label: "Costa Rica", phone: "506" },
  { code: "CU", label: "Cuba", phone: "53" },
  { code: "CV", label: "Cape Verde", phone: "238" },
  { code: "CW", label: "Curacao", phone: "599" },
  { code: "CX", label: "Christmas Island", phone: "61" },
  { code: "CY", label: "Cyprus", phone: "357" },
  { code: "CZ", label: "Czech Republic", phone: "420" },
  {
    code: "DE",
    label: "Germany",
    phone: "49",
    suggested: true,
  },
  { code: "DJ", label: "Djibouti", phone: "253" },
  { code: "DK", label: "Denmark", phone: "45" },
  { code: "DM", label: "Dominica", phone: "1-767" },
  {
    code: "DO",
    label: "Dominican Republic",
    phone: "1-809",
  },
  { code: "DZ", label: "Algeria", phone: "213" },
  { code: "EC", label: "Ecuador", phone: "593" },
  { code: "EE", label: "Estonia", phone: "372" },
  { code: "EG", label: "Egypt", phone: "20" },
  { code: "EH", label: "Western Sahara", phone: "212" },
  { code: "ER", label: "Eritrea", phone: "291" },
  { code: "ES", label: "Spain", phone: "34" },
  { code: "ET", label: "Ethiopia", phone: "251" },
  { code: "FI", label: "Finland", phone: "358" },
  { code: "FJ", label: "Fiji", phone: "679" },
  {
    code: "FK",
    label: "Falkland Islands (Malvinas)",
    phone: "500",
  },
  {
    code: "FM",
    label: "Micronesia, Federated States of",
    phone: "691",
  },
  { code: "FO", label: "Faroe Islands", phone: "298" },
  {
    code: "FR",
    label: "France",
    phone: "33",
    suggested: true,
  },
  { code: "GA", label: "Gabon", phone: "241" },
  { code: "GB", label: "United Kingdom", phone: "44" },
  { code: "GD", label: "Grenada", phone: "1-473" },
  { code: "GE", label: "Georgia", phone: "995" },
  { code: "GF", label: "French Guiana", phone: "594" },
  { code: "GG", label: "Guernsey", phone: "44" },
  { code: "GH", label: "Ghana", phone: "233" },
  { code: "GI", label: "Gibraltar", phone: "350" },
  { code: "GL", label: "Greenland", phone: "299" },
  { code: "GM", label: "Gambia", phone: "220" },
  { code: "GN", label: "Guinea", phone: "224" },
  { code: "GP", label: "Guadeloupe", phone: "590" },
  { code: "GQ", label: "Equatorial Guinea", phone: "240" },
  { code: "GR", label: "Greece", phone: "30" },
  {
    code: "GS",
    label: "South Georgia and the South Sandwich Islands",
    phone: "500",
  },
  { code: "GT", label: "Guatemala", phone: "502" },
  { code: "GU", label: "Guam", phone: "1-671" },
  { code: "GW", label: "Guinea-Bissau", phone: "245" },
  { code: "GY", label: "Guyana", phone: "592" },
  { code: "HK", label: "Hong Kong", phone: "852" },
  {
    code: "HM",
    label: "Heard Island and McDonald Islands",
    phone: "672",
  },
  { code: "HN", label: "Honduras", phone: "504" },
  { code: "HR", label: "Croatia", phone: "385" },
  { code: "HT", label: "Haiti", phone: "509" },
  { code: "HU", label: "Hungary", phone: "36" },
  { code: "ID", label: "Indonesia", phone: "62" },
  { code: "IE", label: "Ireland", phone: "353" },
  { code: "IL", label: "Israel", phone: "972" },
  { code: "IM", label: "Isle of Man", phone: "44" },
  { code: "IN", label: "India", phone: "91" },
  {
    code: "IO",
    label: "British Indian Ocean Territory",
    phone: "246",
  },
  { code: "IQ", label: "Iraq", phone: "964" },
  {
    code: "IR",
    label: "Iran, Islamic Republic of",
    phone: "98",
  },
  { code: "IS", label: "Iceland", phone: "354" },
  { code: "IT", label: "Italy", phone: "39" },
  { code: "JE", label: "Jersey", phone: "44" },
  { code: "JM", label: "Jamaica", phone: "1-876" },
  { code: "JO", label: "Jordan", phone: "962" },
  {
    code: "JP",
    label: "Japan",
    phone: "81",
    suggested: true,
  },
  { code: "KE", label: "Kenya", phone: "254" },
  { code: "KG", label: "Kyrgyzstan", phone: "996" },
  { code: "KH", label: "Cambodia", phone: "855" },
  { code: "KI", label: "Kiribati", phone: "686" },
  { code: "KM", label: "Comoros", phone: "269" },
  {
    code: "KN",
    label: "Saint Kitts and Nevis",
    phone: "1-869",
  },
  {
    code: "KP",
    label: "Korea, Democratic People's Republic of",
    phone: "850",
  },
  { code: "KR", label: "Korea, Republic of", phone: "82" },
  { code: "KW", label: "Kuwait", phone: "965" },
  { code: "KY", label: "Cayman Islands", phone: "1-345" },
  { code: "KZ", label: "Kazakhstan", phone: "7" },
  {
    code: "LA",
    label: "Lao People's Democratic Republic",
    phone: "856",
  },
  { code: "LB", label: "Lebanon", phone: "961" },
  { code: "LC", label: "Saint Lucia", phone: "1-758" },
  { code: "LI", label: "Liechtenstein", phone: "423" },
  { code: "LK", label: "Sri Lanka", phone: "94" },
  { code: "LR", label: "Liberia", phone: "231" },
  { code: "LS", label: "Lesotho", phone: "266" },
  { code: "LT", label: "Lithuania", phone: "370" },
  { code: "LU", label: "Luxembourg", phone: "352" },
  { code: "LV", label: "Latvia", phone: "371" },
  { code: "LY", label: "Libya", phone: "218" },
  { code: "MA", label: "Morocco", phone: "212" },
  { code: "MC", label: "Monaco", phone: "377" },
  {
    code: "MD",
    label: "Moldova, Republic of",
    phone: "373",
  },
  { code: "ME", label: "Montenegro", phone: "382" },
  {
    code: "MF",
    label: "Saint Martin (French part)",
    phone: "590",
  },
  { code: "MG", label: "Madagascar", phone: "261" },
  { code: "MH", label: "Marshall Islands", phone: "692" },
  {
    code: "MK",
    label: "Macedonia, the Former Yugoslav Republic of",
    phone: "389",
  },
  { code: "ML", label: "Mali", phone: "223" },
  { code: "MM", label: "Myanmar", phone: "95" },
  { code: "MN", label: "Mongolia", phone: "976" },
  { code: "MO", label: "Macao", phone: "853" },
  {
    code: "MP",
    label: "Northern Mariana Islands",
    phone: "1-670",
  },
  { code: "MQ", label: "Martinique", phone: "596" },
  { code: "MR", label: "Mauritania", phone: "222" },
  { code: "MS", label: "Montserrat", phone: "1-664" },
  { code: "MT", label: "Malta", phone: "356" },
  { code: "MU", label: "Mauritius", phone: "230" },
  { code: "MV", label: "Maldives", phone: "960" },
  { code: "MW", label: "Malawi", phone: "265" },
  { code: "MX", label: "Mexico", phone: "52" },
  { code: "MY", label: "Malaysia", phone: "60" },
  { code: "MZ", label: "Mozambique", phone: "258" },
  { code: "NA", label: "Namibia", phone: "264" },
  { code: "NC", label: "New Caledonia", phone: "687" },
  { code: "NE", label: "Niger", phone: "227" },
  { code: "NF", label: "Norfolk Island", phone: "672" },
  { code: "NG", label: "Nigeria", phone: "234" },
  { code: "NI", label: "Nicaragua", phone: "505" },
  { code: "NL", label: "Netherlands", phone: "31" },
  { code: "NO", label: "Norway", phone: "47" },
  { code: "NP", label: "Nepal", phone: "977" },
  { code: "NR", label: "Nauru", phone: "674" },
  { code: "NU", label: "Niue", phone: "683" },
  { code: "NZ", label: "New Zealand", phone: "64" },
  { code: "OM", label: "Oman", phone: "968" },
  { code: "PA", label: "Panama", phone: "507" },
  { code: "PE", label: "Peru", phone: "51" },
  { code: "PF", label: "French Polynesia", phone: "689" },
  { code: "PG", label: "Papua New Guinea", phone: "675" },
  { code: "PH", label: "Philippines", phone: "63" },
  { code: "PK", label: "Pakistan", phone: "92" },
  { code: "PL", label: "Poland", phone: "48" },
  {
    code: "PM",
    label: "Saint Pierre and Miquelon",
    phone: "508",
  },
  { code: "PN", label: "Pitcairn", phone: "870" },
  { code: "PR", label: "Puerto Rico", phone: "1" },
  {
    code: "PS",
    label: "Palestine, State of",
    phone: "970",
  },
  { code: "PT", label: "Portugal", phone: "351" },
  { code: "PW", label: "Palau", phone: "680" },
  { code: "PY", label: "Paraguay", phone: "595" },
  { code: "QA", label: "Qatar", phone: "974" },
  { code: "RE", label: "Reunion", phone: "262" },
  { code: "RO", label: "Romania", phone: "40" },
  { code: "RS", label: "Serbia", phone: "381" },
  { code: "RU", label: "Russian Federation", phone: "7" },
  { code: "RW", label: "Rwanda", phone: "250" },
  { code: "SA", label: "Saudi Arabia", phone: "966" },
  { code: "SB", label: "Solomon Islands", phone: "677" },
  { code: "SC", label: "Seychelles", phone: "248" },
  { code: "SD", label: "Sudan", phone: "249" },
  { code: "SE", label: "Sweden", phone: "46" },
  { code: "SG", label: "Singapore", phone: "65" },
  { code: "SH", label: "Saint Helena", phone: "290" },
  { code: "SI", label: "Slovenia", phone: "386" },
  {
    code: "SJ",
    label: "Svalbard and Jan Mayen",
    phone: "47",
  },
  { code: "SK", label: "Slovakia", phone: "421" },
  { code: "SL", label: "Sierra Leone", phone: "232" },
  { code: "SM", label: "San Marino", phone: "378" },
  { code: "SN", label: "Senegal", phone: "221" },
  { code: "SO", label: "Somalia", phone: "252" },
  { code: "SR", label: "Suriname", phone: "597" },
  { code: "SS", label: "South Sudan", phone: "211" },
  {
    code: "ST",
    label: "Sao Tome and Principe",
    phone: "239",
  },
  { code: "SV", label: "El Salvador", phone: "503" },
  {
    code: "SX",
    label: "Sint Maarten (Dutch part)",
    phone: "1-721",
  },
  {
    code: "SY",
    label: "Syrian Arab Republic",
    phone: "963",
  },
  { code: "SZ", label: "Swaziland", phone: "268" },
  {
    code: "TC",
    label: "Turks and Caicos Islands",
    phone: "1-649",
  },
  { code: "TD", label: "Chad", phone: "235" },
  {
    code: "TF",
    label: "French Southern Territories",
    phone: "262",
  },
  { code: "TG", label: "Togo", phone: "228" },
  { code: "TH", label: "Thailand", phone: "66" },
  { code: "TJ", label: "Tajikistan", phone: "992" },
  { code: "TK", label: "Tokelau", phone: "690" },
  { code: "TL", label: "Timor-Leste", phone: "670" },
  { code: "TM", label: "Turkmenistan", phone: "993" },
  { code: "TN", label: "Tunisia", phone: "216" },
  { code: "TO", label: "Tonga", phone: "676" },
  { code: "TR", label: "Turkey", phone: "90" },
  {
    code: "TT",
    label: "Trinidad and Tobago",
    phone: "1-868",
  },
  { code: "TV", label: "Tuvalu", phone: "688" },
  {
    code: "TW",
    label: "Taiwan",
    phone: "886",
  },
  {
    code: "TZ",
    label: "United Republic of Tanzania",
    phone: "255",
  },
  { code: "UA", label: "Ukraine", phone: "380" },
  { code: "UG", label: "Uganda", phone: "256" },
  {
    code: "US",
    label: "United States",
    phone: "1",
    suggested: true,
  },
  { code: "UY", label: "Uruguay", phone: "598" },
  { code: "UZ", label: "Uzbekistan", phone: "998" },
  {
    code: "VA",
    label: "Holy See (Vatican City State)",
    phone: "379",
  },
  {
    code: "VC",
    label: "Saint Vincent and the Grenadines",
    phone: "1-784",
  },
  { code: "VE", label: "Venezuela", phone: "58" },
  {
    code: "VG",
    label: "British Virgin Islands",
    phone: "1-284",
  },
  {
    code: "VI",
    label: "US Virgin Islands",
    phone: "1-340",
  },
  { code: "VN", label: "Vietnam", phone: "84" },
  { code: "VU", label: "Vanuatu", phone: "678" },
  { code: "WF", label: "Wallis and Futuna", phone: "681" },
  { code: "WS", label: "Samoa", phone: "685" },
  { code: "XK", label: "Kosovo", phone: "383" },
  { code: "YE", label: "Yemen", phone: "967" },
  { code: "YT", label: "Mayotte", phone: "262" },
  { code: "ZA", label: "South Africa", phone: "27" },
  { code: "ZM", label: "Zambia", phone: "260" },
  { code: "ZW", label: "Zimbabwe", phone: "263" },
]

const timezones = [
  "GMT-12:00",
  "GMT-11:00",
  "GMT-10:00",
  "GMT-09:00",
  "GMT-08:00",
  "GMT-07:00",
  "GMT-06:00",
  "GMT-05:00",
  "GMT-04:00",
  "GMT-03:30",
  "GMT-03:00",
  "GMT-02:00",
  "GMT-01:00",
  "GMT+00:00",
  "GMT+01:00",
  "GMT+02:00",
  "GMT+03:00",
  "GMT+03:30",
  "GMT+04:00",
  "GMT+04:30",
  "GMT+05:00",
  "GMT+05:30",
  "GMT+05:45",
  "GMT+06:00",
  "GMT+06:30",
  "GMT+07:00",
  "GMT+08:00",
  "GMT+09:00",
  "GMT+09:30",
  "GMT+10:00",
  "GMT+11:00",
  "GMT+12:00",
  "GMT+13:00",
  "GMT+14:00",
]

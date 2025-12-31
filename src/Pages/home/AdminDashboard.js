"use client"

import { useContext, useEffect, useState } from "react"
import { db } from "../../firebase"
import { collection, doc, query, where, getCountFromServer, getDocs, getDoc } from "firebase/firestore"
import { toast } from "react-hot-toast"
import { MyContext } from "../../Context/MyContext"
import { TopHeadingProvider } from "../../Components/Layout"
import { useTopHeading } from "../../Components/Layout"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Area,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  BarChart,
  Bar
} from "recharts"

const AdminDashboard = () => {
  const { userDetails } = useContext(MyContext)

  const [studentFormsCount, setStudentFormsCount] = useState(0)
  const [tutorFormsCount, setTutorFormsCount] = useState(0)
  const [pendingStudentFormsCount, setPendingStudentFormsCount] = useState(0)
  const [pendingTutorFormsCount, setPendingTutorFormsCount] = useState(0)
  const [requestCoursesFormsCount, setRequestCoursesFormsCount] = useState(0)
  const [pendingRequestCoursesFormsCount, setPendingRequestCoursesFormsCount] = useState(0)
  const [revisionCoursesFormsCount, setRevisionCoursesFormsCount] = useState(0)
  const [pendingRevisionCoursesFormsCount, setPendingRevisionCoursesFormsCount] = useState(0)
  const [upcomingCoursesFormsCount, setUpcomingCoursesFormsCount] = useState(0)
  const [pendingUpcomingCoursesFormsCount, setPendingUpcomingCoursesFormsCount] = useState(0)
  const [contactUsFormsCount, setContactUsFormsCount] = useState(0)
  const [pendingContactUsFormsCount, setPendingContactUsFormsCount] = useState(0)
  const [tutorsCount, setTutorsCount] = useState(0)
  const [studentsCount, setStudentsCount] = useState(0)
  const [links, setLinks] = useState(0)
  const [joiningsData, setJoiningsData] = useState([])
  const [creditsData, setCreditsData] = useState([])
  const { setFirstMessage, setSecondMessage } = useTopHeading()

  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

  const currentMonthIndex = new Date().getMonth(); // 0-based index
  const currentYear = new Date().getFullYear();

  // Filter MONTHS array up to current month
  const monthsThisYear = MONTHS.slice(0, currentMonthIndex + 1);

  const [selectedMonth, setSelectedMonth] = useState(currentMonthIndex);

  useEffect(() => {
    setFirstMessage(`Welcome ${userDetails?.userName || "User"}`)
    setSecondMessage("Good Morning")
  }, [setFirstMessage, setSecondMessage])

  useEffect(() => {
    fetchCreditsSoldForMonth(selectedMonth);
  }, [selectedMonth]);

  const fetchCollectionCount = async (collectionName, setStateFunc) => {
    try {
      const ordersRef = collection(db, "adminPanel")
      const customDocRef = doc(ordersRef, collectionName)
      const orderCollectionRef = collection(customDocRef, collectionName)
      const snapshot = await getCountFromServer(orderCollectionRef)
      setStateFunc(snapshot.data().count)
    } catch (error) {
      toast.error(`Error fetching ${collectionName} count`)
      console.error(`Error fetching ${collectionName} count: `, error)
    }
  }

  const fetchLinksCount = async (collectionName, setStateFunc) => {
    try {
      const ordersRef = collection(db, collectionName)
      const snapshot = await getCountFromServer(ordersRef)
      setStateFunc(snapshot.data().count)
    } catch (error) {
      toast.error(`Error fetching ${collectionName} count`)
      console.error(`Error fetching ${collectionName} count: `, error)
    }
  }

  const fetchTutorsDataCount = async (item, setStateFunc) => {
    try {
      const userListRef = collection(db, "userList")
      const q = query(userListRef, where("type", "==", item))
      const snapshot = await getCountFromServer(q)
      setStateFunc(snapshot.data().count)
    } catch (error) {
      toast.error(`Error fetching ${item} count`)
      console.error(`Error fetching ${item} count: `, error)
    }
  }

  useEffect(() => {
    fetchCollectionCount("processedStudentForm", setStudentFormsCount)
    fetchCollectionCount("processedTutorForm", setTutorFormsCount)
    fetchCollectionCount("studentForm", setPendingStudentFormsCount)
    fetchCollectionCount("teacherForm", setPendingTutorFormsCount)
    fetchCollectionCount("processedRequestCourseForm", setRequestCoursesFormsCount)
    fetchCollectionCount("requestCourseForm", setPendingRequestCoursesFormsCount)
    fetchCollectionCount("processedRevisionCoursesForm", setRevisionCoursesFormsCount)
    fetchCollectionCount("revisionCoursesForm", setPendingRevisionCoursesFormsCount)
    fetchCollectionCount("processedUpcomingCoursesForm", setUpcomingCoursesFormsCount)
    fetchCollectionCount("upcomingCoursesForm", setPendingUpcomingCoursesFormsCount)
    fetchCollectionCount("processedContactUsForm", setContactUsFormsCount)
    fetchCollectionCount("contactUsForm", setPendingContactUsFormsCount)
    fetchLinksCount("Linked", setLinks)
    fetchTutorsDataCount("teacher", setTutorsCount)
    fetchTutorsDataCount("student", setStudentsCount)
    fetchUserJoiningsByMonth()
  }, [])

  const CHART_COLORS = {
    students: "#F49342",
    tutors: "#57AD85",
    sales: "#4071B6",
  }
  const CHART_COLORS2 = {
    courses: "#33A752",
    students: "#4184F3",
    tutors: "#F49342",
    contact: "#E94234",
  }

  const totalCourseForms = requestCoursesFormsCount + pendingRequestCoursesFormsCount + revisionCoursesFormsCount + pendingRevisionCoursesFormsCount + upcomingCoursesFormsCount + pendingUpcomingCoursesFormsCount;
  const totalStudentForms = studentFormsCount + pendingStudentFormsCount;
  const totalTutorForms = tutorFormsCount + pendingTutorFormsCount;
  const totalContactUsForms = contactUsFormsCount + pendingContactUsFormsCount;

  const totalPendingForms = pendingStudentFormsCount + pendingTutorFormsCount +
    pendingRequestCoursesFormsCount + pendingRevisionCoursesFormsCount +
    pendingUpcomingCoursesFormsCount + pendingContactUsFormsCount;

  const totalProcessedForms = (studentFormsCount + tutorFormsCount +
    requestCoursesFormsCount + revisionCoursesFormsCount + contactUsFormsCount +
    upcomingCoursesFormsCount);

  const totalForms = totalPendingForms + totalProcessedForms;

  const totalsFormsData = [
    { name: "Courses Forms", value: (totalCourseForms / totalForms) * 100, key: "courses" },
    { name: "Student Forms", value: (totalStudentForms / totalForms) * 100, key: "students" },
    { name: "Tutor Forms", value: (totalTutorForms / totalForms) * 100, key: "tutors" },
    { name: "Contact Us Forms", value: (totalContactUsForms / totalForms) * 100, key: "contact" },
  ]

  const fetchUserJoiningsByMonth = async () => {
    try {
      const currentYear = new Date().getFullYear()

      // init all months with 0
      const monthlyStats = MONTHS.map((m) => ({
        month: m,
        tutors: 0,
        students: 0,
      }))

      const userRef = collection(db, "userList")
      const snapshot = await getDocs(userRef)

      snapshot.forEach((doc) => {
        const data = doc.data()
        if (!data.createdAt || !data.type) return

        const createdDate = data.createdAt.toDate()
        if (createdDate.getFullYear() !== currentYear) return

        const monthIndex = createdDate.getMonth()

        if (data.type === "teacher") {
          monthlyStats[monthIndex].tutors += 1
        }

        if (data.type === "student") {
          monthlyStats[monthIndex].students += 1
        }
      })

      setJoiningsData(monthlyStats)
    } catch (error) {
      console.error("Error fetching joinings data:", error)
      toast.error("Error loading joinings chart")
    }
  }

  const fetchCreditsSoldForMonth = async (monthIndex) => {
    try {
      const year = currentYear.toString();
      const month = String(monthIndex + 1).padStart(2, "0"); // Firestore stores months 01-12

      const yearRef = doc(db, "adminPanel", "creditsSold", "years", year);
      const snap = await getDoc(yearRef);
      if (!snap.exists()) {
        setCreditsData([]);
        return;
      }

      const data = snap.data();
      const daysMap = data?.months?.[month]?.days || {};

      const chartData = Object.entries(daysMap)
        .map(([day, credits]) => ({
          date: `${MONTHS[monthIndex]} ${day}`,
          credits,
        }))
        .sort((a, b) => parseInt(a.date.split(" ")[1]) - parseInt(b.date.split(" ")[1]));

      setCreditsData(chartData);
    } catch (error) {
      console.error("Error fetching credits sold:", error);
      toast.error("Failed to load credits sold");
    }
  };



  return (
    <TopHeadingProvider>
      {/* outer wrapper prevents horizontal overflow */}
      <div className="flex flex-col p-4 sm:p-6 gap-6 w-full overflow-x-hidden">

        {/* === Row: Cards + Donut === */}
        <div className="flex flex-col lg:flex-row gap-y-5 lg:gap-y-0 lg:gap-x-0 items-start">
          {/* LEFT: Cards container */}
          <div className="w-full lg:w-2/3 min-w-0">
            <div className="flex flex-col gap-4">
              {/* top row (grid collapses to single column on small screens) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-5 lg:gap-y-0 lg:gap-x-0 ">
                {/* Total Students Card */}

                <div className="bg-white rounded-[10px] border-1 border-[#A2A1A833] min-w-0 lg:w-[313px] h-[154px]">
                  <div className="flex pt-4 p-3 pb-0 items-start ">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
                        <div className="bg-[#4071B60D] p-[10px] rounded-lg flex-shrink-0 -mt-2">
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <ellipse cx="10" cy="13.7493" rx="5" ry="2.08333" stroke="#4071B6" stroke-width="1.5" stroke-linejoin="round" />
                            <ellipse cx="10" cy="6.66602" rx="2.5" ry="2.5" stroke="#4071B6" stroke-width="1.5" stroke-linejoin="round" />
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M5.62817 10.918C4.48423 10.9387 3.42178 11.1324 2.60742 11.4581C2.17847 11.6297 1.78105 11.8528 1.47852 12.1388C1.21236 12.3905 0.981341 12.7308 0.927734 13.1485L0.916016 13.3331L0.927734 13.5167C0.981265 13.9346 1.21229 14.2747 1.47852 14.5265C1.78112 14.8126 2.17831 15.0364 2.60742 15.2081C3.07704 15.396 3.62916 15.5396 4.23184 15.6315C3.69618 15.1132 3.37497 14.5162 3.33657 13.8788C3.27729 13.858 3.22008 13.8366 3.16504 13.8146C2.84036 13.6847 2.62779 13.5492 2.50879 13.4366C2.45522 13.386 2.43116 13.3511 2.4209 13.3321C2.43145 13.313 2.45615 13.2784 2.50879 13.2286C2.62782 13.1161 2.84048 12.9805 3.16504 12.8507C3.29653 12.7981 3.44039 12.7489 3.59526 12.7039C3.95684 12.0019 4.67329 11.3848 5.62817 10.918Z" fill="#4071B6" />
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M16.6627 13.8786C16.6243 14.5161 16.3031 15.1132 15.7674 15.6315C16.37 15.5396 16.9219 15.396 17.3915 15.2081C17.8208 15.0364 18.2187 14.8127 18.5214 14.5265C18.8256 14.2388 19.0828 13.8357 19.0829 13.3331C19.0829 12.8303 18.8257 12.4265 18.5214 12.1388C18.2188 11.8526 17.8208 11.6298 17.3915 11.4581C16.5771 11.1323 15.5151 10.9386 14.3711 10.918C15.326 11.3848 16.0425 12.002 16.4041 12.704C16.5588 12.749 16.7025 12.7981 16.8339 12.8507C17.1583 12.9805 17.3711 13.1161 17.4902 13.2286C17.5423 13.2779 17.5664 13.3129 17.5771 13.3321C17.5667 13.3512 17.5432 13.3865 17.4902 13.4366C17.3711 13.5491 17.1585 13.6847 16.8339 13.8146C16.779 13.8365 16.7219 13.8579 16.6627 13.8786Z" fill="#4071B6" />
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M13.814 8.34678C13.6076 8.81481 13.3176 9.23769 12.9629 9.59649C13.3173 9.80038 13.7284 9.91699 14.1666 9.91699C15.501 9.91682 16.5824 8.83541 16.5826 7.50098C16.5826 6.1664 15.5011 5.08416 14.1666 5.08398C14.0636 5.08398 13.9622 5.09042 13.8626 5.10292C14.0486 5.56165 14.1552 6.06101 14.1655 6.58399C14.1658 6.58398 14.1662 6.58398 14.1666 6.58398C14.6727 6.58416 15.0826 6.99482 15.0826 7.50098C15.0824 8.00698 14.6726 8.41682 14.1666 8.41699C14.0416 8.41699 13.9225 8.39201 13.814 8.34678Z" fill="#4071B6" />
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M6.13634 5.10288C6.03698 5.09042 5.93574 5.084 5.83301 5.08398C4.49832 5.08398 3.41602 6.16629 3.41602 7.50098C3.41619 8.83552 4.49843 9.91699 5.83301 9.91699C6.27108 9.91693 6.68188 9.80035 7.03612 9.59654C6.68142 9.23776 6.39142 8.81489 6.18503 8.34685C6.07667 8.392 5.95776 8.41695 5.83301 8.41699C5.32686 8.41699 4.91619 8.00709 4.91602 7.50098C4.91602 6.99472 5.32675 6.58398 5.83301 6.58398C5.83317 6.58398 5.83334 6.58398 5.8335 6.58398C5.84376 6.06099 5.95038 5.56162 6.13634 5.10288Z" fill="#4071B6" />
                          </svg>
                        </div>
                        <span className="text-[16px] font-light mb-1 text-[#16151C]">Total Students</span>
                      </div>
                      <div className="pl-12 text-[30px] font-semibold text-[#16151C] mb-2">{studentsCount || 40}</div>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <div className="bg-[#30BE820D] rounded-[5px] w-[54px] h-[26px] flex justify-center items-center gap-2 text-green-500 text-sm font-medium">
                        <span className="text-[11px] font-light">▲</span>
                        <span className="text-[11px] font-light">12%</span>
                      </div>
                      <div className="text-[12px] font-light text-[#A2A1A8] mt-2">vs last month</div>
                    </div>
                  </div>
                  <div className="flex items-center text-[12px] p-3 pt-2 font-light text-[#A2A1A8] border-t border-[#A2A1A833] h-[40px]">
                    Update: Aug 16, 2025
                  </div>
                </div>

                {/* Total Tutors Card */}
                <div className="bg-white rounded-[10px] border-1 border-[#A2A1A833] min-w-0 lg:w-[313px] h-[154px]">
                  <div className="flex pt-4 p-3 pb-0 items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
                        <div className="flex justify-center bg-[#4071B60D] w-[40px] h-[40px] p-[10px] rounded-lg flex-shrink-0 -mt-2">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M13.3184 14.6875C13.491 14.3111 13.936 14.1459 14.3125 14.3184C14.689 14.4909 14.8542 14.936 14.6816 15.3125C14.0766 16.6326 11.9323 19.0225 8 19.0225C4.66002 19.0225 3.01905 20.7037 2.65723 21.3613C2.45761 21.7243 2.00161 21.8568 1.63867 21.6572C1.2758 21.4576 1.14319 21.0016 1.34277 20.6387C1.98115 19.478 4.14049 17.5225 8 17.5225C11.2677 17.5225 12.9234 15.5492 13.3184 14.6875ZM8 12C9.10453 12 10 12.8955 10 14C10 15.1045 9.10453 16 8 16C6.89543 16 6 15.1046 6 14C6 12.8954 6.89543 12 8 12ZM19.5996 3C20.9251 3 22 4.07491 22 5.40039V12.5996C22 13.9251 20.9251 15 19.5996 15H18.3193C17.9383 14.9999 17.5626 14.9094 17.2236 14.7354L9.30371 10.6689C8.50337 10.2579 8 9.43392 8 8.53418V5.40039C8 4.07491 9.07491 3 10.4004 3H19.5996ZM15 10.0996C14.5029 10.0996 14.0996 10.5029 14.0996 11C14.0996 11.4971 14.5029 11.9004 15 11.9004H18C18.4971 11.9004 18.9004 11.4971 18.9004 11C18.9004 10.5029 18.4971 10.0996 18 10.0996H15ZM12 6.09961C11.5029 6.09961 11.0996 6.50294 11.0996 7C11.0996 7.49706 11.5029 7.90039 12 7.90039H18C18.4971 7.90039 18.9004 7.49706 18.9004 7C18.9004 6.50294 18.4971 6.09961 18 6.09961H12Z" fill="#4071B6" />
                          </svg>
                        </div>
                        <span className="text-[16px] font-light mb-1 text-[#16151C]">Total Tutors</span>
                      </div>
                      <div className="pl-12 text-[30px] font-semibold text-[#16151C] mb-2">{tutorsCount || 10}</div>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <div className="bg-[#FECACA0D] rounded-[5px] w-[54px] h-[26px] flex justify-center items-center gap-2 text-red-500 text-sm font-medium">
                        <span className="text-[11px] font-light">▼</span>
                        <span className="text-[11px] font-light">8%</span>
                      </div>
                      <div className="text-[12px] font-light text-[#A2A1A8] mt-2">vs last month</div>
                    </div>
                  </div>
                  <div className="flex items-center text-[12px] p-3 pt-2 font-light text-[#A2A1A8] border-t border-[#A2A1A833] h-[40px]">
                    Update: Aug 14, 2025
                  </div>
                </div>
              </div>

              {/* bottom row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-5 lg:gap-y-0 lg:gap-x-0 ">
                {/* Active Student/Tutors Card */}

                <div className="bg-white rounded-[10px] border-1 border-[#A2A1A833] min-w-0 lg:w-[313px] h-[154px]">
                  <div className="flex pt-4 p-3 pb-0 items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
                        <div className="bg-[#4071B60D] p-[10px] rounded-lg flex-shrink-0 -mt-2">
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6.66602 1.66602V4.16602" stroke="#4071B6" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M13.334 1.66602V4.16602" stroke="#4071B6" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M2.5 6.91602C2.5 4.70688 4.29086 2.91602 6.5 2.91602H13.5C15.7091 2.91602 17.5 4.70688 17.5 6.91602V14.3327C17.5 16.5418 15.7091 18.3327 13.5 18.3327H6.5C4.29086 18.3327 2.5 16.5418 2.5 14.3327V6.91602Z" stroke="#4071B6" stroke-width="1.5" />
                            <path d="M7.5 12.5007L8.83615 13.5696C9.25403 13.9039 9.86103 13.8499 10.2134 13.4472L12.5 10.834" stroke="#4071B6" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M2.5 7.5H17.5" stroke="#4071B6" stroke-width="1.5" stroke-linecap="round" />
                          </svg>
                        </div>
                        <span className="text-[16px] font-light mb-1 text-[#16151C] lg:w-44">Active Student/Tutors</span>
                      </div>
                      <div className="pl-12 text-[30px] font-semibold text-[#16151C] mb-2">
                        {tutorsCount
                          ? (studentsCount / tutorsCount).toFixed(2)
                          : "N/A"}
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <div className="bg-[#FECACA0D] rounded-[5px] w-[54px] h-[26px] flex justify-center items-center gap-2 text-red-500 text-sm font-medium">
                        <span className="text-[11px] font-light">▼</span>
                        <span className="text-[11px] font-light">16%</span>
                      </div>
                      <div className="text-[12px] font-light text-[#A2A1A8] lg:-ml-5 w-20 mt-2">vs last month</div>
                    </div>
                  </div>
                  <div className="flex items-center text-[12px] p-3 pt-2 font-light text-[#A2A1A8] border-t border-[#A2A1A833] h-[40px]">
                    Update: Aug 10, 2025
                  </div>
                </div>

                {/* Courses Form Card */}
                <div className="bg-white rounded-[10px] border-1 border-[#A2A1A833] min-w-0 lg:w-[313px] h-[154px]">
                  <div className="flex pt-4 p-3 pb-0 items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
                        <div className="bg-[#4071B60D] p-[10px] rounded-lg flex-shrink-0 -mt-2">
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M5.83333 18.3327C7.38957 18.3327 8.69672 17.2662 9.06381 15.8243C9.17736 15.3782 9.53976 14.9993 10 14.9993H15.8333M5.83333 18.3327C3.99238 18.3327 2.5 16.8403 2.5 14.9993V4.16602C2.5 2.7853 3.61929 1.66602 5 1.66602H13.3333C14.714 1.66602 15.8333 2.7853 15.8333 4.16602V14.9993M5.83333 18.3327H15.8333C17.3896 18.3327 18.6967 17.2662 19.0638 15.8243C19.1774 15.3782 18.7936 14.9993 18.3333 14.9993H15.8333M12.5 5.83268H5.83333M9.16667 9.99935H5.83333" stroke="#4071B6" stroke-width="1.5" stroke-linecap="round" />
                          </svg>
                        </div>
                        <span className="text-[16px] font-light mb-1 text-[#16151C]">Courses Form</span>
                      </div>
                      <div className="pl-12 text-[30px] font-semibold text-[#16151C] mb-2">{totalCourseForms || "N/A"}</div>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <div className="bg-[#30BE820D] rounded-[5px] w-[54px] h-[26px] flex justify-center items-center gap-2 text-green-500 text-sm font-medium">
                        <span className="text-[11px] font-light">▲</span>
                        <span className="text-[11px] font-light">12%</span>
                      </div>
                      <div className="text-[12px] font-light text-[#A2A1A8] mt-2">vs last month</div>
                    </div>
                  </div>
                  <div className="flex items-center text-[12px] p-3 pt-2 font-light text-[#A2A1A8] border-t border-[#A2A1A833] h-[40px]">
                    Update: Aug 16, 2025
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Donut */}
          <div className="w-full lg:w-1/3 min-w-0">
            <div className="bg-white rounded-lg border border-gray-200 p-4 flex flex-col lg:h-[331px]">
              <h3 className="font-semibold mb-4 text-gray-900 items-start">Totals Forms ({totalForms})</h3>

              <div className="w-full flex flex-col sm:flex-row  items-center gap-4">
                <div className="flex-shrink-0 lg:w-[120px] lg:h-[120px] sm:w-40 sm:h-40 ">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={totalsFormsData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={28}
                        outerRadius={48}
                        stroke="transparent"
                        paddingAngle={1.5}
                        cornerRadius={3}
                        startAngle={90}
                        endAngle={-270}
                      >
                        {totalsFormsData.map((entry) => (
                          <Cell key={entry.key} fill={CHART_COLORS2[entry.key]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="flex-1 flex flex-col gap-2 min-w-0 lg:-ml-4">
                  {totalsFormsData.map((item) => (
                    <div key={item.key} className="flex justify-between items-center">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: CHART_COLORS2[item.key] }}></div>
                        <span className="font-light text-[#16151C] text-[12px] truncate">{item.name}</span>
                      </div>
                      <span className="font-semibold text-[#16151C] text-[12px]">{item.value.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary boxes */}
              <div className="grid grid-cols-2 gap-2 w-full mt-8">
                <div className="border-1 border-[#A2A1A833] rounded-lg p-2">
                  <div className="font-light text-[14px] text-start">Total Pending Forms</div>
                  <div className="text-[16px] font-semibold ml-2">{totalPendingForms}</div>
                </div>
                <div className="border-1 border-[#A2A1A833] rounded-lg p-2">
                  <div className="font-light text-[14px] text-start">Total Processed Forms</div>
                  <div className="text-[16px] font-semibold ml-2">{totalProcessedForms}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* === Row: Line Chart + Recent Activity === */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-y-5 lg:gap-y-0 lg:gap-x-0 items-start">
          <div className="lg:col-span-2 min-w-0 h-[358px] min-h-[358px] lg:pr-6">
            <div className="bg-white rounded-lg border border-gray-200 p-4 flex flex-col h-full w-full">
              <div className="flex justify-between items-center mb-4 gap-2">
                <h3 className="font-semibold text-gray-900 truncate">Credits Sold</h3>
                <select
                  className="border rounded px-2 py-1 text-sm w-full sm:w-auto"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                >
                  {monthsThisYear.map((month, idx) => (
                    <option key={idx} value={idx}>
                      {month}
                    </option>
                  ))}
                </select>

              </div>

              <div className="flex-1 min-h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={creditsData} margin={{ top: 8, right: 16, bottom: 8, left: 8 }}>
                    <defs>
                      <linearGradient id="colorCredits" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={CHART_COLORS.sales} stopOpacity={0.4} />   {/* top */}
                        <stop offset="80%" stopColor={CHART_COLORS.sales} stopOpacity={0} />    {/* fade ends at 80% */}
                      </linearGradient>
                    </defs>

                    <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fill: "#A2A1A8", fontSize: 10, fontWeight: 300, dy: -15 }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fill: "#A2A1A8", fontSize: 10, fontWeight: 300, dx: -25, dy: -5 }} />
                    <Tooltip />

                    {/* Gradient-filled area under the line */}
                    <Area
                      type="monotone"
                      dataKey="credits"
                      stroke="none"
                      fill="url(#colorCredits)"
                      legendType="none"
                    />

                    {/* Line on top */}
                    <Line
                      type="monotone"
                      dataKey="credits"
                      name="Credits Sold"
                      stroke={CHART_COLORS.sales}
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 min-w-0 h-full">
            <div className="bg-white rounded-lg border border-gray-200 p-4 h-full">
              <h3 className="text-[20px] font-semibold mb-4">Recent Activity</h3>
              <div className="space-y-4">
                <div className="text-[16px] font-light text-[#A2A1A8]">Today</div>

                <div className="flex items-center gap-3">
                  <div className="w-[100px] text-[16px] font-light text-left">2 hours ago</div>
                  <div className="w-[2px] self-stretch bg-[#3867AA]"></div>
                  <div className="flex-1">
                    <div className="font-semibold text-[14px] ">John Deo</div>
                    <div className="text-[14px] font-light text-[#4071B6]">Submitted a Form</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-[100px] text-[16px] font-light text-left">12:30 am</div>
                  <div className="w-[2px] self-stretch bg-[#3867AA]"></div>
                  <div className="flex-1">
                    <div className="font-semibold text-[14px] ">Will Smith</div>
                    <div className="text-[14px] font-light text-[#4071B6]">Requested Course</div>
                  </div>
                </div>

                <div className="text-[16px] font-light text-[#A2A1A8] mt-6">Yesterday</div>

                <div className="flex items-center gap-3">
                  <div className="w-[100px] text-[16px] font-light text-left">09:30 pm</div>
                  <div className="w-[2px] self-stretch bg-[#3867AA]"></div>
                  <div className="flex-1">
                    <div className="font-semibold text-[14px] ">Kara Knight</div>
                    <div className="text-[14px] font-light text-[#4071B6]">Submitted a Form</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* === Charts Section === */}
        <div className="grid grid-cols-1 gap-4">
          <div className="w-full lg:w-full min-w-0 bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
              <h3 className="font-semibold text-gray-900">Joinings per Month</h3>
              <div className="flex gap-2 flex-wrap">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-[#57AD85]"></div>
                  <span className="text-sm">Tutors Joined</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-[#F49342]"></div>
                  <span className="text-sm">Student Joined</span>
                </div>
              </div>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={joiningsData}
                  margin={{ top: 8, right: 16, bottom: 25, left: 8 }}
                  barSize={20} // 👈 fixed bar width
                >
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tick={({ x, y, payload }) => (
                      <g>
                        {/* hollow circle positioned between bars and label */}
                        <circle
                          cx={x}
                          cy={y + 5} // 👈 place just below the bars and above the label
                          r={5}
                          stroke="#A2A1A8"
                          strokeWidth={1.5}
                          fill="white"
                        />
                        {/* label */}
                        <text
                          x={x}
                          y={y + 5}   // 👈 keep text aligned relative to circle
                          dy={30}  // 👈 push label further down so it doesn’t overlap circle
                          textAnchor="middle"
                          fill="#A2A1A8"
                          fontSize={14}
                          fontWeight="300"
                          paddingBottom={10}
                        >
                          {payload.value}
                        </text>
                      </g>
                    )}
                  />

                  <YAxis tickLine={false} axisLine={false}
                    tick={{ fill: "#A2A1A8", fontSize: 16, fontWeight: 300, dx: -15 }}
                  />
                  <Tooltip />
                  <Bar
                    dataKey="tutors"
                    name="Tutors"
                    fill={CHART_COLORS.tutors}
                    radius={[4, 4, 4, 4]}
                  />
                  <Bar
                    dataKey="students"
                    name="Students"
                    fill={CHART_COLORS.students}
                    radius={[4, 4, 4, 4]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

      </div>

      {/* {!userDetails?.TFAEnabled && <Enable2FAForm />} */}
      <div id="recaptcha-container"></div>
    </TopHeadingProvider>
  )
}

export default AdminDashboard
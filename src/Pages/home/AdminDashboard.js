"use client"

import { useContext, useEffect, useState } from "react"
import { db } from "../../firebase"
import { collection, doc, query, where, getCountFromServer } from "firebase/firestore"
import { toast } from "react-hot-toast"
import { MyContext } from "../../Context/MyContext"
import { TopHeadingProvider } from "../../Components/Layout"
import { useTopHeading } from "../../Components/Layout"


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

  const { setFirstMessage, setSecondMessage } = useTopHeading()
  
    useEffect(() => {
      setFirstMessage("Welcome User")
      setSecondMessage("Good Morning")
    }, [setFirstMessage, setSecondMessage])

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
  }, [])

  return (
    <TopHeadingProvider firstMessage={`Welcome ${userDetails?.name || "User"}`} secondMessage="Good Morning">
      <div className="flex-1 p-6">
                {/* Top Section: Company Overview + My Schedule */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 items-stretch">
          {/* Company Overview - 4 Statistics Cards in 2x2 grid */}
          <div className="lg:col-span-2 flex flex-col">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
              {/* Total Students Card */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 h-full">
                <div className="flex items-start justify-between h-full">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
                      <i className="fas fa-users text-blue-500"></i>
                      <span>Total Students</span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-3">{studentsCount || 40}</div>
                    <div className="text-xs text-gray-400">Update: Aug 16, 2025</div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-green-500 text-sm font-medium">
                      <span>▲</span>
                      <span>12%</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">vs last month</div>
                  </div>
                </div>
              </div>

              {/* Total Tutors Card */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 h-full">
                <div className="flex items-start justify-between h-full">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
                      <i className="fas fa-chalkboard-teacher text-blue-500"></i>
                      <span>Total Tutors</span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-3">{tutorsCount || 10}</div>
                    <div className="text-xs text-gray-400">Update: Aug 14, 2025</div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-red-500 text-sm font-medium">
                      <span>▼</span>
                      <span>8%</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">vs last month</div>
                  </div>
                </div>
              </div>

              {/* Active Student/Tutors Card */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 h-full">
                <div className="flex items-start justify-between h-full">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
                      <i className="fas fa-user-check text-blue-500"></i>
                      <span>Active Student/Tutors</span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-3">70</div>
                    <div className="text-xs text-gray-400">Update: Aug 10, 2025</div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-red-500 text-sm font-medium">
                      <span>▼</span>
                      <span>16%</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">vs last month</div>
                  </div>
                </div>
              </div>

              {/* Courses Form Card */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 h-full">
                <div className="flex items-start justify-between h-full">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
                      <i className="fas fa-file-alt text-blue-500"></i>
                      <span>Courses Form</span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-3">{requestCoursesFormsCount || 40}</div>
                    <div className="text-xs text-gray-400">Update: Aug 16, 2025</div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-green-500 text-sm font-medium">
                      <span>▲</span>
                      <span>12%</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">vs last month</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Totals Forms - force same height as overview */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 flex flex-col h-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Totals Forms (250)</h3>

            <div className="flex items-center gap-6 mb-6 flex-1">
              {/* Donut Chart */}
              <div className="relative h-32 w-32 flex-shrink-0">
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="4"
                    strokeDasharray="52.1, 47.9"
                    strokeDashoffset="0"
                    strokeLinecap="round"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#3B82F6"
                    strokeWidth="4"
                    strokeDasharray="22.8, 77.2"
                    strokeDashoffset="-52.1"
                    strokeLinecap="round"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#F97316"
                    strokeWidth="4"
                    strokeDasharray="13.9, 86.1"
                    strokeDashoffset="-74.9"
                    strokeLinecap="round"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#EF4444"
                    strokeWidth="4"
                    strokeDasharray="11.2, 88.8"
                    strokeDashoffset="-88.8"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              <div className="flex-1 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-gray-700">Courses Forms</span>
                  </div>
                  <span className="font-medium text-gray-900">52.1%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-700">Student Forms</span>
                  </div>
                  <span className="font-medium text-gray-900">22.8%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <span className="text-gray-700">Tutor Forms</span>
                  </div>
                  <span className="font-medium text-gray-900">13.9%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-gray-700">Contact Us Forms</span>
                  </div>
                  <span className="font-medium text-gray-900">11.2%</span>
                </div>
              </div>
            </div>

            {/* Summary boxes */}
            <div className="grid grid-cols-2 gap-3 mt-auto">
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="text-xs text-gray-600 mb-1">Total Pending Forms</div>
                <div className="text-xl font-bold text-gray-900">204</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="text-xs text-gray-600 mb-1">Total Processed Forms</div>
                <div className="text-xl font-bold text-gray-900">46</div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Credits Sold Chart */}
          <div className="lg:col-span-2 bg-white rounded-lg p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Credits Sold</h3>
              <select className="text-sm border border-gray-300 rounded px-3 py-1">
                <option>This month</option>
              </select>
            </div>
            <div className="relative h-64">
              {/* Placeholder for line chart */}
              <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <i className="fas fa-chart-line text-4xl mb-2"></i>
                  <div>Credits Sold Chart</div>
                  <div className="mt-4 bg-blue-500 text-white px-3 py-1 rounded text-sm">
                    56 Sold
                    <br />
                    <span className="text-xs">25 Aug</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-4">
              <div className="text-sm font-medium text-gray-600">Today</div>
              <div className="flex items-start gap-3">
                <div className="text-sm text-gray-500">2 hours ago</div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">John Deo</div>
                  <div className="text-sm text-blue-600">Submitted a Form</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="text-sm text-gray-500">12:30 am</div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">Will Smith</div>
                  <div className="text-sm text-blue-600">Requested Course</div>
                </div>
              </div>
              <div className="text-sm font-medium text-gray-400 mt-6">Yesterday</div>
              <div className="flex items-start gap-3">
                <div className="text-sm text-gray-500">09:30 pm</div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">Kara Knight</div>
                  <div className="text-sm text-blue-600">Submitted a Form</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Joinings per Month */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Joinings per Month</h3>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Tutors Joined</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span>Student Joined</span>
              </div>
            </div>
          </div>
          <div className="relative h-64">
            {/* Placeholder for bar chart */}
            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <i className="fas fa-chart-bar text-4xl mb-2"></i>
                <div>Joinings per Month Chart</div>
              </div>
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

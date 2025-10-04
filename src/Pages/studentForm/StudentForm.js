import React, { useState, useEffect } from "react";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebase";
import {
  collection,
  doc,
  addDoc,
  deleteDoc,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";
import { Button, ListItemButton, Divider } from "@mui/material";
import { MyContext } from "../../Context/MyContext";
import ProcessedStudentForm from "./ProcessedStudentForm";
import CustomModal from "../../Components/CustomModal/CustomModal"
import SignupForm from "./SignupForm";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import { TopHeadingProvider, useTopHeading } from "../../Components/Layout"

const StudentForm = () => {
  const { isUserLoggedIn, setIsUserLoggedIn, setUserType, setUserDetails, userType } =
    useContext(MyContext);

  const [studentData, setStudentData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedLink, setSelectedLink] = useState(null);
  const [loading, setLoading] = useState(false);
  const [createAccountModal, setCreateAccountModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState({});
  const [processedCount, setProcessedCount] = useState(0); //processed student form count

  const { setFirstMessage, setSecondMessage } = useTopHeading()

  useEffect(() => {
    setFirstMessage("1-1 Student Inquiry")
    setSecondMessage("Show all Student Forms")
  }, [setFirstMessage, setSecondMessage])


  useEffect(() => {
    fetchData();
    fetchProcessedCount();

  }, []);

  const fetchData = () => {
    const ordersRef = collection(db, "adminPanel");
    const customDocRef = doc(ordersRef, "studentForm");
    const orderCollectionRef = collection(customDocRef, "studentForm");

    const orderedQuery = query(orderCollectionRef, orderBy("submittedAt", "desc"));

    const unsubscribe = onSnapshot(
      orderedQuery,
      (querySnapshot) => {
        const fetchedData = [];
        querySnapshot.forEach((doc) => {
          fetchedData.push({ ...doc.data(), id: doc.id });
        });
        fetchedData.sort(
          (a, b) => new Date(b.submittedOn) - new Date(a.submittedOn)
        );
        setStudentData(fetchedData);
      },
      (error) => {
        toast.error("Error fetching data");
      }
    );

    return () => unsubscribe();
  };


  const fetchProcessedCount = async () => {
    const ordersRef = collection(db, "adminPanel");
    const customDocRef = doc(ordersRef, "processedStudentForm");
    const orderCollectionRef = collection(customDocRef, "processedStudentForm");

    const unsubscribe = onSnapshot(orderCollectionRef, (querySnapshot) => {
      setProcessedCount(querySnapshot.size); // total processed docs
    });

    return () => unsubscribe();
  };

  const handleProcessedClick = async (student) => {
    try {
      setLoading(true);
      const ordersRef = collection(db, "adminPanel");
      const customDocRef = doc(ordersRef, "processedStudentForm");
      const orderCollectionRef = collection(customDocRef, "processedStudentForm");

      await addDoc(orderCollectionRef, { ...student, processedAt: new Date() });

      const prevOrdersRef = collection(db, "adminPanel");
      const prevCustomDocRef = doc(prevOrdersRef, "studentForm");
      const prevOrderCollectionRef = collection(prevCustomDocRef, "studentForm");

      const studentDocRef = doc(prevOrderCollectionRef, student.id);
      await deleteDoc(studentDocRef);

      setShowModal(false);
      toast.success("Marked as processed");
    } catch (error) {
      toast.error("Error processing student form");
      console.error("Error processing student form: ", error);
    } finally {
      setLoading(false);
    }
  };

  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const handleChangePage = (event, newPage) => {
    setCurrentPage(newPage);
  };
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const displayedSessions = studentData?.slice(startIndex, endIndex);

  function formatDateTime(timestampData) {
    if (!timestampData) return "N/A";
    const dateObject = new Date(
      timestampData.seconds * 1000 + timestampData.nanoseconds / 1000000
    );
    const formattedTime = dateObject.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    const formattedDate = dateObject.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    return { date: formattedDate, time: formattedTime };
  }

  const getVisiblePages = (currentPage, totalPages, maxVisible = 4) => {
    let startPage = Math.max(currentPage - Math.floor(maxVisible / 2), 1);
    let endPage = startPage + maxVisible - 1;

    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(endPage - maxVisible + 1, 1);
    }

    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  const visiblePages = getVisiblePages(currentPage, Math.ceil(studentData?.length / itemsPerPage));

  return (
    <TopHeadingProvider>

      <div className="h-full bg-white p-6 grid place-items-start">
        <div className="w-full mx-auto border border-gray-200 rounded-lg p-6 h-full">
          <h1 className="text-[24px] font-semibold mb-6">
            Student Forms ({(studentData?.length || 0) + (processedCount || 0)})
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* Pending Forms */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="mb-6 pb-2 border-b border-gray-200 ">
                <h2 className="text-[20px] font-semibold text-[#16151C]">
                  Pending Forms
                </h2>
                <span className="text-[14px] font-light text-[#A2A1A8]">
                  {String(studentData?.length).padStart(2, "0")} Forms
                </span>
              </div>

              <div className="space-y-3">
                {displayedSessions.map((student, index) => (
                  <ListItemButton
                    key={index}
                    onClick={() => {
                      setSelectedLink(student);
                      setShowModal(true);
                    }}
                    sx={{
                      borderRadius: "8px",
                      p: 1,
                      pl: 0,
                      cursor: "pointer",
                      "&:hover": { backgroundColor: "#F9FAFB" },
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div className="flex flex-col">
                      <span className="font-light text-[16px] text-[#16151C]">
                        {student?.userDetails?.firstName}{" "}
                        {student?.userDetails?.lastName}
                      </span>
                      <span className="text-[12px] font-light text-[#A2A1A8]">
                        {student?.userDetails?.email || "N/A"}
                      </span>
                    </div>
                    <ChevronRightIcon className="w-5 h-5 text-[#16151C]" />
                  </ListItemButton>
                ))}
              </div>

              {studentData?.length === 0 && (
                <div className="text-center text-[#16151C] pb-4 mb-2">
                  No Pending Forms
                </div>
              )}
              {studentData?.length > itemsPerPage && (
                <div className="mt-6 flex items-center justify-center px-4 py-3 bg-white">
                  <Stack direction="row" spacing={1} alignItems="center">
                    {/* Previous button */}
                    <Button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                      sx={{ minWidth: '32px', padding: '4px' }}
                    >
                      <svg
                        width="6"
                        height="12"
                        viewBox="0 0 6 12"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M5.46849 11.5856C5.79194 11.3269 5.84438 10.8549 5.58562 10.5315L1.96044 5.99997L5.58562 1.46849C5.84438 1.14505 5.79194 0.673077 5.46849 0.41432C5.14505 0.155562 4.67308 0.208004 4.41432 0.53145L0.414321 5.53145C0.19519 5.80536 0.19519 6.19458 0.414321 6.46849L4.41432 11.4685C4.67308 11.7919 5.14505 11.8444 5.46849 11.5856Z"
                          fill="#16151C"
                        />
                      </svg>
                    </Button>

                    {/* Page numbers */}
                    {getVisiblePages(currentPage, Math.ceil(studentData?.length / itemsPerPage), 4).map((page) => (
                      <Button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        sx={{
                          width: page === currentPage ? 35 : 32,
                          minWidth: 'unset',
                          height: 36,
                          borderRadius: page === currentPage ? '8px' : '50px',
                          padding: '7px 12px',
                          gap: '10px',
                          borderWidth: page === currentPage ? 1 : 0,
                          border: page === currentPage ? '1px solid #4071B6' : 'none',
                          background: '#FFFFFF',
                          color: page === currentPage ? '#4071B6' : '#16151C',
                          fontWeight: page === currentPage ? 600 : 300,
                          fontSize: '14px',
                        }}
                      >
                        {page}
                      </Button>
                    ))}

                    {/* Next button */}
                    <Button
                      disabled={currentPage === Math.ceil(studentData?.length / itemsPerPage)}
                      onClick={() => setCurrentPage(currentPage + 1)}
                      sx={{ minWidth: '32px', padding: '4px' }}
                    >
                      <svg
                        width="6"
                        height="12"
                        viewBox="0 0 6 12"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M0.531506 11.5856C0.20806 11.3269 0.155619 10.8549 0.414376 10.5315L4.03956 5.99997L0.414376 1.46849C0.155618 1.14505 0.208059 0.673077 0.531506 0.41432C0.854952 0.155562 1.32692 0.208004 1.58568 0.53145L5.58568 5.53145C5.80481 5.80536 5.80481 6.19458 5.58568 6.46849L1.58568 11.4685C1.32692 11.7919 0.854953 11.8444 0.531506 11.5856Z"
                          fill="#16151C"
                        />
                      </svg>
                    </Button>
                  </Stack>
                </div>
              )}

            </div>

            <ProcessedStudentForm />
          </div>

          {showModal && selectedLink && (
            <CustomModal
              open={showModal}
              onClose={() => {
                setShowModal(false);
                setSelectedLink({});
              }}
              PaperProps={{
                sx: {
                  width: "90vw",
                  maxWidth: "1200px",
                  height: "auto",
                  maxHeight: "90vh",
                  overflow: "hidden",
                  borderRadius: "20px",
                  padding: 0,
                },
              }}
            >
              <div className="h-full overflow-auto p-6" style={{ boxSizing: "border-box" }}>
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-[#16151C]">
                    Pending Forms{" "}
                    <span className="font-light text-lg">(1-1 Student Inquiry Form)</span>
                  </h2>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="text"
                      size="small"
                      sx={{
                        color: "#16151C",
                        textTransform: "none",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        minWidth: "unset",
                        padding: "4px 8px",
                        borderRadius: "6px",
                        "&:hover": { backgroundColor: "#f5f5f5" },
                      }}
                    >
                      <svg
                        className="w-4 h-4"
                        width="16"
                        height="18"
                        viewBox="0 0 16 18"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        style={{ color: "#16151C" }}
                      >
                        <path
                          d="M11 3H11.75C13.4069 3 14.75 4.34315 14.75 6V13.5C14.75 15.1569 13.4069 16.5 11.75 16.5H4.25C2.59315 16.5 1.25 15.1569 1.25 13.5V6C1.25 4.34315 2.59315 3 4.25 3H5M11 3C11 3.82843 10.3284 4.5 9.5 4.5H6.5C5.67157 4.5 5 3.82843 5 3M11 3C11 2.17157 10.3284 1.5 9.5 1.5H6.5C5.67157 1.5 5 2.17157 5 3M5 7.5H11M5 10.5H11M5 13.5H8"
                          stroke="#16151C"
                          strokeWidth="1.125"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span className="font-light text-xs">Copy Text</span>
                    </Button>
                    <button
                      onClick={() => setShowModal(false)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <svg
                        className="w-5 h-5 text-[#16151C]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
                <Divider sx={{ borderColor: "#E5E7EB", mb: 2 }} />


                {/* ---------------- Section 1 ---------------- */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-36 text-sm border-b border-gray-200 pb-6">
                  {/* Column 1 */}
                  <div className="space-y-2 text-[14px]">
                    <div className="flex">
                      <span className="text-[#16151C] font-light w-40">Program:</span>
                      <span className="font-medium text-[#16151C]">
                        {selectedLink?.program || "N/A"}
                      </span>
                    </div>

                    <div className="flex">
                      <span className="text-[#16151C] font-light w-40">Class:</span>
                      <span className="font-medium text-[#16151C]">
                        {selectedLink?.class || "N/A"}
                      </span>
                    </div>

                    <div className="flex items-start">
                      <span className="text-[#16151C] font-light w-40">Subjects:</span>
                      <div className="font-medium text-[#16151C] space-y-1">
                        {selectedLink?.selectedSubjects?.map((sub, i) => (
                          <div key={i}>{sub}</div>
                        ))}
                      </div>
                    </div>

                    <div className="flex">
                      <span className="text-[#16151C] font-light w-40">Tutoring Support:</span>
                      <span className="font-medium text-[#16151C]">
                        {selectedLink?.tutoringSupport || "N/A"}
                      </span>
                    </div>

                    <div className="flex">
                      <span className="text-[#16151C] font-light w-40">Package:</span>
                      <span className="font-medium text-[#16151C]">
                        {selectedLink?.package || "N/A"}
                      </span>
                    </div>

                    <div className="flex">
                      <span className="text-[#16151C] font-light w-40">Hours Requested:</span>
                      <span className="font-medium text-[#16151C]">
                        {selectedLink?.hours || "N/A"}
                      </span>
                    </div>
                  </div>


                  {/* Column 2 */}
                  <div className="space-y-2 text-[14px]">
                    <div className="flex items-start">
                      <span className="text-[#16151C] font-light w-52">Lesson Dates:</span>
                      <div className="font-medium text-[#16151C] space-y-1">
                        {selectedLink?.lessonDates?.map((date, i) => (
                          <div key={i}>{date}</div>
                        ))}
                      </div>
                    </div>

                    <div className="flex">
                      <span className="text-[#16151C] font-light w-52">Time Zone:</span>
                      <span className="font-medium text-[#16151C]">
                        {selectedLink?.timeZone || "N/A"}
                      </span>
                    </div>

                    <div className="flex">
                      <span className="text-[#16151C] font-light w-52">Support Needed:</span>
                      <span className="font-medium text-[#16151C]">
                        {selectedLink?.guidanceAndSupport?.needed ? "Yes" : "No"}
                      </span>
                    </div>

                    <div className="flex">
                      <span className="text-[#16151C] font-light w-52">Total Cost:</span>
                      <span className="font-medium text-[#16151C]">
                        £ {selectedLink?.totalCost || "N/A"}
                      </span>
                    </div>

                    <div className="flex">
                      <span className="text-[#16151C] font-light w-52">Total Cost After Support:</span>
                      <span className="font-medium text-[#16151C]">
                        £ {selectedLink?.totalCostAfterGuidanceAndSupport || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ---------------- Section 2 ---------------- */}
                {selectedLink?.guidanceAndSupport?.needed && (
                  <div className="mt-8 border-b border-gray-200 pb-6 text-sm">
                    <h3 className="font-medium text-[#16151C] mb-4">
                      Guidance & Support Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-[14px]">
                      <div className="space-y-2">
                        <div className="flex">
                          <span className="text-[#16151C] w-44 font-light">
                            Assignment Types:
                          </span>
                          <span className="font-medium text-[#16151C]">
                            {selectedLink?.guidanceAndSupport?.assignmentType?.join(", ") ||
                              "N/A"}
                          </span>
                        </div>
                        <div className="flex">
                          <span className="text-[#16151C] w-44 font-light">Query:</span>
                          <span className="font-medium text-[#16151C]">
                            {selectedLink?.guidanceAndSupport?.query || "N/A"}
                          </span>
                        </div>
                        <div className="flex">
                          <span className="text-[#16151C] w-44 font-light">
                            Requested Hours:
                          </span>
                          <span className="font-medium text-[#16151C]">
                            {selectedLink?.guidanceAndSupport?.hours || "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ---------------- Section 3 ---------------- */}
                <div className="mt-8 text-sm">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-20">
                    {/* Student Info */}
                    <div>
                      <h3 className="font-medium text-[#16151C] mb-4">Student Info</h3>
                      <div className="space-y-2">
                        <div>
                          <span className="text-[#16151C] font-light">Name: </span>
                          <span className="text-[#16151C] font-light">
                            {selectedLink?.userDetails?.firstName}{" "}
                            {selectedLink?.userDetails?.lastName}
                          </span>
                        </div>
                        <div>
                          <span className="text-[#16151C] font-light">Email: </span>
                          <span className="text-[#16151C] font-light">
                            {selectedLink?.userDetails?.email}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Parent Info */}
                    <div>
                      <h3 className="font-medium text-[#16151C] mb-4">Parent Info</h3>
                      <div className="space-y-2">
                        <div>
                          <span className="text-[#16151C] font-light">Name: </span>
                          <span className="text-[#16151C] font-light">
                            {selectedLink?.userDetails?.parentFirstName}{" "}
                            {selectedLink?.userDetails?.parentLastName}
                          </span>
                        </div>
                        <div>
                          <span className="text-[#16151C] font-light">Email: </span>
                          <span className="text-[#16151C] font-light">
                            {selectedLink?.userDetails?.parentEmail}
                          </span>
                        </div>
                        <div>
                          <span className="text-[#16151C] font-light">Relation: </span>
                          <span className="text-[#16151C] font-light">
                            {selectedLink?.userDetails?.relation || "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Billing Info */}
                    <div>
                      <h3 className="font-medium text-[#16151C] mb-4">Billing Info</h3>
                      <div className="space-y-2">
                        <div>
                          <span className="text-[#16151C] font-light">Name: </span>
                          <span className="text-[#16151C] font-light">
                            {selectedLink?.billingInfo?.fullName || "N/A"}
                          </span>
                        </div>
                        <div>
                          <span className="text-[#16151C] font-light">Email: </span>
                          <span className="text-[#16151C] font-light">
                            {selectedLink?.billingInfo?.email || "N/A"}
                          </span>
                        </div>
                        <div>
                          <span className="text-[#16151C] font-light">Contact No: </span>
                          <span className="text-[#16151C] font-light">
                            {selectedLink?.billingInfo?.contactNo || "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>


                {/* ---------------- Footer Buttons ---------------- */}
                <div className="flex gap-3 justify-end mt-8 pt-6 border-t border-gray-200">
                  <Button
                    onClick={() => setShowModal(false)}
                    variant="outlined"
                    sx={{
                      width: 166,
                      height: 50,
                      borderRadius: "8px",
                      borderColor: "#A2A1A833",
                      fontSize: "16px",
                      fontWeight: 500,
                      color: "#16151C",
                      textTransform: "none",
                      "&:hover": {
                        borderColor: "#9CA3AF",
                        backgroundColor: "#F9FAFB",
                      },
                    }}
                  >
                    Cancel
                  </Button>



                  <Button
                    disabled={loading}
                    variant="outlined"
                    sx={{
                      width: 166,
                      height: 50,
                      borderRadius: "8px",
                      borderColor: "#A2A1A833",
                      fontSize: "16px",
                      fontWeight: 500,
                      color: "#16151C",
                      textTransform: "none",
                      padding: 0,
                      "&:hover": {
                        borderColor: "#9CA3AF",
                        backgroundColor: "#F9FAFB",
                      },
                      "&:disabled": { backgroundColor: "#9CA3AF" },
                    }}
                    onClick={() => handleProcessedClick(selectedLink)}
                  >
                    {loading ? "Processing..." : "Mark as Processed"}
                  </Button>

                  <Button
                    variant="contained"
                    sx={{
                      width: 166,
                      height: 50,
                      borderRadius: "8px",
                      backgroundColor: "#4071B6", // green for create
                      fontSize: "16px",
                      fontWeight: 500,
                      color: "#FFFFFF",
                      textTransform: "none",
                      "&:hover": { backgroundColor: "#4071B6" },
                    }}
                    onClick={() => {
                      setCreateAccountModal(true);
                      setSelectedStudent(selectedLink);
                    }}
                  >
                    Create Account
                  </Button>
                </div>
              </div>
            </CustomModal>

          )}
          <CustomModal
            open={createAccountModal}
            onClose={() => setCreateAccountModal(false)}
            PaperProps={{
              sx: {
                width: "90vw",
                maxWidth: "800px",
                height: "auto",
                maxHeight: "90vh",
                overflow: "hidden",
                borderRadius: "20px",
                padding: 0,
              },
            }}
          >
            <SignupForm
              setCreateAccountModal={setCreateAccountModal}
              student={selectedStudent}
            />
          </CustomModal>

        </div>
      </div>
    </TopHeadingProvider>

  );
};

export default StudentForm;

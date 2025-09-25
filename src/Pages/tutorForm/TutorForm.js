import React, { useState, useEffect, useContext } from "react";
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
import SignupForm from "./SignupForm";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import ProcessedTutorForm from "./ProcessedTutorForm";
import CustomModal from "../../Components/CustomModal/CustomModal"
import { TopHeadingProvider, useTopHeading } from "../../Components/Layout"


const TutorForm = () => {
  const { isUserLoggedIn, setIsUserLoggedIn, setUserType, setUserDetails, userType } =
    useContext(MyContext);

  const [tutors, setTutors] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedLink, setSelectedLink] = useState(null);
  const [loading, setLoading] = useState(false);
  const [createAccountModal, setCreateAccountModal] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState({});
  const [processedCount, setProcessedCount] = useState(0); //processed student form count

  const navigate = useNavigate();

  const { setFirstMessage, setSecondMessage } = useTopHeading()


  useEffect(() => {
    setFirstMessage("Tutor Resume")
    setSecondMessage("Show all Tutor Forms")
  }, [setFirstMessage, setSecondMessage])

  useEffect(() => {
    fetchData();
    fetchProcessedCount();

  }, []);

  const fetchData = () => {
    const ordersRef = collection(db, "adminPanel");
    const customDocRef = doc(ordersRef, "teacherForm");
    const orderCollectionRef = collection(customDocRef, "teacherForm");

    const orderedQuery = query(orderCollectionRef, orderBy("submittedAt", "desc"));

    const unsubscribe = onSnapshot(
      orderedQuery,
      (querySnapshot) => {
        const fetchedData = [];
        querySnapshot.forEach((doc) => {
          fetchedData.push({ ...doc.data(), id: doc.id });
        });
        setTutors(fetchedData);
      },
      (error) => {
        toast.error("Error fetching tutor forms");
      }
    );

    return () => unsubscribe();
  };

  const fetchProcessedCount = async () => {
    const ordersRef = collection(db, "adminPanel");
    const customDocRef = doc(ordersRef, "processedTutorForm");
    const orderCollectionRef = collection(customDocRef, "processedTutorForm");

    const unsubscribe = onSnapshot(orderCollectionRef, (querySnapshot) => {
      setProcessedCount(querySnapshot.size); // total processed docs
    });

    return () => unsubscribe();
  };

  const handleProcessedClick = async (tutor) => {
    try {
      setLoading(true);
      const ordersRef = collection(db, "adminPanel");
      const customDocRef = doc(ordersRef, "processedTutorForm");
      const orderCollectionRef = collection(customDocRef, "processedTutorForm");

      await addDoc(orderCollectionRef, { ...tutor, processedAt: new Date() });

      const prevOrdersRef = collection(db, "adminPanel");
      const prevCustomDocRef = doc(prevOrdersRef, "teacherForm");
      const prevOrderCollectionRef = collection(prevCustomDocRef, "teacherForm");

      const tutorDocRef = doc(prevOrderCollectionRef, tutor.id);
      await deleteDoc(tutorDocRef);

      setShowModal(false);
      toast.success("Marked as processed");
    } catch (error) {
      toast.error("Error processing tutor form");
      console.error("Error processing tutor form: ", error);
    } finally {
      setLoading(false);
    }

  };

  // Pagination
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const handleChangePage = (event, newPage) => {
    setCurrentPage(newPage);
  };
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const displayedSessions = tutors?.slice(startIndex, endIndex);

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
    return `${formattedTime} - ${formattedDate}`;

  }

  return (
    <TopHeadingProvider>
      <div className="h-full bg-white p-6 grid place-items-start">
        <div className="w-full mx-auto border border-gray-200 rounded-lg p-6 h-full">
          <h1 className="text-2xl font-semibold text-gray-900 mb-6">
            Tutor Forms ({(tutors?.length || 0) + (processedCount || 0)})
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* Pending Forms */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="mb-6 pb-2 border-b border-gray-200 ">
                <h2 className="text-lg font-semibold text-[#16151C]">
                  Pending Forms
                </h2>
                <span className="text-sm text-[#16151C]">
                  {String(tutors?.length).padStart(2, "0")} Forms
                </span>
              </div>

              <div className="space-y-3">
                {displayedSessions.map((tutor, index) => (
                  <ListItemButton
                    key={index}
                    onClick={() => {
                      setSelectedLink(tutor);
                      setShowModal(true);
                    }}
                    sx={{
                      borderRadius: "8px",
                      p: 1,
                      cursor: "pointer",
                      "&:hover": { backgroundColor: "#F9FAFB" },
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div className="flex flex-col">
                      <span className="font-medium text-[#16151C]">
                        {tutor?.firstName} {tutor?.lastName}
                      </span>
                      <span className="text-sm text-[#16151C]">
                        {tutor?.email || "N/A"}
                      </span>
                    </div>
                    <ChevronRightIcon className="w-5 h-5 text-[#16151C]" />
                  </ListItemButton>
                ))}
              </div>

              {tutors?.length === 0 && (
                <div className="text-center text-[#16151C] pb-4 mb-2">
                  No Pending Forms
                </div>
              )}
              {tutors?.length > itemsPerPage && (
                <div className="flex items-center justify-between mt-6 py-3 bg-white">
                  <div className="text-sm text-gray-700">
                    Showing {startIndex + 1} to {Math.min(endIndex, tutors.length)} out of{" "}
                    {tutors.length} records
                  </div>
                  <Stack spacing={2}>
                    <Pagination
                      count={Math.ceil(tutors?.length / itemsPerPage)}
                      page={currentPage}
                      onChange={handleChangePage}
                      color="primary"
                      size="small"
                    />
                  </Stack>
                </div>
              )}
            </div>

            {/* Processed Tutors */}
            <ProcessedTutorForm />
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
                  maxWidth: "760px",
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
                    Pending Forms <span className="font-light text-lg">(Tutor Forms)</span>
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
                <Divider sx={{ borderColor: "#E5E7EB", mb: 3 }} />

                {/* Main Grid */}
                <div className="grid grid-cols-[auto_1fr] gap-y-3 gap-x-12 text-sm">
                  <span className="text-[#16151C] font-medium">Name:</span>
                  <span className="text-[#16151C] font-semibold">
                    {selectedLink?.firstName} {selectedLink?.lastName}
                  </span>

                  {/* <span className="text-[#16151C] font-medium">Submission Date:</span>
                <span className="text-[#16151C] font-semibold">
                  {formatDateTime(selectedLink?.submittedAt)?.split(" - ")[1] || "N/A"}
                </span>

                <span className="text-[#16151C] font-medium">Submission Time:</span>
                <span className="text-[#16151C] font-semibold">
                  {formatDateTime(selectedLink?.submittedAt)?.split(" - ")[0] || "N/A"}
                </span> */}

                  <span className="text-[#16151C] font-medium">Email:</span>
                  <span className="text-[#16151C] font-semibold">{selectedLink?.email || "N/A"}</span>

                  <span className="text-[#16151C] font-medium">City:</span>
                  <span className="text-[#16151C] font-semibold">{selectedLink?.city || "N/A"}</span>

                  <span className="text-[#16151C] font-medium">State:</span>
                  <span className="text-[#16151C] font-semibold">{selectedLink?.state || "N/A"}</span>

                  <span className="text-[#16151C] font-medium">Zip:</span>
                  <span className="text-[#16151C] font-semibold">{selectedLink?.zip || "N/A"}</span>

                  <span className="text-[#16151C] font-medium">Programmes:</span>
                  <span className="text-[#16151C] font-semibold">
                    {selectedLink?.programmes?.join(", ") || "N/A"}
                  </span>

                  <span className="text-[#16151C] font-medium">Subjects:</span>
                  <span className="text-[#16151C] font-semibold">
                    {selectedLink?.subjects?.join(", ") || "N/A"}
                  </span>

                  <span className="text-[#16151C] font-medium">Assignments:</span>
                  <span className="text-[#16151C] font-semibold">
                    {selectedLink?.assignments?.join(", ") || "N/A"}
                  </span>

                  <span className="text-[#16151C] font-medium">Curricula:</span>
                  <span className="text-[#16151C] font-semibold">
                    {selectedLink?.curricula?.join(", ") || "N/A"}
                  </span>


                </div>

                {/* Footer Buttons */}
                <div className="flex gap-3 justify-between mt-8 pt-6 border-t border-gray-200">
                  {/* Left Side: View Resume */}
                  {selectedLink?.resume ? (
                    <Button
                      component="a"
                      href={selectedLink?.resume}
                      download
                      variant="outlined"
                      sx={{
                        width: 166,
                        height: 50,
                        borderRadius: "8px",
                        borderColor: "#4071B6",
                        backgroundColor: "#4071B60D",
                        fontSize: "16px",
                        fontWeight: 500,
                        color: "#4071B6",
                        textTransform: "none",
                        padding: 0,
                        "&:hover": {
                          borderColor: "#4071B6",
                          backgroundColor: "#4071b636",
                        },
                      }}
                    >
                      Download Resume
                    </Button>

                  ) : (
                    <Button
                      variant="outlined"
                      disabled
                      sx={{
                        width: 166,
                        height: 50,
                        borderRadius: "8px",
                        borderColor: "#D1D5DB",
                        fontSize: "16px",
                        fontWeight: 500,
                        color: "#9CA3AF",
                        textTransform: "none",
                      }}
                    >
                      No Resume
                    </Button>
                  )}

                  {/* Right Side: Other Actions */}
                  <div className="flex gap-3">
                    <Button
                      disabled={loading}
                      variant="outlined"
                      sx={{
                        width: 166,
                        height: 50,
                        borderRadius: "8px",
                        borderRadius: "8px",
                        borderColor: "#D1D5DB",
                        fontSize: "16px",
                        fontWeight: 500,
                        color: "#374151",
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
                      onClick={() => {
                        navigate("/signupform", { state: { tutor: selectedLink } });
                      }}
                      sx={{
                        width: 166,
                        height: 50,
                        borderRadius: "8px",
                        backgroundColor: "#4071B6",
                        fontSize: "16px",
                        fontWeight: 500,
                        color: "#FFFFFF",
                        textTransform: "none",
                        "&:hover": { backgroundColor: "#305a91" },
                      }}
                    >
                      Create Account
                    </Button>

                  </div>
                </div>
              </div>
            </CustomModal>
          )}

        </div>
      </div>
    </TopHeadingProvider>
  );
};

export default TutorForm;

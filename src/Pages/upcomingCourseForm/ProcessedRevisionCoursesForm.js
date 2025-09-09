import React from "react";
import { useEffect, useState } from "react";
import { db } from "../../firebase";
import {
  collection,
  doc,
  onSnapshot,
  deleteDoc,
  orderBy,
  query,
} from "firebase/firestore";

import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";

import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import { Button } from "@mui/material";
import { toast } from "react-hot-toast";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogTitle from "@mui/material/DialogTitle";
import Slide from "@mui/material/Slide";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const ProcessedRevisionCoursesForm = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedLink, setSelectedLink] = useState({});
  const [loading, setLoading] = useState(false);
  const [contactUsSubmissions, setContactUsSubmissions] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const ordersRef = collection(db, "adminPanel");
    const customDocRef = doc(ordersRef, "processedUpcomingCoursesForm");
    const orderCollectionRef = collection(
      customDocRef,
      "processedUpcomingCoursesForm"
    );

    const orderedQuery = query(orderCollectionRef, orderBy("processedAt", "desc"));
    const unsubscribe = onSnapshot(
      orderedQuery,
      (querySnapshot) => {
        const fetchedData = [];
        querySnapshot.forEach((doc) => {
          fetchedData.push({ ...doc.data(), id: doc.id });
        });

        fetchedData.sort(
          (a, b) => b.submittedAt.toDate() - a.submittedAt.toDate()
        );

        setContactUsSubmissions(fetchedData);
      },
      (error) => {
        alert("Error fetching data: ", error);
      }
    );

    return () => {
      unsubscribe();
    };
  };

  const handleDeleteClick = async (student) => {
    try {
      setLoading(true);
      const prevOrdersRef = collection(db, "adminPanel");
      const prevCustomDocRef = doc(prevOrdersRef, "processedUpcomingCoursesForm");
      const prevOrderCollectionRef = collection(
        prevCustomDocRef,
        "processedUpcomingCoursesForm"
      );

      const studentDocRef = doc(prevOrderCollectionRef, student.id);
      await deleteDoc(studentDocRef);

      setShowModal(false);
      toast.success("Deleted successfully");
    } catch (error) {
      toast.error("Error deleting student form");
      console.error("Error deleting student form: ", error);
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
  const displayedSessions = contactUsSubmissions?.slice(startIndex, endIndex);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Processed Forms</h2>
        <span className="text-sm text-gray-500">
          {String(contactUsSubmissions?.length).padStart(2, "0")} Forms
        </span>
      </div>

      {displayedSessions.map((item, index) => (
        <Accordion key={index} className="shadow-sm rounded-lg border border-gray-200">
          <AccordionSummary
            expandIcon={<ExpandMoreIcon className="text-gray-500" />}
            aria-controls="panel1-content"
            id="panel1-header"
            className="bg-gray-50 hover:bg-gray-100 rounded-t-lg"
          >
            <div className="flex-1 flex justify-between items-center">
              <span className="font-medium text-gray-800">{item.userDetails?.email}</span>
            </div>
          </AccordionSummary>
          <AccordionDetails className="bg-white border-t border-gray-100">
            <div className="space-y-3 text-sm text-gray-700">
              <div className="border-b border-gray-200 pb-3">
                <div><strong>Course Heading:</strong> {item.courseData?.heading}</div>
                <div><strong>Course Tagline:</strong> {item.courseData?.tagline}</div>
                <div><strong>Submitted By UserType:</strong> {item?.userType}</div>
                <div><strong>User Timezone:</strong> {item?.timeZone}</div>
                <div><strong>Objective:</strong>
                  <ul className="list-disc list-inside ml-4">{item.objective?.map((i, idx) => <li key={idx}>{i}</li>)}</ul>
                </div>
                <div><strong>Seeking Tutoring For:</strong>
                  <ul className="list-disc list-inside ml-4">{item.seekingTutoringFor?.map((i, idx) => <li key={idx}>{i}</li>)}</ul>
                </div>
                <div><strong>How often to take lessons:</strong>
                  <ul className="list-disc list-inside ml-4">{item?.howOftenToTakeLesson?.map((i, idx) => <li key={idx}>{i}</li>)}</ul>
                </div>
                <div><strong>Tutor Support Type:</strong> Certified IB Examiner</div>
                <div><strong>Course Type:</strong> {item?.selectedCourse?.title}</div>
                <div><strong>Total Teaching Hours:</strong> {item?.selectedCourse?.hours * item?.seekingTutoringFor?.length}</div>
                <div><strong>Price:</strong> £ {item?.quotedPrice}</div>
              </div>

              <div className="border-b border-gray-200 pb-3">
                <div><strong>Want Guidance and Support:</strong> {item?.wantGuidanceAndSupport}</div>
                {item?.wantGuidanceAndSupport === "yes" && (
                  <div className="space-y-2 mt-2">
                    <div><strong>Guidance & Support Subjects:</strong>
                      <ul className="list-disc list-inside ml-4">{item?.guidanceAndSupportSubjects?.map((i, idx) => <li key={idx}>{i}</li>)}</ul>
                    </div>
                    <div><strong>Guidance and Support Objective:</strong> {item?.guidanceObjectiveTitle}</div>
                    <div><strong>Tutor Level:</strong> {item?.guidanceObjective?.level}</div>
                    <div><strong>Tutor Support Type:</strong> {item?.guidanceObjective?.diploma}</div>
                    <div><strong>Price:</strong> £ {item?.guidancePrice}</div>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <div className="font-medium">Student&apos;s Information:</div>
                <div><strong>First Name:</strong> {item?.userDetails?.firstName}</div>
                <div><strong>Last Name:</strong> {item?.userDetails?.lastName}</div>
                <div><strong>Email:</strong> {item?.userDetails?.email}</div>
                <div><strong>Phone:</strong> {item?.userDetails?.phone}</div>
                <div><strong>Address:</strong> {item?.userDetails?.address || "N/A"}</div>
                <div><strong>City:</strong> {item?.userDetails?.city || "N/A"}</div>
                <div><strong>ZIP:</strong> {item?.userDetails?.zip || "N/A"}</div>
                <div><strong>Country:</strong> {item?.userDetails?.country?.label || "N/A"}</div>
                <div><strong>GMT:</strong> {item?.userDetails?.gmtTimezone || "N/A"}</div>
              </div>

              <div className="space-y-1 mt-4">
                <div className="font-medium">Parent&apos;s Information:</div>
                <div><strong>First Name:</strong> {item?.userDetails?.parentFirstName}</div>
                <div><strong>Last Name:</strong> {item?.userDetails?.parentLastName}</div>
                <div><strong>Email:</strong> {item?.userDetails?.parentEmail}</div>
                <div><strong>Phone:</strong> {item?.userDetails?.parentPhone}</div>
                <div><strong>Relation:</strong> {item?.userDetails?.relation}</div>
              </div>

              <Button
                variant="outlined"
                color="error"
                onClick={() => {
                  setShowModal(true);
                  setSelectedLink(item);
                }}
                className="mt-4 w-full border-red-500 text-red-600 hover:bg-red-50"
              >
                Delete
              </Button>
            </div>
          </AccordionDetails>
        </Accordion>
      ))}

      {contactUsSubmissions?.length > itemsPerPage && (
        <div className="flex justify-center items-center mt-6">
          <Stack spacing={2}>
            <Pagination
              count={Math.ceil(contactUsSubmissions?.length / itemsPerPage)}
              page={currentPage}
              onChange={handleChangePage}
            />
          </Stack>
        </div>
      )}

      {contactUsSubmissions?.length === 0 && (
        <div className="text-center text-gray-400 py-12">No Processed Forms</div>
      )}

      <Dialog
        open={showModal}
        TransitionComponent={Transition}
        keepMounted
        onClose={() => {
          setShowModal(false);
        }}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle className="text-lg font-semibold">
          Please confirm to delete this form.
        </DialogTitle>
        <DialogActions className="p-4">
          <Button
            variant="outlined"
            onClick={() => {
              setShowModal(false);
            }}
            className="border-gray-300 text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </Button>
          <Button
            disabled={loading}
            color="error"
            variant="contained"
            onClick={() => handleDeleteClick(selectedLink)}
            className="bg-red-600 hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? "Deleting" : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ProcessedRevisionCoursesForm;

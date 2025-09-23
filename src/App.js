import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Home from "./Pages/home/home";
// import Footer from "./Components/footer";
import ScrollToTop from "./Components/ScrollToTop";
import { useContext } from "react";
import { MyContext } from "./Context/MyContext";
import { useState, useEffect } from "react";
import Sidebar from "./Sidebar/Sidebar";
import SignUpOnly from "./Pages/SignUp/SignUpOnly";

import StudentForm from "./Pages/studentForm/StudentForm";
import TutorForm from "./Pages/tutorForm/TutorForm";
import SignupForm from "./Pages/tutorForm/SignupForm";

import Blogs from "./Pages/Blogs/Blogs";
import EditBlog from "./Pages/Blogs/EditBlog";

import ManageLinks from "./Pages/ManageLinks/ManageLinks";
import ViewInvoices from "./Pages/ManageLinks/ViewInvoices";

import TeacherCourses from "./Pages/teacherPages/TeacherCourses";
import MyStudents from "./Pages/teacherPages/MyStudents";
import UpcommingCourses from "./Pages/UpcommingCourses/UpcommingCourses";
import NavBar from "./Components/navbar";
import JobOpening from "./Pages/teacherPages/jobOpenings/JobOpening";
import ProfileAndFinance from "./Pages/teacherPages/profileAndFinance/ProfileAndFinance";
import { SupportAndTraining } from "./Pages/SupportAndTraining/SupportAndTraining";
import { Notifications } from "./Pages/Notifications/Notifications";
import { CreateOrder } from "./Pages/adminPages/CreateOrder";
import {ApplicationsList} from "./Pages/adminPages/createOrderPages/ApplicationsList" //inserted view applicants

import ContactUsForm from "./Pages/contactUsForm/ContactUsForm";
import RequestCoursesForm from "./Pages/requestCoursesForm/RequestCoursesForm";
import RevisionCoursesForm from "./Pages/revisionCourseForm/RevisionCoursesForm";

import { Toaster } from "react-hot-toast";
import { TutorPages } from "./Pages/adminPages/tutorPages/TutorPages";
import TutorDetail from "./Pages/adminPages/tutorPages/TutorDetail"; //inserted tutor Detail
import {EditProfile} from "./Pages/adminPages/tutorPages/profileAndFinance/EditProfile"; //inserted edit profile
import MySubscriptions from "./Pages/studentPages/mySubscriptions/MySubscriptions";
import NewCourses from "./Pages/studentPages/newCourses/NewCourses";
import ProfileAndFinanceStudent from "./Pages/studentPages/profileAndFinance/ProfileAndFinanceStudent";
import SupportBlogs from "./Pages/supportBlogs/SupportBlogs";
import CreateSupportBlog from "./Pages/supportBlogs/createSupportBlogs"; //inserted create support blog
import Details from "./Pages/SupportAndTraining/Details";
import { JobApplication } from "./Pages/jobApplication/JobApplication";
import SEO from "./Pages/adminPages/SEO/SEO";
import Login from "./Pages/Login/Login";
import Layout from "./Components/Layout";
import CustomModal from "./Pages/Login/CustomModal/CustomModal";
import Loader from "./Pages/Login/Loader/Loader";
import UpcomingCourseForm from "./Pages/upcomingCourseForm/UpcomingCourseForm";
import {CourseTabs} from "./Pages/coursesTabbed/CourseTabs" //inserted coursesTabb
import {ManageSubjects} from "./Pages/adminPages/tutorPages/ManageSubjects"


function App() {
  const { isUserLoggedIn, userType, loading } = useContext(MyContext);

  return (
    <>
    <Router>
      <ScrollToTop />
      <CustomModal open={loading}>
        <Loader />
      </CustomModal>
      <Toaster />
      <Routes>
        
      <Route path="/jobOpenings/:id" element={<JobApplication />} />
        {!isUserLoggedIn ? (
          <>
          <Route path="/" element={<Navigate to={"/login"} />} />
            <Route path="/login" element={<Login />} />
            {
              (!loading && !userType) &&
              <Route path="*" element={<Navigate to={"/login"} />} />
            }
          </>
        ) : (
          <>
            <Route path="/" element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/supportAndTraining" element={<SupportAndTraining />} />
              <Route path="/supportAndTraining/:id" element={<Details />} />
              <Route path="*" element={<Navigate to="/" />} />

              {userType === "admin" && (
                <>
                  <Route path="/seo" element={<SEO />} />
                  <Route path="/blogs" element={<Blogs />} />
                  <Route path="/blogs/new" element={<EditBlog />} />
                  <Route path="/blogs/edit/:id" element={<EditBlog />} />
                  {/* <Route path="/jobOpenings/:id" element={<JobApplication />} /> */}
                  <Route path="/supportBlogs" element={<SupportBlogs />} />
                  <Route path="/supportBlogs/new" element={<CreateSupportBlog />} />
                  <Route path="/supportBlogs/edit/:id" element={<CreateSupportBlog />} />
                  <Route path="/upcomingCourses" element={<UpcommingCourses />} />
                  <Route path="/studentForms" element={<StudentForm />} />
                  <Route path="/coursesForms" element={<CourseTabs />} />
                  {/* <Route path="/upcomingCoursesForm" element={<UpcomingCourseForm />} /> */}
                  <Route path="/tutorForms" element={<TutorForm />} />
                  <Route path="/signup" element={<SignupForm />} />

                  <Route path="/tutorsAndSubjects" element={<TutorPages />} />
                  <Route path="/tutorsAndSubjects/:tutorId" element={<TutorDetail />} />
                  <Route path="/tutorsAndSubjects/:tutorId/edit" element={<EditProfile />} />
                  <Route path="/signup" element={<SignUpOnly />} />
                  <Route path="/links" element={<ManageLinks />} />
                  <Route path="/links/invoices/:id" element={<ViewInvoices />} />
                  <Route path="/contactUsForms" element={<ContactUsForm />} />
                  {/* <Route path="/requestCourseForm" element={<RequestCoursesForm />} />
                  <Route path="/revisionCoursesForm" element={<RevisionCoursesForm />} /> */}
                  <Route path="/jobsAndRequests" element={<CreateOrder />} />
                  <Route path="/applicantsList" element={<ApplicationsList />} />
                  <Route path="/subjects" element={<ManageSubjects />} />

                  
                </>
              )}
              {userType === "student" && (
                <>
                  <Route path="/mySubscriptions" element={<MySubscriptions />} />
                  <Route path="/myCourses" element={<NewCourses />} />
                  <Route path="/profile" element={<ProfileAndFinanceStudent />} />
                </>
              )}
              {userType === "teacher" && (
                <>
                  <Route path="/activeCourses" element={<TeacherCourses />} />
                  <Route path="/profileAndFinance" element={<ProfileAndFinance />} />
                  <Route path="/myStudents" element={<MyStudents />} />
                  <Route path="/jobOpenings" element={<JobOpening />} />
                </>
              )}
            </Route>
          </>
        )}
      </Routes>
    </Router>
  </>
  );
}

export default App;

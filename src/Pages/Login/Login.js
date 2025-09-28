import React, { useContext } from "react"
import LoginForm from "./LoginForm/LoginForm"
import CustomModal from "./CustomModal/CustomModal"
import Loader from "./Loader/Loader"
import { Toaster } from "react-hot-toast"
import { MyContext } from "../../Context/MyContext"
import Logo from "../../assets/logo.png"
import LoginImage from "../../assets/Login/login2.png"

export default function Login() {
  const { loading } = useContext(MyContext)

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-white">
      <CustomModal open={loading}>
        <Loader />
      </CustomModal>
      <Toaster />

      {/* Left Side - Illustration */}
      <div className="hidden lg:flex w-2/3 h-full bg-[#4071B60D] p-12 items-center justify-center relative">
        <div className="absolute top-8 left-8">
          <img src={Logo} alt="IB Innovators Logo" className="h-16 w-auto object-contain" />
        </div>

        <div className="relative w-full max-w-md mt-28">
          <img
            src={LoginImage}
            alt="International Day of Education illustration"
            className="w-full h-auto object-contain scale-110"
            style={{ clipPath: "inset(0 0 75px 0)" }} 
          />
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 h-full flex flex-col bg-white">
        {/* Logo + Heading Section */}
        <div className="p-8 lg:p-12 flex flex-col items-center text-center mt-4">
          <img
            src={Logo}
            alt="IB Innovators Logo"
            className="h-20 w-auto object-contain mb-3"
          />
          <h1 className="text-[34px] font-medium text-[#4071B6] mb-2">Class Core</h1>
          <p className="text-[#A2A1A8] font-light text-[16px]">Please login here</p>
        </div>

        {/* Login Form (centered but nudged upward) */}
        <div className="flex-1 flex items-center justify-center px-8 lg:px-12">
          <div className="w-full max-w-md -mt-24"> {/* 👈 negative top margin moves it up */}
            <LoginForm />
          </div>
        </div>

        {/* Footer (slightly lifted too) */}
        <div className="p-4 lg:p-6 text-center text-[#A2A1A8] text-[18px] font-light -mb-2">
          @2025 IB Innovators. All rights reserved
        </div>
      </div>



      <div id="recaptcha-container"></div>
    </div>
  )
}

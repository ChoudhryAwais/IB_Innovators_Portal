import React, { useState, useContext } from "react";
import LoginForm from "./LoginForm/LoginForm";
import CustomModal from "./CustomModal/CustomModal";
import Loader from "./Loader/Loader";
import { Toaster } from "react-hot-toast";
import { MyContext } from "../../Context/MyContext";
import Logo from "../../assets/logo.png";
import LoginImage from "../../assets/Login/login2.png";

export default function Login() {
  const { loading } = useContext(MyContext);

return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <CustomModal open={loading}>
        <Loader />
      </CustomModal>
      <Toaster />

      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-2xl overflow-hidden grid lg:grid-cols-2 min-h-[600px]">
        {/* Left Side - Educational Illustration */}
        <div className="hidden lg:flex bg-gradient-to-br from-blue-50 to-indigo-100 p-12 items-center justify-center relative">
          <div className="absolute top-8 left-8">
            <img src={Logo} alt="IB Innovators Logo" className="h-16 w-auto object-contain" />
          </div>

          <div className="relative w-full max-w-md">
            <img
              src={LoginImage}
              alt="International Day of Education illustration with globe, graduation cap, and learning elements"
              className="w-full h-auto object-contain"
            />
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="flex flex-col justify-center p-8 lg:p-12">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center mb-8">
            <img src={Logo} alt="IB Innovators Logo" className="h-12 w-auto object-contain" />
          </div>

          {/* Logo for desktop */}
          <div className="hidden lg:flex items-center mb-8">
            <img src={Logo} alt="IB Innovators Logo" className="h-16 w-auto object-contain" />
          </div>

          {/* Heading */}
          <h1 className="text-4xl font-bold text-blue-600 mb-2">Class Core</h1>
          <p className="text-gray-500 mb-8">Please login here</p>

          {/* Login Form */}
          <LoginForm />

          {/* Footer */}
          <div className="mt-8 text-center text-gray-400 text-sm">@2025 IB Innovators. All rights reserved</div>
        </div>
      </div>

      <div id="recaptcha-container"></div>
    </div>
  )
}
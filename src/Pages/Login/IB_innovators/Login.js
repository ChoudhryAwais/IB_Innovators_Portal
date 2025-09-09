import React, { useState, useContext } from "react";
import LoginForm from "./LoginForm/LoginForm";
import CustomModal from "./CustomModal/CustomModal";
import Loader from "./Loader/Loader";
import { Toaster } from "react-hot-toast";
import { MyContext } from "../../Context/MyContext";
import Logo from "../../assets/logo.png";
import LoginImage from "../../assets/Login/login.jpg";

export default function Login() {
  const { loading } = useContext(MyContext);

  return (
    <div className="flex-1 min-h-screen bg-gradient-to-r from-[#3d79b0] to-[#2342a4] p-8 select-text overflow-hidden">
      <CustomModal open={loading}>
        <Loader />
      </CustomModal>
      <Toaster />

      <div className="flex max-w-[1600px] mx-auto bg-white overflow-hidden flex-col md:flex-row">
        {/* FORM CONTAINER */}
        <div className="flex-1 flex flex-col text-[#1e1e1e] p-12 overflow-hidden">
          <div className="flex-1 p-8 mt-2">
            {/* Logo */}
            <div className="mx-auto mb-12 w-max">
              <img
                src={Logo}
                alt="Logo"
                className="w-auto max-w-[200px] h-full object-contain"
              />
            </div>

            {/* Heading */}
            <div className="text-4xl font-bold text-left mb-2">Login</div>
            <div className="mb-8 text-gray-700">
              Please enter your login credentials below.
            </div>

            {/* Login Form */}
            <LoginForm />

            {/* Footer */}
            <div className="mt-24 text-gray-500 text-center">
              @2024 IB Innovators. All rights reserved
            </div>
          </div>
        </div>

        {/* IMAGE CONTAINER */}
        <div className="flex-1 overflow-hidden">
          <div
            className="flex-1 h-full bg-cover bg-right"
            style={{ backgroundImage: `url(${LoginImage})`, backgroundColor: "#019dde" }}
          ></div>
        </div>

      </div>

      <div id="recaptcha-container"></div>
    </div>
  );
}

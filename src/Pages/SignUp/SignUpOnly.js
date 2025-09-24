import React, { useState } from "react";
import { MyContext } from "../../Context/MyContext";

// Import the three signup forms
import RegisterAdmin from "./RegisterAdmin";
import RegisterTutor from "./RegisterTutor";
import RegisterStudent from "./RegisterStudent";

function SignUpOnly() {
  const [activeTab, setActiveTab] = useState("admin");

  const tabs = [
    {
      id: "admin",
      label: "Admin SignUp",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 11c0 2.21-1.79 4-4 4s-4-1.79-4-4
               1.79-4 4-4 4 1.79 4 4zM6 21v-2a4 4 0 014-4h0a4 4 0 014 4v2"
          />
        </svg>
      ),
    },
    {
      id: "teacher",
      label: "Tutor SignUp",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 14l9-5-9-5-9 5 9 5zm0 0v7"
          />
        </svg>
      ),
    },
    {
      id: "student",
      label: "Student SignUp",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14c-4 0-8 2-8 6h16c0-4-4-6-8-6z"
          />
        </svg>
      ),
    },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "admin":
        return <RegisterAdmin />;
      case "teacher":
        return <RegisterTutor />;
      case "student":
        return <RegisterStudent />;
      default:
        return <RegisterAdmin />;
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="mr-[10px] pt-0">
        <div className="bg-white rounded-lg border border-gray-200 shadow-md">
          {/* Tabs header */}
          <div className="flex border-b border-gray-200 mx-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                type="button"
                className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors duration-200 border-b-2 ${
                  activeTab === tab.id
                    ? "text-blue-600 border-blue-600"
                    : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="p-4">{renderTabContent()}</div>
        </div>
      </div>
    </div>
  );
}

export default SignUpOnly;




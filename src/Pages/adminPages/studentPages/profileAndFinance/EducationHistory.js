import React from "react";

export function EducationHistory({ userDetails }) {
  const educationRecords = userDetails?.educationRecords
    ? userDetails.educationRecords
    : [];

  const renderEducationRecords = () => {
    return educationRecords.map((record) => (
      <div key={record.id} className="w-full mb-6">
        <div className="grid grid-cols-2 gap-x-8 gap-y-6">
          {/* Qualification Title */}
          <div>
            <label className="block text-[14px] font-light text-[#A2A1A8] mb-1">
              Qualification Title
            </label>
            <div className="text-[16px] font-light text-[#16151C] border-b border-gray-200 pb-2">
              {record.qualificationTitle || "Not entered"}
            </div>
          </div>

          {/* Year of Graduation */}
          <div>
            <label className="block text-[14px] font-light text-[#A2A1A8] mb-1">
              Year of Graduation
            </label>
            <div className="text-[16px] font-light text-[#16151C] border-b border-gray-200 pb-2">
              {record.yearOfGraduation || "Not entered"}
            </div>
          </div>

          {/* University */}
          <div>
            <label className="block text-[14px] font-light text-[#A2A1A8] mb-1">
              University
            </label>
            <div className="text-[16px] font-light text-[#16151C] border-b border-gray-200 pb-2">
              {record.university || "Not entered"}
            </div>
          </div>

          {/* Grade */}
          <div>
            <label className="block text-[14px] font-light text-[#A2A1A8] mb-1">
              Grade (Or in progress)
            </label>
            <div className="text-[16px] font-light text-[#16151C] border-b border-gray-200 pb-2">
              {record.grade ? `${record.grade}/4` : "Not entered"}
            </div>
          </div>
        </div>
      </div>
    ));
  };

  return (
    <div>
      <div className="flex flex-col items-start gap-6">
        <div className="w-full">
          <div className="grid grid-cols-1 gap-y-6">
            {educationRecords.length !== 0 ? (
              renderEducationRecords()
            ) : (
              <div className="text-[16px] font-light text-[#16151C]">
                No Educational History
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

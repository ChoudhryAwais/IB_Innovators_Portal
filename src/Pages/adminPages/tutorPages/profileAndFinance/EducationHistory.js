import React from "react";

export function EducationHistory({ userDetails }) {
  const educationRecords = userDetails?.educationRecords
    ? userDetails.educationRecords
    : [];

  const renderEducationRecords = () => {
    return educationRecords.map((record) => (
      <div key={record.id} className="flex-1 mb-2">
        <div className="flex flex-wrap flex-1">
          <div className="flex-1 border-b border-[#A2A1A81A] pb-1 mr-2">
            <div className="text-[14px] font-light text-[#A2A1A8]">Qualification Title</div>
            <div className="text-[16px] font-normal text-[#16151C]">{record.qualificationTitle || "Not entered"}</div>
          </div>

          <div className="flex-1 border-b border-[#A2A1A81A] pb-1 ml-2">
            <div className="text-[14px] font-light text-[#A2A1A8]">Year of Graduation</div>
            <div className="text-[16px] font-normal text-[#16151C]">{record.yearOfGraduation || "Not entered"}</div>
          </div>
        </div>

        <div className="flex flex-wrap flex-1 mt-4 ">
          <div className="flex-1 border-b border-[#A2A1A81A] pb-1 mr-2">
            <div className="text-[14px] font-light text-[#A2A1A8]">University</div>
            <div className="text-[16px] font-normal text-[#16151C]">{record.university || "Not entered"}</div>
          </div>

          <div className="flex-1 border-b border-[#A2A1A81A] pb-1 ml-2">
            <div className="text-[14px] font-light text-[#A2A1A8]">Grade (Or in progress)</div>
            <div className="text-[16px] font-normal text-[#16151C]">{record.grade || "Not entered"}/4</div>
          </div>
        </div>
      </div>
    ));
  };

  return (
    <div className="pb-2 border-b border-gray-300">
      <div className="flex flex-1 justify-between items-center flex-wrap mb-2">
        <div className="text-left text-[#16151C] text-[18px] font-semibold">
          Education History
        </div>
      </div>

      {educationRecords.length !== 0 ? (
        renderEducationRecords()
      ) : (
        <div className="mb-2.5">No Educational History</div>
      )}
    </div>
  );
}

import React from "react";

export function ProfileAdditionalIBInfo({ userDetails }) {
  return (
    <div className="mt-4 pb-4 border-b border-gray-300">
      {/* Section Title */}
      <div className="text-left text-[#16151C] text-[18px] font-semibold mb-2">
        Additional IB Information
      </div>

      {/* TOK & Total IB Score */}
      <div className="flex flex-1 justify-between flex-wrap mb-2.5">
        <div className="flex-1">
          <div className="text-[14px] font-light text-[#A2A1A8]">TOK Grade</div>
          <div className="text-[16px] font-normal text-[#16151C]">
            {userDetails?.profileAdditionalIBInfo?.tokGrade || "N/A"}
          </div>
        </div>

        <div className="flex-1">
          <div className="text-[14px] font-light text-[#A2A1A8]">Total IB Score</div>
          <div className="text-[16px] font-normal text-[#16151C]">
            {userDetails?.profileAdditionalIBInfo?.totalIbScore || "N/A"}
          </div>
        </div>
      </div>

      {/* EE Subject Areas */}
      <div className="flex flex-1 justify-between flex-wrap mb-2.5">
        <div className="flex-1">
          <div className="text-[14px] font-light text-[#A2A1A8]">EE Subject Area</div>
          <div className="text-[16px] font-normal text-[#16151C]">
            {userDetails?.profileAdditionalIBInfo?.eeSubjectArea || "N/A"}
          </div>
        </div>

        <div className="flex-1">
          <div className="text-[14px] font-light text-[#A2A1A8]">2nd EE Subject Area</div>
          <div className="text-[16px] font-normal text-[#16151C]">
            {userDetails?.profileAdditionalIBInfo?.secondEeSubjectArea || "N/A"}
          </div>
        </div>
      </div>

      {/* IB School */}
      <div className="mb-2.5">
        <div className="text-[14px] font-light text-[#A2A1A8]">Your IB School</div>
        <div className="text-[16px] font-normal text-[#16151C]">
          {userDetails?.profileAdditionalIBInfo?.yourIbSchool || "N/A"}
        </div>
      </div>

      {/* Additional Info */}
      <div>
        <div className="text-[14px] font-light text-[#A2A1A8]">
          Additional Information about your IB Education you think we should know about?
        </div>
        <div className="text-[16px] font-normal text-[#16151C]">
          {userDetails?.profileAdditionalIBInfo?.additionalInfo || "N/A"}
        </div>
      </div>
    </div>
  );
}

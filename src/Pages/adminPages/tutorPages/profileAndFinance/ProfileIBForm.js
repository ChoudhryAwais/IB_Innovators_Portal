import React from "react";

export function ProfileIBForm({ userDetails }) {
  return (
    <div className="mt-4 pb-4 border-b border-gray-300">
      <div className="text-left text-[#16151C] text-[18px] font-semibold mb-2">
        International Baccalaureate
      </div>

      <p>
        <span className="text-[14px] font-light text-[#A2A1A8]">Did you complete IB Diploma?</span>
        <br />
        <span className="text-[16px] font-normal text-[#16151C]">
          {userDetails?.ibForm?.ibDiploma === true
            ? "Yes"
            : userDetails?.ibForm?.ibDiploma === false
            ? "No"
            : "N/A"}
        </span>
      </p>

      <p>
        <span className="text-[14px] font-light text-[#A2A1A8]">Did you complete IB MYP?</span>
        <br />
        <span className="text-[16px] font-normal text-[#16151C]">
          {userDetails?.ibForm?.ibMyp === true
            ? "Yes"
            : userDetails?.ibForm?.ibMyp === false
            ? "No"
            : "N/A"}
        </span>
      </p>

      <p>
        <span className="text-[14px] font-light text-[#A2A1A8]">Did you complete IB PYP?</span>
        <br />
        <span className="text-[16px] font-normal text-[#16151C]">
          {userDetails?.ibForm?.ibPyp === true
            ? "Yes"
            : userDetails?.ibForm?.ibPyp === false
            ? "No"
            : "N/A"}
        </span>
      </p>
    </div>
  );
}

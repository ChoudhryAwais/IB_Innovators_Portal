import React from "react";

export function ProfileYourIBDPSubjects({ userDetails }) {
  const ibdpSubjects = userDetails?.ibdpSubjects ?? [];

  const renderIBDPSubjects = () => {
    return ibdpSubjects.map((record) => (
      <div key={record.id} className="flex-1 mb-4">
        <div className="flex flex-wrap flex-1">
          <div className="flex-1 border-b border-[#A2A1A81A] pb-1 mr-2">
            <div className="text-[14px] font-light text-[#A2A1A8]">Subject</div>
            <div className="text-base">{record.subject || "Not entered"}</div>
          </div>

          <div className="flex-1 border-b border-[#A2A1A81A] pb-1 mr-2">
            <div className="text-[14px] font-light text-[#A2A1A8]">Score</div>
            <div className="text-base">{record.score || "Not entered"}</div>
          </div>
        </div>

        <div className="flex flex-wrap flex-1">
          <div className="flex-1 border-b border-[#A2A1A81A] pb-1 mr-2">
            <div className="text-[14px] font-light text-[#A2A1A8]">Level</div>
            <div className="text-base">{record.level || "Not entered"}</div>
          </div>
        </div>
      </div>
    ));
  };

  return (
    <div className="pb-2 border-b border-gray-300 mt-4">
      <div className="text-left text-[#16151C] text-[18px] font-semibold mb-2">
        Your IBDP Subjects
      </div>

      {ibdpSubjects.length !== 0 ? (
        renderIBDPSubjects()
      ) : (
        <div className="mb-2">No IBDP Subjects</div>
      )}
    </div>
  );
}

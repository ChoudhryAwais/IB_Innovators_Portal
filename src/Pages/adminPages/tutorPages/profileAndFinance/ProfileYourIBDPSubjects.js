import React from "react";

export function ProfileYourIBDPSubjects({ userDetails }) {
  const ibdpSubjects = userDetails?.ibdpSubjects ?? [];

  const renderIBDPSubjects = () => {
    return ibdpSubjects.map((record) => (
      <div key={record.id} className="flex-1 mb-5">
        <div className="flex flex-wrap flex-1">
          <div className="flex-1">
            <div className="text-sm">Subject</div>
            <div className="text-base">{record.subject}</div>
          </div>

          <div className="flex-1">
            <div className="text-sm">Score</div>
            <div className="text-base">{record.score}</div>
          </div>
        </div>

        <div className="flex flex-wrap flex-1">
          <div className="flex-1">
            <div className="text-sm">Level</div>
            <div className="text-base">{record.level}</div>
          </div>
        </div>
      </div>
    ));
  };

  return (
    <div className="pb-2 border-b border-gray-300 mt-5">
      <div className="text-left text-xl font-bold mb-5">
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

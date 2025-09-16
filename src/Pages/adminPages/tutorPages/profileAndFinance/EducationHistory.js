import React from "react";

export function EducationHistory({ userDetails }) {
  const educationRecords = userDetails?.educationRecords
    ? userDetails.educationRecords
    : [];

  const renderEducationRecords = () => {
    return educationRecords.map((record) => (
      <div key={record.id} className="flex-1 mb-5">
        <div className="flex flex-wrap flex-1">
          <div className="flex-1">
            <div className="text-xs">Qualification Title</div>
            <div className="text-base">{record.qualificationTitle}</div>
          </div>

          <div className="flex-1">
            <div className="text-xs">Year of Graduation</div>
            <div className="text-base">{record.yearOfGraduation}</div>
          </div>
        </div>

        <div className="flex flex-wrap flex-1">
          <div className="flex-1">
            <div className="text-xs">University</div>
            <div className="text-base">{record.university}</div>
          </div>

          <div className="flex-1">
            <div className="text-xs">Grade (Or in progress)</div>
            <div className="text-base">{record.grade}/4</div>
          </div>
        </div>
      </div>
    ));
  };

  return (
    <div className="pb-2.5 border-b border-gray-300">
      <div className="flex flex-1 justify-between items-center flex-wrap mb-5">
        <div className="text-left text-2xl font-bold">
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

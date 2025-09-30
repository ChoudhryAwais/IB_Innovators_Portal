import React from "react";

export function ProfessionalTeachingExperience({ userDetails }) {
  return (
    <div className="mt-4 pb-4 border-b border-gray-300">
      <div className="flex flex-1 justify-between flex-wrap items-center mb-2">
        <div className="text-left text-[#16151C] text-[18px] font-semibold mb-2">
          Professional Teaching Experience
        </div>
      </div>

      {/* IB Teacher Experience */}
      <div className="mb-2.5">
        <span className="text-[14px] font-light text-[#A2A1A8]">
          Do you have experience working professionally as a teacher in an IB World School?
        </span>
        <span className="text-[16px] font-normal text-[#16151C] ml-2">
          {userDetails?.professionalTeachingExperience?.professionalIBTeacherExperience === true
            ? "Yes"
            : userDetails?.professionalTeachingExperience?.professionalIBTeacherExperience === false
            ? "No"
            : "N/A"}
        </span>
      </div>

      {/* IB Examiner */}
      <div className="mb-2.5">
        <span className="text-[14px] font-light text-[#A2A1A8]">Have you ever acted as IB Examiner?</span>
        <span className="text-[16px] font-normal text-[#16151C] ml-2">
          {userDetails?.professionalTeachingExperience?.actedAsIBExaminer === true
            ? "Yes"
            : userDetails?.professionalTeachingExperience?.actedAsIBExaminer === false
            ? "No"
            : "N/A"}
        </span>
      </div>

      {/* Subjects & Papers Moderated */}
      <div className="mb-2.5">
        <div className="text-[14px] font-light text-[#A2A1A8]">
          If yes then please detail subject(s), paper(s), and year moderated
        </div>
        <div className="text-[16px] font-normal text-[#16151C]">
          {userDetails?.professionalTeachingExperience?.detailSubjectsAndPapersModerated || "N/A"}
        </div>
      </div>

      {/* SEN Experience */}
      <div className="mb-2.5">
        <span className="text-[14px] font-light text-[#A2A1A8]">
          Do you have any experience supporting students with Special Educational Needs (SEN)?
        </span>
        <span className="text-[16px] font-normal text-[#16151C] ml-2">
          {userDetails?.professionalTeachingExperience?.supportingStudentWithSpecialNeeds === true
            ? "Yes"
            : userDetails?.professionalTeachingExperience?.supportingStudentWithSpecialNeeds === false
            ? "No"
            : "N/A"}
        </span>
      </div>

      {/* SEN Details */}
      <div className="mb-2.5">
        <div className="text-[14px] font-light text-[#A2A1A8]">If yes then please detail the SENs you've had experience with</div>
        <div className="text-[16px] font-normal text-[#16151C]">
          {userDetails?.professionalTeachingExperience?.explainSENExperience || "N/A"}
        </div>
      </div>

      {/* Other Educational Programmes */}
      <div className="mb-2.5">
        <div className="text-[14px] font-light text-[#A2A1A8]">Other Educational Programmes</div>
        <div className="text-[16px] font-normal text-[#16151C]">
          {userDetails?.professionalTeachingExperience?.otherEducationalProgrammes || "N/A"}
        </div>
      </div>
    </div>
  );
}

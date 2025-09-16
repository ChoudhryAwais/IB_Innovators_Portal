import React from "react";

export function ProfessionalTeachingExperience({ userDetails }) {
  return (
    <div className="mt-5 pb-5 border-b border-gray-300">
      <div className="flex flex-1 justify-between flex-wrap items-center mb-5">
        <div className="text-left text-2xl font-bold">
          Professional Teaching Experience
        </div>
      </div>

      {/* IB Teacher Experience */}
      <div className="mb-2.5">
        <span className="text-sm">
          Do you have experience working professionally as a teacher in an IB World School?
        </span>
        <span className="font-bold ml-2">
          {userDetails?.professionalTeachingExperience?.professionalIBTeacherExperience === true
            ? "Yes"
            : userDetails?.professionalTeachingExperience?.professionalIBTeacherExperience === false
            ? "No"
            : "N/A"}
        </span>
      </div>

      {/* IB Examiner */}
      <div className="mb-2.5">
        <span className="text-sm">Have you ever acted as IB Examiner?</span>
        <span className="font-bold ml-2">
          {userDetails?.professionalTeachingExperience?.actedAsIBExaminer === true
            ? "Yes"
            : userDetails?.professionalTeachingExperience?.actedAsIBExaminer === false
            ? "No"
            : "N/A"}
        </span>
      </div>

      {/* Subjects & Papers Moderated */}
      <div className="mb-2.5">
        <div className="text-sm">
          If yes then please detail subject(s), paper(s), and year moderated
        </div>
        <div className="font-bold">
          {userDetails?.professionalTeachingExperience?.detailSubjectsAndPapersModerated || "N/A"}
        </div>
      </div>

      {/* SEN Experience */}
      <div className="mb-2.5">
        <span className="text-sm">
          Do you have any experience supporting students with Special Educational Needs (SEN)?
        </span>
        <span className="font-bold ml-2">
          {userDetails?.professionalTeachingExperience?.supportingStudentWithSpecialNeeds === true
            ? "Yes"
            : userDetails?.professionalTeachingExperience?.supportingStudentWithSpecialNeeds === false
            ? "No"
            : "N/A"}
        </span>
      </div>

      {/* SEN Details */}
      <div className="mb-2.5">
        <div className="text-sm">If yes then please detail the SENs you've had experience with</div>
        <div className="font-bold">
          {userDetails?.professionalTeachingExperience?.explainSENExperience || "N/A"}
        </div>
      </div>

      {/* Other Educational Programmes */}
      <div className="mb-2.5">
        <div className="text-sm">Other Educational Programmes</div>
        <div className="font-bold">
          {userDetails?.professionalTeachingExperience?.otherEducationalProgrammes || "N/A"}
        </div>
      </div>
    </div>
  );
}

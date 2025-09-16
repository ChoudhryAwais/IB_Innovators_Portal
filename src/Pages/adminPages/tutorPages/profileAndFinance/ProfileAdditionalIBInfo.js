import React from "react";

export function ProfileAdditionalIBInfo({ userDetails }) {
  return (
    <div className="mt-5 pb-5 border-b border-gray-300">
      {/* Section Title */}
      <div className="text-left text-2xl font-bold mb-5">
        Additional IB Information
      </div>

      {/* TOK & Total IB Score */}
      <div className="flex flex-1 justify-between flex-wrap mb-2.5">
        <div className="flex-1">
          <div className="text-sm">TOK Grade</div>
          <div>
            {userDetails?.profileAdditionalIBInfo?.tokGrade || "N/A"}
          </div>
        </div>

        <div className="flex-1">
          <div className="text-sm">Total IB Score</div>
          <div>
            {userDetails?.profileAdditionalIBInfo?.totalIbScore || "N/A"}
          </div>
        </div>
      </div>

      {/* EE Subject Areas */}
      <div className="flex flex-1 justify-between flex-wrap mb-2.5">
        <div className="flex-1">
          <div className="text-sm">EE Subject Area</div>
          <div>
            {userDetails?.profileAdditionalIBInfo?.eeSubjectArea || "N/A"}
          </div>
        </div>

        <div className="flex-1">
          <div className="text-sm">2nd EE Subject Area</div>
          <div>
            {userDetails?.profileAdditionalIBInfo?.secondEeSubjectArea || "N/A"}
          </div>
        </div>
      </div>

      {/* IB School */}
      <div className="mb-2.5">
        <div className="text-sm">Your IB School</div>
        <div>
          {userDetails?.profileAdditionalIBInfo?.yourIbSchool || "N/A"}
        </div>
      </div>

      {/* Additional Info */}
      <div>
        <div className="text-sm">
          Additional Information about your IB Education you think we should know about?
        </div>
        <div>
          {userDetails?.profileAdditionalIBInfo?.additionalInfo || "N/A"}
        </div>
      </div>
    </div>
  );
}

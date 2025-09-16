import React from "react";

export function ProfileIBForm({ userDetails }) {
  return (
    <div className="mt-5 pb-5 border-b border-gray-300">
      <div className="text-left text-2xl font-bold mb-5">
        International Baccalaureate
      </div>

      <p>
        <span className="text-sm">Did you complete IB Diploma?</span>
        <br />
        <span className="font-bold">
          {userDetails?.ibCompletion?.ibDiploma === true
            ? "Yes"
            : userDetails?.ibCompletion?.ibDiploma === false
            ? "No"
            : "N/A"}
        </span>
      </p>

      <p>
        <span className="text-sm">Did you complete IB MYP?</span>
        <br />
        <span className="font-bold">
          {userDetails?.ibCompletion?.ibMyp === true
            ? "Yes"
            : userDetails?.ibCompletion?.ibMyp === false
            ? "No"
            : "N/A"}
        </span>
      </p>

      <p>
        <span className="text-sm">Did you complete IB PYP?</span>
        <br />
        <span className="font-bold">
          {userDetails?.ibCompletion?.ibPyp === true
            ? "Yes"
            : userDetails?.ibCompletion?.ibPyp === false
            ? "No"
            : "N/A"}
        </span>
      </p>
    </div>
  );
}

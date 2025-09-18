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
          {userDetails?.ibForm?.ibDiploma === true
            ? "Yes"
            : userDetails?.ibForm?.ibDiploma === false
            ? "No"
            : "N/A"}
        </span>
      </p>

      <p>
        <span className="text-sm">Did you complete IB MYP?</span>
        <br />
        <span className="font-bold">
          {userDetails?.ibForm?.ibMyp === true
            ? "Yes"
            : userDetails?.ibForm?.ibMyp === false
            ? "No"
            : "N/A"}
        </span>
      </p>

      <p>
        <span className="text-sm">Did you complete IB PYP?</span>
        <br />
        <span className="font-bold">
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

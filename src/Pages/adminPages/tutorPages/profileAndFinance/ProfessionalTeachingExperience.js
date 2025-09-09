import React, { useState } from "react";
import { db } from "../../../../firebase";
import {
  collection,
  getDocs,
  query,
  where,
  updateDoc,
} from "firebase/firestore";

export function ProfessionalTeachingExperience({ userDetails, userId }) {
  const [editing, setEditing] = useState(false);

  const [professionalIBTeacherExperience, setProfessionalIBTeacherExperience] =
    useState(
      userDetails?.professionalTeachingExperience
        ?.professionalIBTeacherExperience ?? false
    );
  const [actedAsIBExaminer, setActedAsIBExaminer] = useState(
    userDetails?.professionalTeachingExperience?.actedAsIBExaminer ?? ""
  );
  const [detailSubjectsAndPapersModerated, setDetailSubjectsAndPapersModerated] =
    useState(
      userDetails?.professionalTeachingExperience
        ?.detailSubjectsAndPapersModerated ?? ""
    );
  const [supportingStudentWithSpecialNeeds, setSupportingStudentWithSpecialNeeds] =
    useState(
      userDetails?.professionalTeachingExperience
        ?.supportingStudentWithSpecialNeeds ?? false
    );
  const [explainSENExperience, setExplainSENExperience] = useState(
    userDetails?.professionalTeachingExperience?.explainSENExperience ?? ""
  );
  const [otherEducationalProgrammes, setOtherEducationalProgrammes] = useState(
    userDetails?.professionalTeachingExperience?.otherEducationalProgrammes ?? ""
  );

  const [savingDetails, setSavingDetails] = useState(false);

  async function savingChanges() {
    setSavingDetails(true);
    try {
      const details = {
        professionalTeachingExperience: {
          professionalIBTeacherExperience,
          actedAsIBExaminer,
          detailSubjectsAndPapersModerated,
          supportingStudentWithSpecialNeeds,
          explainSENExperience,
          otherEducationalProgrammes,
        },
      };

      const userListRef = collection(db, "userList");
      const q = query(userListRef, where("userId", "==", userId));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docRef = querySnapshot.docs[0].ref;
        await updateDoc(docRef, details);
      }

      setSavingDetails(false);
      setEditing(false);
    } catch (e) {
      console.error("Error saving changes:", e);
      alert("Error saving changes. Please try again");
      setSavingDetails(false);
    }
  }

  return (
    <div className="mt-5 pb-5 border-b border-gray-300">
      <div className="flex flex-1 justify-between flex-wrap items-center mb-5">
        <div className="text-left text-2xl font-bold">
          Professional Teaching Experience
        </div>

        {editing === false ? (
          <button
            onClick={() => setEditing(true)}
            className="border border-black text-black bg-transparent rounded-none px-3 py-1.5"
          >
            EDIT
          </button>
        ) : (
          <div className="flex gap-2.5">
            <button
              onClick={() => setEditing(false)}
              className="border border-red-600 text-white bg-red-600 rounded-none px-3 py-1.5"
            >
              CANCEL
            </button>

            <button
              onClick={savingChanges}
              className="border border-green-600 text-white bg-green-600 rounded-none px-3 py-1.5"
            >
              {savingDetails ? "SAVING" : "SAVE"}
            </button>
          </div>
        )}
      </div>

      <div className="mb-2.5">
        <span className="text-sm">
          Do you have experience working professionally as a teacher in an IB
          World School?
        </span>

        {editing === false ? (
          <span className="font-bold ml-2">
            {userDetails?.professionalTeachingExperience
              ?.professionalIBTeacherExperience === true
              ? "Yes"
              : userDetails?.professionalTeachingExperience
                  ?.professionalIBTeacherExperience === false
              ? "No"
              : "N/A"}
          </span>
        ) : (
          <div>
            <label className="mr-5">
              <input
                type="radio"
                value={true}
                checked={professionalIBTeacherExperience === true}
                onChange={() => setProfessionalIBTeacherExperience(true)}
              />
              <span className="ml-1">Yes</span>
            </label>
            <label className="mr-5">
              <input
                type="radio"
                value={false}
                checked={professionalIBTeacherExperience === false}
                onChange={() => setProfessionalIBTeacherExperience(false)}
              />
              <span className="ml-1">No</span>
            </label>
          </div>
        )}
      </div>

      <div className="mb-2.5">
        <span className="text-sm">Have you ever acted as IB Examiner?</span>

        {editing === false ? (
          <span className="font-bold ml-2">
            {userDetails?.professionalTeachingExperience?.actedAsIBExaminer ===
            true
              ? "Yes"
              : userDetails?.professionalTeachingExperience
                  ?.actedAsIBExaminer === false
              ? "No"
              : "N/A"}
          </span>
        ) : (
          <div>
            <label className="mr-5">
              <input
                type="radio"
                value={true}
                checked={actedAsIBExaminer === true}
                onChange={() => setActedAsIBExaminer(true)}
              />
              <span className="ml-1">Yes</span>
            </label>
            <label className="mr-5">
              <input
                type="radio"
                value={false}
                checked={actedAsIBExaminer === false}
                onChange={() => setActedAsIBExaminer(false)}
              />
              <span className="ml-1">No</span>
            </label>
          </div>
        )}
      </div>

      <div className="mb-2.5">
        <div className="text-sm">
          If yes then please detail subject(s), paper(s), and year moderated
        </div>
        {editing === false ? (
          <div className="font-bold">
            {userDetails?.professionalTeachingExperience
              ?.detailSubjectsAndPapersModerated || "N/A"}
          </div>
        ) : (
          <input
            type="text"
            value={detailSubjectsAndPapersModerated}
            onChange={(e) => setDetailSubjectsAndPapersModerated(e.target.value)}
            placeholder="Enter details here"
            className="border border-gray-300 px-2 py-1 rounded"
          />
        )}
      </div>

      <div className="mb-2.5">
        <span className="text-sm">
          Do you have any experience supporting students with Special
          Educational Needs (SEN)?
        </span>

        {editing === false ? (
          <span className="font-bold ml-2">
            {userDetails?.professionalTeachingExperience
              ?.supportingStudentWithSpecialNeeds === true
              ? "Yes"
              : userDetails?.professionalTeachingExperience
                  ?.supportingStudentWithSpecialNeeds === false
              ? "No"
              : "N/A"}
          </span>
        ) : (
          <div>
            <label className="mr-5">
              <input
                type="radio"
                value={true}
                checked={supportingStudentWithSpecialNeeds === true}
                onChange={() => setSupportingStudentWithSpecialNeeds(true)}
              />
              <span className="ml-1">Yes</span>
            </label>
            <label className="mr-5">
              <input
                type="radio"
                value={false}
                checked={supportingStudentWithSpecialNeeds === false}
                onChange={() => setSupportingStudentWithSpecialNeeds(false)}
              />
              <span className="ml-1">No</span>
            </label>
          </div>
        )}
      </div>

      <div className="mb-2.5">
        <div className="text-sm">
          If yes then please detail the SENs you've had experience with
        </div>
        {editing === false ? (
          <div className="font-bold">
            {userDetails?.professionalTeachingExperience?.explainSENExperience ||
              "N/A"}
          </div>
        ) : (
          <input
            type="text"
            value={explainSENExperience}
            onChange={(e) => setExplainSENExperience(e.target.value)}
            placeholder="Enter details here"
            className="border border-gray-300 px-2 py-1 rounded"
          />
        )}
      </div>

      <div className="mb-2.5">
        <div className="text-sm">Other Educational Programmes</div>
        {editing === false ? (
          <div className="font-bold">
            {userDetails?.professionalTeachingExperience
              ?.otherEducationalProgrammes || "N/A"}
          </div>
        ) : (
          <input
            type="text"
            value={otherEducationalProgrammes}
            onChange={(e) => setOtherEducationalProgrammes(e.target.value)}
            placeholder="Enter details here"
            className="border border-gray-300 px-2 py-1 rounded"
          />
        )}
      </div>
    </div>
  );
}

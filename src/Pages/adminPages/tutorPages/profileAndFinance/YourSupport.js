import { DBSCertificates } from "./YourSupportForms/DBSCertificatesForm"
import { YourStyleAndExperience } from "./YourSupportForms/YourStyleAndExperience"

export function YourSupport({ userDetails, userId }) {
  const subjectInString = `${Object.entries(userDetails?.subjects || {}).map(([subject]) => `${subject}`)}`

  return (
    <div className="bg-white  rounded-lg ">
      <div className="mb-8 border-b border-gray-200">
        <h3 className="text-[14px] font-light text-[#A2A1A8] mb-4">You Support</h3>
        <h3 className="text-[16px] font-light text-[#16151C]">Subjects you are cleared to tutor in</h3>
        <p className="text-[16px] font-light text-[#16151C] mb-6 leading-relaxed">
          Business Management (HL),Computer science (HL),Design technology (SL),Chemistry (HL),Biology (SL),Computer
          science (SL),Chemistry (SL),Digital Societies (SL),Biology (HL),Business Management (SL),Digital Societies
          (HL),Design technology (HL)
        </p>

        <p className=" text-[16px] font-light text-[#16151C] mb-8">
          To request to tutor in additional subjects please fill out the APPLY FOR NEW SUBJECT form here.
        </p>
      </div>

      <div className="mb-8 border-b border-gray-200">
        <h3 className="text-[14px] font-light text-[#A2A1A8] mb-4">DBS Certificates</h3>
        <p className="text-[16px] font-light text-[#16151C] mb-4 leading-relaxed">
          DBS Certificates are issued by the UK Government to demonstrate that you have not been barred from working
          with young people. We may ask you for DBS in order to tutor students.
        </p>
        <p className="text-[16px] font-light text-[#16151C] mb-6">Did you have enhanced DBS Certificate issued in last two years? No</p>
      </div>

      {/* <div className="mb-8 border-b border-gray-200">
        <h3 className="text-[14px] font-light text-[#A2A1A8] mb-4">DBS Certificates</h3>
        <p className="text-[16px] font-light text-[#16151C] mb-4 leading-relaxed">
          DBS Certificates are issued by the UK Government to demonstrate that you have not been barred from working
          with young people. We may ask you for DBS in order to tutor students.
        </p>
        <p className="text-[16px] font-light text-[#16151C] mb-6">Did you have enhanced DBS Certificate issued in last two years? No</p>
      </div> */}

      <div>
        <h3 className="text-[14px] font-light text-[#A2A1A8] mb-4">Update your DBS Record</h3>
        <p className="text-[16px] font-light text-[#16151C] leading-relaxed">
          If you have enhanced DBS Certificate so please send to contact@ibinnovators.comso we can update your profile
          accordingly.
        </p>
      </div>

      {/* Keep existing components for functionality */}
      {/* <div className="mt-8 space-y-6">
        <DBSCertificates userDetails={userDetails} userId={userId} />
        <YourStyleAndExperience userDetails={userDetails} userId={userId} />
      </div> */}
    </div>
  )
}

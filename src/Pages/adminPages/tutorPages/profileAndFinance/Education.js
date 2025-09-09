import { EducationHistory } from "./EducationHistory"
import { ProfileIBForm } from "./ProfileIBForm"
import { ProfileYourIBDPSubjects } from "./ProfileYourIBDPSubjects"
import { ProfileAdditionalIBInfo } from "./ProfileAdditionalIBInfo"
import { ProfessionalTeachingExperience } from "./ProfessionalTeachingExperience"

export function Education({ userDetails, userId }) {
  return (
    <div className="bg-white p-6 rounded-lg">
      {/* Sample education form layout matching the design */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">First Name</label>
          <div className="text-base text-gray-900">Student</div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">Last Name</label>
          <div className="text-base text-gray-900">Name</div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">Mobile Number</label>
          <div className="text-base text-gray-900">+92 111 6589658</div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">Email Address</label>
          <div className="text-base text-gray-900">Parent@example.com</div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">Relation</label>
          <div className="text-base text-gray-900">Parent</div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">Gender</label>
          <div className="text-base text-gray-900">Female</div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">City</label>
          <div className="text-base text-gray-900">California</div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">State</label>
          <div className="text-base text-gray-900">United State</div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">Address</label>
          <div className="text-base text-gray-900">2464 Royal Ln. Mesa, New Jersey</div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">Zip Code</label>
          <div className="text-base text-gray-900">35624</div>
        </div>
      </div>

      {/* Keep existing education components below */}
      <div className="mt-8 space-y-6">
        <EducationHistory userDetails={userDetails} userId={userId} />
        <ProfileIBForm userDetails={userDetails} userId={userId} />
        <ProfileYourIBDPSubjects userDetails={userDetails} userId={userId} />
        <ProfileAdditionalIBInfo userDetails={userDetails} userId={userId} />
        <ProfessionalTeachingExperience userDetails={userDetails} userId={userId} />
      </div>
    </div>
  )
}

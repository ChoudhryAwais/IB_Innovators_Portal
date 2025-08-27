
export default function getStudentRegisterEmailTemplate(student_name, student_email, student_password) {

    return `
<html>
  <head></head>
  <body style="padding: 1rem; background: white">
    <div style="flex: 1; width: 100%">
      <div
        style="
          flex: 1;
          display: flex;
          flex-direction: row;
          justify-content: flex-end;
          align-items: center;
        "
      >
        <img
          src="https://portal.ibinnovators.com/logo.png"
          alt="Logo"
          height="50"
          width="100"
          style="height: 50; width: auto"
        />
      </div>

      <div style="background: #eee; padding: 1rem; flex: 1; margin-top: 1rem">
        <p><b>Dear ${student_name},</b></p>

        <p>
          We are excited to welcome you to <b>IB Innovators!</b> As a valued
          student, we want to ensure you have all the resources you need for a
          successful academic journey. 
          </p>
          <p>
          Below are your login credentials for the
          student portal, where you can access your tutors, lessons, credits and
          other latest updates.
        </p>

        <div><b>Email: ${student_email}</b></div>
        <div><b>Password: ${student_password}</b></div>

        <p>
          To log in to the student portal, please visit
          <a href="https://www.portal.ibinnovators.com/login" target="_blank">https://www.portal.ibinnovators.com/login</a> and enter your credentials.
          If you encounter any issues or have any questions, please do not
          hesitate to contact our support team at
          <a href="mailto:support@ibinnovators.com" target="_blank"
            >support@ibinnovators.com </a
          >.
        </p>

        <p>
          We wish you a productive and enjoyable experience at
          <b>IB Innovators</b>.
        </p>

        <p>Best Wishes,<br/>IBI Team</p>
      </div>

      <div style="margin-top: 1rem">
        <div style="font-size: small; color: #7e7e7e">
          For 1-on-1 lessons and tutoring
        </div>
        <div style="font-size: small; color: #7e7e7e">education.ibinnovators.com</div>
        <div style="font-size: small">
          <a href="mailto:support@ibinnovators.com" target="_blank">
            support@ibinnovators.com
          </a>
        </div>
        <div style="font-size: small; color: #7e7e7e">
          ${process.env.REACT_APP_EMAIL_TEMPLATE_WHATSAPP}
        </div>
        <div style="color: #1555a0">
          <b>
            IB INNOVATORS LTD,<br />
            Suite 4258, Unit 3A, 34-35 Hatton Garden,<br />
            Holborn, London EC1N 8DX,<br />
            United Kingdom
          </b>
        </div>
      </div>
    </div>
  </body>
</html>
    `

}
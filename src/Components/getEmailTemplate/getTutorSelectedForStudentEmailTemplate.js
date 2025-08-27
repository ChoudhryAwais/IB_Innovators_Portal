
export default function getTutorSelectedForStudentEmailTemplate(
    student_name,
    hours,
    subject,
    tutor_name
) {

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
          justify-content: flex-start;
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
        <p>Dear ${student_name},</p>

        <p>
          Thank you for your request for ${hours} hours of private tuition in
          <b>${subject}</b>. Copied into this email
          is your tutor <b>${tutor_name}</b> who will contact you
          shortly to arrange the timings and logistics for your tuition. We
          suggest using Zoom or Google meet. You will be able to set up lesson
          times to fit both of your schedules. Please do not hesitate to let me
          know if you have any general questions, otherwise, I will leave you in
          <b>${tutor_name}'s</b> very capable hands!
        </p>

        <p>
          <b
            >**Important: Please give your tutor a minimum of 24 hours notice if
            you cannot attend your planned lesson, or need to move the time.
            Otherwise you risk losing your credit.</b
          >
        </p>
        <p>
          <b
            >Please check the Portal for the expiration date of your credits.</b
          >
        </p>

        <p>
          You can login to the Portal
          <a href="https://portal.ibinnovators.com/login" target="_blank"
            >here</a
          >
          to view all of your lessons, available credits, account details and
          our
          <a
            href="https://portal.ibinnovators.com/supportAndTraining"
            target="_blank"
            >FAQ centre</a
          >.
        </p>

        <p>
          If you have not heard from your tutor within 24 hours, please check
          your spam folder and let us know!
        </p>

        <p>
          Best Wishes, <br />
          IBI Team
        </p>
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
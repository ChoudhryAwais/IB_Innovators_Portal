export default function getTutorSelectedForStudentEmailTemplate(
  student_name,
  hours,
  subject,
  tutor_name
) {
  return `
  <html>
    <head></head>
    <body class="p-4 bg-white">
      <div class="flex-1 w-full">
        <div class="flex flex-row justify-start items-center flex-1">
          <img
            src="https://portal.ibinnovators.com/logo.png"
            alt="Logo"
            height="50"
            width="100"
            class="h-[50px] w-auto"
          />
        </div>

        <div class="bg-[#eee] p-4 flex-1 mt-4">
          <p>Dear ${student_name},</p>

          <p>
            Thank you for your request for ${hours} hours of private tuition in
            <b>${subject}</b>. Copied into this email is your tutor 
            <b>${tutor_name}</b> who will contact you shortly to arrange the timings 
            and logistics for your tuition. We suggest using Zoom or Google meet. 
            You will be able to set up lesson times to fit both of your schedules. 
            Please do not hesitate to let me know if you have any general questions, 
            otherwise, I will leave you in <b>${tutor_name}'s</b> very capable hands!
          </p>

          <p>
            <b>
              **Important: Please give your tutor a minimum of 24 hours notice if
              you cannot attend your planned lesson, or need to move the time.
              Otherwise you risk losing your credit.
            </b>
          </p>
          <p>
            <b>
              Please check the Portal for the expiration date of your credits.
            </b>
          </p>

          <p>
            You can login to the Portal
            <a href="https://portal.ibinnovators.com/login" target="_blank" class="text-blue-600 underline">
              here
            </a>
            to view all of your lessons, available credits, account details and our
            <a
              href="https://portal.ibinnovators.com/supportAndTraining"
              target="_blank"
              class="text-blue-600 underline"
            >
              FAQ centre
            </a>.
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

        <div class="mt-4">
          <div class="text-sm text-[#7e7e7e]">
            For 1-on-1 lessons and tutoring
          </div>
          <div class="text-sm text-[#7e7e7e]">
            education.ibinnovators.com
          </div>
          <div class="text-sm">
            <a href="mailto:support@ibinnovators.com" target="_blank" class="text-blue-600 underline">
              support@ibinnovators.com
            </a>
          </div>
          <div class="text-sm text-[#7e7e7e]">
            ${process.env.REACT_APP_EMAIL_TEMPLATE_WHATSAPP}
          </div>
          <div class="text-[#1555a0]">
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
  `;
}

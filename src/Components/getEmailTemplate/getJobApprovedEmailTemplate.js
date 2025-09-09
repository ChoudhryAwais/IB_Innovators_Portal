export default function getJobApprovedEmailTemplate(tutor_name, student_name, subject) {
  return `
<html>
  <head></head>
  <body class="p-4 bg-white">
    <div class="flex w-full">
      <div class="flex flex-row justify-start items-center w-full">
        <img
          src="https://portal.ibinnovators.com/logo.png"
          alt="Logo"
          height="50"
          width="100"
          class="h-[50px] w-auto"
        />
      </div>

      <div class="bg-[#eee] p-4 w-full mt-4">
        <p>Dear ${tutor_name},</p>

        <p>Congratulations!</p>

        <p>
          You are now linked with <b>${student_name}</b>, for Online support in
          <b>${subject}</b>.
        </p>

        <p>
          Please reach out to the student immediately to arrange the first
          lesson and, as per standard procedure, ensure to:
        </p>

        <ol class="list-decimal list-inside">
          <li>Cc coordinator@ibinnovators.com</li>
          <li>Cc the parental email address if there is one given</li>
          <li>Introduce yourself- education, background, experience, etc.</li>
          <li>Set out your availability and best times for lessons</li>
          <li>
            Reiterate the type of support you will be giving - mention
            deadlines, plan of action etc.
          </li>
        </ol>

        <p>
          Please log on to your portal for the contact details of the student
          <a href="https://portal.ibinnovators.com/login" target="_blank"
            class="text-blue-600 underline">here</a>.
        </p>

        <p>If you have any questions, please don’t hesitate to ask.</p>

        <p>
          Best Wishes, <br />
          IBI Team
        </p>
      </div>

      <div class="mt-4">
        <div class="text-sm text-gray-500">For 1-on-1 lessons and tutoring</div>
        <div class="text-sm text-gray-500">education.ibinnovators.com</div>
        <div class="text-sm">
          <a href="mailto:support@ibinnovators.com" target="_blank" class="text-blue-600 underline">
            support@ibinnovators.com
          </a>
        </div>
        <div class="text-sm text-gray-500">
          ${process.env.REACT_APP_EMAIL_TEMPLATE_WHATSAPP}
        </div>
        <div class="text-[#1555a0] mt-2">
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

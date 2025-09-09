export default function getCourseRequestedEmailTemplate(
  student_name,
  subject_name,
  year,
  country,
  start_date,
  applicationLink
) {
  return `
<html>
  <head>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
  </head>
  <body class="p-4 bg-white">
    <div class="flex-1 w-full">
      <div class="flex flex-row justify-start items-center">
        <img
          src="https://portal.ibinnovators.com/logo.png"
          alt="Logo"
          height="50"
          width="100"
          class="h-[50px] w-auto"
        />
      </div>

      <div class="bg-gray-200 p-4 flex-1 mt-4">
        <p>${student_name} requires assistance with <b>${subject_name}</b>.</p>

        <p>
          The student would like to have regular lessons on an ongoing basis with a 
          <b>Higher Tier tutor</b>.
        </p>

        <div>Details:</div>
        <div>Year of Graduation: <b>${year}</b></div>
        <div>Country: <b>${country}</b></div>
        <div>Start-date: <b>${start_date}</b></div>
        <div>Best time: <b>See student's availability table</b></div>

        <p>
          If interested and available, please apply for this position via the portal.
        </p>

        <p>Best Wishes, <br/>IBI Team</p>

        <div class="text-center mt-12 mb-4 flex-1">
          <a href="${applicationLink}" 
            class="block w-full p-4 text-white text-center bg-[#1e2e55]">
            I can support this student
          </a>
        </div>
      </div>

      <div class="mt-4">
        <div class="text-sm text-gray-500">
          For 1-on-1 lessons and tutoring
        </div>
        <div class="text-sm text-gray-500">education.ibinnovators.com</div>
        <div class="text-sm">
          <a href="mailto:support@ibinnovators.com" target="_blank">
            support@ibinnovators.com
          </a>
        </div>
        <div class="text-sm text-gray-500">
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

export default function getJobNotApprovedEmailTemplate(tutor_name) {
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
        <p>Dear ${tutor_name},</p>

        <p>
          A student you have applied to teach either no longer requires tuition,
          or has been assigned to another tutor. Please get in touch if you
          would like to know more.
        </p>
      </div>

      <div class="mt-4">
        <div class="text-sm text-[#7e7e7e]">
          For 1-on-1 lessons and tutoring
        </div>
        <div class="text-sm text-[#7e7e7e]">education.ibinnovators.com</div>
        <div class="text-sm">
          <a href="mailto:support@ibinnovators.com" target="_blank">
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

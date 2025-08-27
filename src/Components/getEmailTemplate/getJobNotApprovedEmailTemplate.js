
export default function getJobNotApprovedEmailTemplate(tutor_name) {

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
        <p>Dear ${tutor_name},</p>

        <p>
          A student you have applied to teach either no longer requires tuition,
          or has been assigned to another tutor. Please get in touch if you
          would like to know more.
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
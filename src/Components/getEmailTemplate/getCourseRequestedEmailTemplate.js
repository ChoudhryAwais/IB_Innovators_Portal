
export default function getCourseRequestedEmailTemplate(
    student_name, 
    subject_name, 
    year, 
    country, 
    start_date, 
    applicationLink) {

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
        <p>${student_name} requires assistance with <b>${subject_name}</b>.</p>

        <p>The student would like to have regular lessons on an ongoing basis with a <b>Higher Tier tutor</b>.</p>

        <div>Details:</div>
        <div>Year of Graduation: <b>${year}</b></div>
        <div>Country: <b>${country}</b></div>
        <div>Start-date: <b>${start_date}</b></div>
        <div>Best time: <b>See student's availability table</b></div>

        <p>If interested and available, please apply for this position via the portal.</p>

        <p>Best Wishes, <br/>IBI Team</p>

        <div style="text-align: center; margin-top: 3rem; margin-bottom: 1rem; flex: 1">
        <a href="${applicationLink}" style="flex: 1; width: 100%; padding: 1rem; color: white; text-align: center; background-color: #1e2e55">
            I can support this student
        </a>
    </div>
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
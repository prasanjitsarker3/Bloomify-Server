import nodemailer from "nodemailer";

const sendMail = async (to: string, subject: string, text: string) => {
  try {
    if (!process.env.EMAIL || !process.env.EMAIL_PASSWORD) {
      throw new Error(
        "Environment variables EMAIL or EMAIL_PASSWORD are missing."
      );
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      secure: true,
      host: "smtp.gmail.com",
      port: 465,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const htmlContent = `
    <div style="background-color: #028355; color: #FFFFFF; padding: 20px; font-family: Arial, sans-serif; text-align: center;">
     <h1 style="color: white;">OTP Verification</h1>
     <p style="color: white;">Your OTP for verification is <strong>${text}</strong></p>
     <p style="color: white;">It is valid for 5 minutes.</p>
    </div> `;

    // Define mail options
    const mailOptions = {
      from: process.env.EMAIL,
      to,
      subject,
      html: htmlContent,
    };

    console.log("Mail Options:", mailOptions);

    // Send mail
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.response);

    return info;
  } catch (error) {
    // Add detailed error logging
    console.error("Error occurred while sending email:", error);
    //@ts-ignore
    if (error.response) {
      //@ts-ignore
      console.error("SMTP Response:", error.response);
    }

    throw new Error("Failed to send email.");
  }
};

export default sendMail;

import nodemailer from 'nodemailer';
import User from "@/models/userModel";
import bcryptjs from 'bcryptjs';


export const sendEmail = async({email, emailType, userId}) => {
    try {

        const hashedToken = await bcryptjs.hash(userId.toString(), 10)

        if (emailType === "VERIFY") {
            await User.findByIdAndUpdate(userId, 
                {verifyToken: hashedToken, verifyTokenExpiry: Date.now() + 3600000})
        } else if (emailType === "RESET"){
            await User.findByIdAndUpdate(userId, 
                {forgotPasswordToken: hashedToken, forgotPasswordTokenExpiry: Date.now() + 3600000})
        }

        var transport = nodemailer.createTransport({
            host: "sandbox.smtp.mailtrap.io",
            port: 2525,
            auth: {
              user: process.env.NODEMAILER_USERNAME,
              pass: process.env.NODEMAILER_PASSWORD
            }
          });

        const mailOptions = {
            from: 'dotstore@gmail.com',
            to: email,
            subject: emailType === "VERIFY" ? "Verify your email" : "Reset your password",
            html: 
                `<p>Click ${emailType === "VERIFY" ? `<a href="${process.env.DOMAIN}/verifyemail?token=${hashedToken}">here</a> to` : 
                            `<a href="${process.env.DOMAIN}/change-password?token=${hashedToken}">here</a> to`}
                  
                    ${emailType === "VERIFY" ? "verify your email" : "reset your password"}
                    or copy and paste the link below in your browser. <br> ${process.env.DOMAIN}/change-password?token=${hashedToken}
                </p>`
        }

        const mailresponse = await transport.sendMail(mailOptions);
        return mailresponse;

    } catch (error) {
        throw new Error(error.message);
    }
}
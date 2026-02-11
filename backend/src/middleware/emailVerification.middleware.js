import nodemailer from 'nodemailer';
import { asyncHandler } from '../utils/asyncHandler.js';
import { verificationEmailTemplete, welcomeEmailTemplete, Login_Alert_Email_Template } from '../templete/email.templete.js';

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port : 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_SENDING_ID,
        pass: process.env.EMAIL_SENDING_PASS_KEY
    },
});

const sendVerificationEmail = asyncHandler( async(email, verificationCode) =>{
    await transporter.sendMail({
        from: `"CProtocol Security" <${process.env.EMAIL_SENDING_ID}>`,
        to: email,
        subject: "Verify Your Email",
        text: `Your verification code is ${verificationCode}`,
        html: verificationEmailTemplete(verificationCode)
    });
    console.log("Verification email sent to :", email);
});

const sendWelcomeEmail = asyncHandler( async(email, name) => {
    await transporter.sendMail({
        from : `"CProtocol Security" <${process.env.EMAIL_SENDING_ID}>`,
        to: email,
        subject: "Welcome to CProtocol",
        text: `Welcome ${name}! Your account has been created successfully.`,
        html: welcomeEmailTemplete(name)
    })
    console.log("Welcome Email Send Successfully")
});

const sendLoginEmailWarning = asyncHandler(async (email, name, device, location, time) => {
    await transporter.sendMail({
        from: `"CProtocol Security" <${process.env.EMAIL_SENDING_ID}>`,
        to: email,
        subject: "New Login Detected on Your Account",
        text: `Hello ${name}, a new login was detected on your account.`,
        html: Login_Alert_Email_Template(
            name,
            device,
            location,
            time
        )
    });

    console.log("Login alert email sent to:", email);
});


export{
    sendVerificationEmail,
    sendWelcomeEmail,
    sendLoginEmailWarning
}

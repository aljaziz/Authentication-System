import { client, sender } from "../lib/mailtrap.js";
import { VERIFICATION_EMAIL_TEMPLATE } from "../template/email.template.js";

export const generateVerificationCode = () => {
    const verificationCode = Math.floor(
        100000 + Math.random() * 900000
    ).toString();
    return verificationCode;
};

export const sendVerificationEmail = async (email, verificationCode) => {
    const recipients = [
        {
            email,
        },
    ];
    try {
        const response = await client.send({
            from: sender,
            to: recipients,
            subject: "Verify your email",
            html: VERIFICATION_EMAIL_TEMPLATE.replace(
                "{verificationCode}",
                verificationCode
            ),
            category: "Email Verification",
        });
        console.log("Email sent successfully", response);
    } catch (error) {
        throw new Error(`Error sending verification email: ${error}`);
    }
};

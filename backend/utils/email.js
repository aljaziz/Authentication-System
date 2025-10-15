import { client, sender } from "../lib/mailtrap.js";
import {
    PASSWORD_RESET_REQUEST_TEMPLATE,
    PASSWORD_RESET_SUCCESS_TEMPLATE,
    VERIFICATION_EMAIL_TEMPLATE,
} from "../template/email.template.js";

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

export const sendWelcomeEmail = async (email, name) => {
    const recipient = [{ email }];
    try {
        const response = await client.send({
            from: sender,
            to: recipient,
            template_uuid: "a1988f6e-f542-438e-b3fa-d56e8fcfcdb2",
            template_variables: {
                name: name,
            },
        });
        console.log("Welcome email sent sucessfully", response);
    } catch (error) {
        throw new Error("Error sending welcome email", error.message);
    }
};

export const sendPasswordResetEmail = async (email, resetURL) => {
    const recipient = [{ email }];

    try {
        const response = await client.send({
            from: sender,
            to: recipient,
            subject: "Rest your password",
            html: PASSWORD_RESET_REQUEST_TEMPLATE.replace(
                "{resetURL}",
                resetURL
            ),
            category: "Password Reset",
        });
    } catch (error) {
        console.error(error);
        throw new Error("Error sending password reset email: ", error);
    }
};

export const sendResetSuccessEmail = async (email) => {
    const recipient = [{ email }];

    try {
        const response = await client.send({
            from: sender,
            to: recipient,
            subject: "Password reset successfull",
            html: PASSWORD_RESET_SUCCESS_TEMPLATE,
            category: "Password Reset",
        });
        console.log("Password reset email sent successfull", response);
    } catch (error) {
        throw new Error("Error sending password reset success email", error);
    }
};

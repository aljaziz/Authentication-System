import { MailtrapClient } from "mailtrap";
import "dotenv/config";

const TOKEN = process.env.MAILTRAP_TOKEN;
const ENDPOINT = process.env.MAILTRAP_ENDPOINT;

export const client = new MailtrapClient({
    token: TOKEN,
    endpoint: ENDPOINT,
});

export const sender = {
    email: "hello@demomailtrap.co",
    name: "Authentication",
};
// const recipients = [
//     {
//         email: "turja35-3164@diu.edu.bd",
//     },
// ];

// client
//     .send({
//         from: sender,
//         to: recipients,
//         subject: "You are awesome!",
//         text: "Congrats for sending test email with Mailtrap!",
//         category: "Integration Test",
//     })
//     .then(console.log, console.error);

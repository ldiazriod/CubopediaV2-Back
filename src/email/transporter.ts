import nodemailer from "nodemailer"
import * as dotenv from "dotenv";
dotenv.config()

const transporter: nodemailer.Transporter = nodemailer.createTransport({
    host: process.env.HOST,
    port: 465,
    secure: true,
    auth: {
        user:  process.env.EMAIL_USER_NAME,
        pass: process.env.EMAIL_USER_PASSWORD
    }
})

export {transporter}
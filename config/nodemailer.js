//Config for email verification
import nodemailer from "nodemailer"
import dotenv from "dotenv"

dotenv.config()

const user = process.env.EMAIL
const password = process.env.PASSWORD

function sendEmail(message) {
    return new Promise((res, rej) => {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: user,
                pass: password
            }
        })
        transporter.sendMail(message, function (err, info) {
            if (err) {
                rej(err)
            } else {
                res(info)
            }
        })
    })
}


const sendConfirmationEmail = (username, email, token) => {
    const message = {
        from: process.env.EMAIL,
        to: `${email}`,

        subject: "Activate your account",
        html: `
           <h3>Hello ${username}</h3>
           <p>Thank you for registering to our website.</p>
           <p>To activate your account please follow this link: Click <a target="_" href="http://localhost:4000/api/verify/${token}">here</a></p>
           <p>Cheers</p>
           <p>SENG513</p>
       `
    }

    return sendEmail(message)
}

export default sendConfirmationEmail
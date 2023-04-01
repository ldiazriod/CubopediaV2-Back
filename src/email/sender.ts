import { transporter } from "./transporter";

const sender = async(to:string, message: string ,name?: string) => {
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER_NAME,
            to: to,
            subject: `${name ? name : to} verify your mail!`,
            text: message
        })
    }catch(e){
        console.log(e)
    }
}

export {sender}
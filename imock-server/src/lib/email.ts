import nodemailer from 'nodemailer'

import { Logger } from './logger'

const logger = new Logger('lib/email')

interface MailOption {
    from?: string;  //'"Test Email" <test@email.com>',// sender address
    to: string;  //'someone@example.com, sometwo@example.com', // list of receivers
    cc?: string; //'somethree@example.com',
    bcc?: string; //'somefour@example.com',
    subject: string; //'Hello!',                              // subject line
    text?: string; //'Plain text version of the message',      // plain text body
    html?: string; // '<p>HTML version of the message</p>', 
}


class Email {
    private transporter

    constructor() {
        this.init()
    }

    init() {
        this.transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            secure: true, // true for port 465, false for other ports
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        })
    }

    async sendMail(mailOptions: MailOption) {
        if (!this.transporter) {
            this.init()
        }
        const send = await this.transporter.sendMail({
            from: process.env.EMAIL_USER,
            ...mailOptions
        })
        logger.info('email send', send)
        return send
    }
}


const emailService = new Email()

export default emailService

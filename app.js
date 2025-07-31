const express = require('express');
const multer = require('multer');
// const sgMail = require('@sendgrid/mail');
const morgan = require('morgan');
const cors = require('cors');
const SibApiV3Sdk = require('sib-api-v3-sdk');



const dotenv = require('dotenv');
dotenv.config("./.env")
const app = express();

const port = process.env.PORT || 8080
// sgMail.setApiKey(process.env.API_KEY || 'not key found')
// Middleware for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


const BREVO_API_KEY = process.env.BREVO_API_KEY || 'not key found'
SibApiV3Sdk.ApiClient.instance.authentications['api-key'].apiKey = BREVO_API_KEY


app.use(express.json());
app.use(morgan('dev'))
app.use(cors());


app.get("/", (req, res) => {
    res.status(200).send("server is runing as expected")
})

// Endpoint to send email with attachment
app.post('/send-email', upload.single('file'), async (req, res) => {
    const { to, from, subject, text } = req.body;
    const file = req.file;
    const key = process.env.API_KEY
    console.log(key)
    // Check if file was uploaded
    if (!to || !from || !subject || !text) {
        return res.status(400).send('Request is not formated correctly contact admin');
    }
    const listOfEmails = to.split(',')
    // var msg = {
    //     to: listOfEmails,
    //     from,
    //     subject,
    //     text,
    // };
    // if (file) {
    //     msg['attachments'] = [
    //         {
    //             content: file.buffer.toString('base64'),
    //             filename: file.originalname,
    //             type: file.mimetype,
    //             disposition: 'attachment',
    //         },
    //     ]
    // }

    let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = text;
    sendSmtpEmail.sender = { email: from };
    sendSmtpEmail.to = listOfEmails.map(email => ({ email }));

    if (file) {
        sendSmtpEmail.attachment = [{
            content: file.buffer.toString('base64'),
            name: file.originalname
        }];
    }

    try {
        const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
        res.status(200).send({ msg: 'Email sent successfully!', data });
    } catch (error) {
        console.error(BREVO_API_KEY, 'Error:', error);
        res.status(500).send({ msg: 'Error sending email.', BREVO_API_KEY, error });
    }
    // try {
    //     await sgMail.send(msg);
    //     res.status(200).send({ msg: 'Email sent successfully!' });
    // } catch (error) {
    //     res.status(500).send({ msg: 'Error sending email.' });
    // }


});



app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
module.exports = app;
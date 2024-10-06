const express = require('express');
const multer = require('multer');
const sgMail = require('@sendgrid/mail');
const morgan = require('morgan');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

sgMail.setApiKey(process.env.API_KEY || 'not key found')

// Middleware for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(express.json());
app.use(morgan('dev'))
app.use(cors());


app.get("/", (req, res) => {
    res.status(200).send("server is runing as expected")
})

// Endpoint to send email with attachment
app.post('/send-email', upload.single('file'), async (req, res) => {
    const { to, subject, text } = req.body;
    const file = req.file;

    // Check if file was uploaded
    if (!file) {
        return res.status(400).send('No file uploaded.');
    }
    // Check if file was uploaded
    if (!to || !subject || !text) {
        return res.status(400).send('Request is not formated correctly contact admin');
    }
    const msg = {
        to,
        from: 'ahsansaleem6389@gmail.com', // Replace with your email
        subject,
        text,
        attachments: [
            {
                content: file.buffer.toString('base64'),
                filename: file.originalname,
                type: file.mimetype,
                disposition: 'attachment',
            },
        ],
    };
    try {
        await sgMail.send(msg);
        res.status(200).send('Email sent successfully!');
    } catch (error) {
        res.status(500).send('Error sending email.');
    }
});


module.exports = app;
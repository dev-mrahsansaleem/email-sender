const express = require('express');
const multer = require('multer');
const sgMail = require('@sendgrid/mail');
const morgan = require('morgan');
const cors = require('cors');
const bodyParser = require('body-parser');

const dotenv = require('dotenv');
dotenv.config("./.env")
const app = express();


const port = process.env.PORT || 8080

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
    const { to, from, subject, text } = req.body;
    const file = req.file;

    // Check if file was uploaded
    if (!file) {
        return res.status(400).send('No file uploaded.');
    }
    // Check if file was uploaded
    if (!to || !from || !subject || !text) {
        return res.status(400).send('Request is not formated correctly contact admin');
    }
    const msg = {
        to,
        from,
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
        res.status(200).send({ msg: 'Email sent successfully!' });
    } catch (error) {
        res.status(500).send({ msg: 'Error sending email.' });
    }
});



app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
module.exports = app;
import express from "express";
import bodyParser from 'body-parser';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import axios from "axios";
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Middleware setup
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Check for required environment variables
if (!process.env.MAILCHIMP_API_KEY || !process.env.MAILCHIMP_LIST_ID) {
    console.error('Error: MAILCHIMP_API_KEY and MAILCHIMP_LIST_ID must be set in the .env file.');
    process.exit(1);
}

// Serve the signup page
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/signup.html");
});

// Handle form submission
app.post("/", async (req, res) => {
    const { fname, lname, email } = req.body;
    console.log(fname, lname, email);

    const data = {
        members: [
            {
                email_address: email,
                status: "subscribed",
                merge_fields: {
                    FNAME: fname,
                    LNAME: lname
                }
            }
        ]
    };

    const jsonData = JSON.stringify(data);

    try {
        const response = await axios.post(`https://us14.api.mailchimp.com/3.0/lists/${process.env.MAILCHIMP_LIST_ID}`, jsonData, {
            headers: {
                'Authorization': `apikey ${process.env.MAILCHIMP_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 200) {
            res.sendFile(__dirname + "/success.html");
        } else {
            res.status(response.status).sendFile(__dirname + "/failure.html");
        }
    } catch (error) {
        console.error('Error sending data:', error.response ? error.response.data : error.message);
        res.status(500).sendFile(__dirname + "/failure.html");
    }
});


app.listen(3000, () => {
    console.log("Server is listening on port 3000");
});

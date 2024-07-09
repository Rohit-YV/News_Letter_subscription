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

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

if (!process.env.MAILCHIMP_API_KEY || !process.env.MAILCHIMP_LIST_ID) {
    console.error('Error: MAILCHIMP_API_KEY and MAILCHIMP_LIST_ID must be set in the .env file.');
    process.exit(1);
}

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/signup.html");
});

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
        console.log(response.data);
        if (response.status === 200) {
            res.send("successfully Subcribed!");
            res.sendFile(__dirname + "success.html");
        } else {
            res.status(response.status).send("Failed to send data.");
            res.sendFile(__dirname + "failure.html");
        }
    } catch (error) {
        console.error('Error sending data:', error.response ? error.response.data : error.message);
        res.status(500).send("An error occurred while sending data.");
    }
});

app.listen(3000, () => {
    console.log("Server is listening on port 3000");
});


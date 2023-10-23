const express = require('express');
const bodyParser = require('body-parser');
const AWS = require('aws-sdk');

const app = express();
const port = 3000;

// Initialize AWS DynamoDB client
AWS.config.update({ region: 'us-east-2' });
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const tableName = 'task1';


app.use(bodyParser.urlencoded({ extended: true }));



// Serve index.html as the home page
app.get('/home', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.get('/login.html', (req, res) => {
    res.sendFile(__dirname + '/public/login.html');
    
});

// Serve register.html as the registration page
app.get('/register.html', (req, res) => {
    res.sendFile(__dirname + '/public/register.html');
});




// Handle login form submission it as api that have the all the information that after clicking on submit what it should do
app.post('/login', (req, res) => {
    try {
        const { username, password } = req.body;

        // Validate input data (add more validation as needed)
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        // Check if the user exists in DynamoDB
        const params = {
            TableName: tableName,
            Key: {
                username,
                password,
            },
        };


        // get the login information in DynamoDB
        dynamoDB.get(params, (error, data) => {
            if (error) {
                console.error('Error fetching data:', error);
                return res.status(500).json({ error: 'Login failed' });
            }

            // Check if the user exists
            if (!data.Item) {
                return res.status(401).json({ error: 'User not found' });
            }

            // Check if the password matches (you should securely hash and compare passwords)
            if (data.Item.password === password) {
                return res.status(200).json({ message: 'Login successful' });
            }
            else {
                return res.status(401).json({ error: 'Incorrect password' });
            }
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});




// Handle register form submission
app.post('/register1', (req, res) => {
    try {
        const { username, password, email, phone } = req.body;

        // Validate input data (add more validation as needed)
        if (!username || !password || !email || !phone) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Define the item to be stored in DynamoDB
        const params = {
            TableName: tableName,
            Item: {
                username,
                password, // Store password securely (e.g., hashed)
                email,
                phone,
            },
        };

        // Store the login information in DynamoDB
        dynamoDB.put(params, (error) => {
            if (error) {
                console.error('Error storing data:', error);
                return res.status(500).json({ error: 'Failed to store login information' });
            }

            res.status(200).json({ message: 'Login information stored successfully' });
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});




app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

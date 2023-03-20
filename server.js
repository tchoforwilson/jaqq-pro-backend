const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const morgan = require('morgan');
const http = require('http');

require('dotenv').config();

const app = express();
const server = http.createServer(app);



const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

/* Connect To MongoDB now */
    const uri = process.env.ATLAS_URI;
    mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true});

    const connection = mongoose.connection;
    connection.once('open', () => {
        console.log("MongoDB connection established successfully");
    })


//Middlewares
app.use(morgan('dev'))
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.json({ message: "Welcome to JAQQ" });
});

// Map files
    // const authenticate = require('./routes/api/authenticate');

    // app.use('/authenticate', authenticate);
//

/// app.listen
server.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});
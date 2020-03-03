// loading the env variables here
const dotenv = require("dotenv").config({ path: "./config/config.env" });

// loading the express here
const express = require("express");
const app = express();
const morgan = require("morgan");
const connectDB = require("./config/db");
const error = require("./middleware/errors");
const fileUpload = require("express-fileupload");
const path = require("path");
const cookie = require("cookie-parser");
const sanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const xxs = require("xss-clean");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");

// body parser here
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// cookie parser middleware here
app.use(cookie());

// connecting to the database
connectDB();

// using the morgan middleware
if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
}

// using the file upload middleware here
app.use(fileUpload());

// use to avoid NOSQL Injection error
app.use(sanitize());

// use for security header
app.use(helmet());

// user to secure route from vulnub
app.use(xxs());

app.use(hpp());

const limiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 1 // limit each IP to 100 requests per windowMs
});

//  apply to all requests
app.use(limiter);

app.use(express.static(path.join(__dirname, "public")));

// loading the routers here
app.use("/api/bootcamps", require("./routes/bootcampers"));
app.use("/api/courses", require("./routes/courses"));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/auth/user", require("./routes/user"));
app.use("/api/review", require("./routes/review"));

// using the error middleware for the bootcampers here
app.use(error);

const PORT = process.env.PORT || 6000;

app.listen(PORT, () => {
    console.log(`App Started in ${process.env.NODE_ENV} mode on PORT = ${PORT}`);
});
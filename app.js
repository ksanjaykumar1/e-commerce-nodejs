require("dotenv").config();
require("express-async-errors");

const express = require("express");
const app = express();

//rest of the packages

const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const connectDB = require("./db/connect");
const Logger = require("./logger/logger");
const logger = Logger.getLogger("./app.js");
const notFoundMiddlware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");

const authRouter = require("./routes/auth");
const userRouter = require("./routes/user");

const port = process.env.PORT || 5000;

app.use(express.json());
app.use(morgan("tiny"));
// signing cookie by JWT SECRET
app.use(cookieParser(process.env.JWT_SECRET));
app.use(cors());
app.use(express.static("./public"));

app.get("/", (req, res) => {
  res.send("<h1>E-commerce app</h1>");
});

app.get("/api/v1", (req, res) => {
  //   logger.info(JSON.stringify(req.cookies))
  // accessing signed cookies
  logger.info(JSON.stringify(req.signedCookies));
  res.send("<h1>E-commerce app</h1>");
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);

app.use(notFoundMiddlware);
app.use(errorHandlerMiddleware);

const start = async () => {
  try {
    logger.info("Mongo URI", process.env.MONGO_URI);
    await connectDB(process.env.MONGO_URI);
    app.listen(port, () => {
      logger.info("Connected to Mongo DB");
      logger.info(`Server Started on port ${port}`);
    });
  } catch (error) {
    logger.error("Server failed to start", error);
    process.exit(1);
  }
};

start();

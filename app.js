require("dotenv").config();
require("express-async-errors");

const express = require("express");
const app = express();

//rest of the packages

const morgan = require("morgan");
const cookieParser = require("cookie-parser");

const connectDB = require("./db/connect");
const Logger = require("./logger/logger");
const logger = Logger.getLogger("./app.js");
const notFoundMiddlware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");

const authRouter = require("./routes/auth");

const port = process.env.PORT || 5000;

app.use(express.json());
app.use(morgan("tiny"));
app.use(cookieParser());

app.get("/", (req, res) => {
  logger.info(req.cookies);
  res.send("<h1>E-commerce app</h1>");
});

app.use("/api/v1/auth", authRouter);

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

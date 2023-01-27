const express = require("express");
const app = express();
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const globalErrorHandler = require("./controllers/errorController");
const userRouter = require("./routes/userRoutes");
const videoRouter = require("./routes/videoRoutes");
const AppError = require("./utils/appError");

// Set security HTTP headers
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "script-src": ["'self'", "https://whitelisted-domain.com"],
      },
    },
  })
);
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());
app.use(express.static("public"));

// // Data sanitization against NoSQL query injection
// app.use(mongoSanitize());

// // Data sanitization against XSS
// app.use(xss());

// Development logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.cookies);
  next();
});
app.get("/", (req, res) => {
  res.render("index");
});
app.use("/api/v1/users", userRouter);
app.use("/api/v1/videos", videoRouter);
app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});
app.use(globalErrorHandler);
module.exports = app;

const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const dotenv = require('dotenv');
dotenv.config();

const userRoutes = require("./api/routes/user");
const knowledgeRoutes = require("./api/routes/knowledge");
const uploadRoutes = require("./api/routes/fileUpload");
const eventRoutes = require("./api/routes/event");

// Init app
const app = express();

mongoose.Promise = global.Promise;

mongoose.connect(
   "mongodb+srv://shawon:" +
      'MwIFV6K5c0OuzMNv' +
      "@innoeco-tf3wi.mongodb.net/test?retryWrites=true&w=majority",
   { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true }
).then(()=>console.log("DB server connected"))
   .catch(e => console.log("DB error", e));

app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Public folder
app.use(express.static("./public"));

app.use((req, res, next) => {
   res.header("Access-Control-Allow-Origin", "*");
   res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization"
   );
   if (req.method === "OPTIONS") {
      res.header(
         "Access-Control-Allow-Methods",
         "PUT, POST, PATCH, DELETE, GET"
      );
      return res.status(200).json({});
   }
   next();
});

// Routes which should handle requests
app.use("/user", userRoutes);
app.use("/knowledge", knowledgeRoutes);
app.use("/upload", uploadRoutes);
app.use("/event", eventRoutes);

app.get('/',(req,res) => {
   return res.send('Hello');
});

app.use((req, res, next) => {
   const error = new Error("Not found");
   error.status = 404;
   next(error);
});

app.use((error, req, res, next) => {
   res.status(error.status || 500);
   res.json({
      error: {
         message: error.message
      }
   });
});

module.exports = app;

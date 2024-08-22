const express = require("express");
const app = express();
const path = require("path");
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: true }));
app.get("/", (req, res) => {
  res.send(`<h1>WELCOME TO THE BACKEND CALCULATOR</h1>`);
});

app.get("/calci", (req, res) => {
  res.sendFile(path.join(__dirname, "calculator.html"));
});

app.post("/", (req, res) => {
  let num1 = Number(req.body.num1);
  let num2 = Number(req.body.num2);
  let result = num1 + num2;
  res.send(`calculation result is: ${result}`);
});

app.listen(5500, () => {
  console.log(`server is running on port 5500`);
});

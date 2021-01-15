import express from "express";

const app = express();

const host = "0.0.0.0";
const port = 8080;

app.use(express.static("static"));
app.use(express.json());

// app.get("/", (req, res) => {
//   res.send("Kiosk App Running");
// });

app.listen(port, host, () => {
  console.log(`App listening at http://${host}:${port}`);
});

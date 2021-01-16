import express from "express";
import jsonfile from "jsonfile";

const app = express();

const host = "0.0.0.0";
const port = 80;

// const APP_PATH = process.env.APP_PATH!;
const APP_PATH = "/home/node/prayer-clock-deployment";

app.use(express.static(APP_PATH + "/static"));
app.use(express.json());

app.post("/admin", (req, res) => {
  res.send("App running");
});

type ClockConfig = {
  admin_username: string,
  admin_password: string,
  fajr_iqamah: string,
  dhuhr_iqamah: string,
  asr_iqamah: string,
  maghrib_iqamah: string,
  isha_iqamah: string,
  jummah_1: string,
  jummah_2: string | undefined,
  jummah_3: string | undefined,
  jummah_4: string | undefined
}
app.get("/admin", async (req, res) => {
  let jfile: ClockConfig = await jsonfile.readFile(APP_PATH + '/clock_config.json');
  res.send(jfile);
});

app.listen(port, host, () => {
  console.log(`App listening at http://${host}:${port}`);
});

import express from "express";
import jsonfile from "jsonfile";
import cookieParser from "cookie-parser";

const app = express();

const host = "0.0.0.0";
const port = 80;

const APP_PATH = process.argv[2];
if (APP_PATH == null || APP_PATH == "") {
  console.error("Command Usage: node <path_to_index.js> <path_to_app_directory>");
  console.error("Ex: node /home/dev/app/js/index.js /home/dev/app");
  process.exit(1);
}
const CONFIG_PATH = APP_PATH + "/clock_config.json";
const sessionTokenGenerator = () => Math.floor(Math.random() * 1000000000).toFixed();
let sessionToken = sessionTokenGenerator();
let tokenCheckMiddleware = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  if (req.cookies.sessionToken != sessionToken) {
    res.redirect("/login");
  } else {
    next();
  }
};

app.use(express.json());
app.use(cookieParser());

app.get("/login", (req, res) => {
  if (req.cookies.sessionToken == sessionToken) {
    res.redirect("/admin");
  } else {
    res.sendFile(APP_PATH + "/static/login.html");
  }
});

app.post("/login", async (req, res) => {
  let config: ClockConfig = await jsonfile.readFile(CONFIG_PATH);
  if (config.admin_password == req.body["password"]) {
    sessionToken = sessionTokenGenerator();
    // Set sessionToken cookie for the next 30 days
    res.cookie("sessionToken", sessionToken, { maxAge: 30 * 24 * 60 * 60, httpOnly: true });
    res.sendStatus(200);
  } else {
    res.sendStatus(401);
  }
});

app.post("/change_times", tokenCheckMiddleware, async (req, res) => {
  let config: ClockConfig = await jsonfile.readFile(CONFIG_PATH);
  let tempConfig: typeof config = JSON.parse(JSON.stringify(config));
  let body: IqamahParameters = req.body;
  let validator = (
    prayer: "fajr_iqamah" | "dhuhr_iqamah" | "asr_iqamah" | "maghrib_iqamah" | "isha_iqamah"
  ) => {
    if (body[prayer].includes(":")) {
      return "A_" + body[prayer];
    } else if (Number.parseInt(body[prayer]) != NaN) {
      return "R_" + body[prayer];
    } else {
      return "R_5";
    }
  };
  tempConfig.fajr_iqamah = validator("fajr_iqamah");
  tempConfig.dhuhr_iqamah = validator("dhuhr_iqamah");
  tempConfig.asr_iqamah = validator("asr_iqamah");
  tempConfig.maghrib_iqamah = validator("maghrib_iqamah");
  tempConfig.isha_iqamah = validator("isha_iqamah");
  tempConfig.jummah_1 = body.jummah_1;
  tempConfig.jummah_2 = body.jummah_2;
  tempConfig.jummah_3 = body.jummah_3;
  tempConfig.jummah_4 = body.jummah_4;

  for (let key in tempConfig) {
    let configParam = key as keyof typeof tempConfig;
    if (tempConfig[configParam] != config[configParam]) {
      tempConfig.timestamp = Date.now();
      break;
    }
  }

  let returnParams: IqamahParameters = {
    timestamp: tempConfig.timestamp,
    fajr_iqamah: tempConfig.fajr_iqamah,
    dhuhr_iqamah: tempConfig.dhuhr_iqamah,
    asr_iqamah: tempConfig.asr_iqamah,
    maghrib_iqamah: tempConfig.maghrib_iqamah,
    isha_iqamah: tempConfig.isha_iqamah,
    jummah_1: tempConfig.jummah_1,
    jummah_2: tempConfig.jummah_2,
    jummah_3: tempConfig.jummah_3,
    jummah_4: tempConfig.jummah_4,
  };
  res.send(returnParams);
  if (tempConfig.timestamp != config.timestamp) {
    jsonfile.writeFile(CONFIG_PATH, tempConfig);
  }
});

app.get("/get_times", async (req, res) => {
  let config: ClockConfig = await jsonfile.readFile(CONFIG_PATH);
  let returnParams: IqamahParameters = {
    timestamp: config.timestamp,
    fajr_iqamah: config.fajr_iqamah,
    dhuhr_iqamah: config.dhuhr_iqamah,
    asr_iqamah: config.asr_iqamah,
    maghrib_iqamah: config.maghrib_iqamah,
    isha_iqamah: config.isha_iqamah,
    jummah_1: config.jummah_1,
    jummah_2: config.jummah_2,
    jummah_3: config.jummah_3,
    jummah_4: config.jummah_4,
  };
  res.send(returnParams);
});

app.get("/admin", tokenCheckMiddleware, (req, res) => {
  res.sendFile(APP_PATH + "/static/admin.html");
});

app.use(express.static(APP_PATH + "/static"));

app.listen(port, host, () => {
  console.log(`App listening at http://${host}:${port}`);
});

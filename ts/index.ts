import express from "express";
import jsonfile from "jsonfile";
import cookieParser from "cookie-parser";

const app = express();

const host = "0.0.0.0";
const port = 80;

// const APP_PATH = process.env.APP_PATH!;
const APP_PATH = "/home/node/prayer-clock-deployment";
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

app.post("/admin", (req, res) => {
  res.send("App running");
});

type IqamahParameters = {
  fajr_iqamah: string;
  dhuhr_iqamah: string;
  asr_iqamah: string;
  maghrib_iqamah: string;
  isha_iqamah: string;
  jummah_1: string;
  jummah_2: string | undefined;
  jummah_3: string | undefined;
  jummah_4: string | undefined;
};
type ClockConfig = IqamahParameters & {
  admin_password: string;
};

app.get("/login", (req, res) => {
  console.log(req.cookies);
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
  // let jummahValidator = (jummah: 'jummah_2' | 'jummah_3' | 'jummah_4') => {
  //   if(body[jummah] != undefined){
  //     return body[jummah];
  //   }else{
  //     return undefined;
  //   }
  // }
  config.fajr_iqamah = validator("fajr_iqamah");
  config.dhuhr_iqamah = validator("dhuhr_iqamah");
  config.asr_iqamah = validator("asr_iqamah");
  config.maghrib_iqamah = validator("maghrib_iqamah");
  config.isha_iqamah = validator("isha_iqamah");
  config.jummah_1 = body.jummah_1;
  config.jummah_2 = body.jummah_2;
  config.jummah_3 = body.jummah_3;
  config.jummah_4 = body.jummah_4;

  let returnParams: IqamahParameters = {
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
  jsonfile.writeFile(CONFIG_PATH, config);
});

app.get("/get_times", async (req, res) => {
  let config: ClockConfig = await jsonfile.readFile(CONFIG_PATH);
  let returnParams: IqamahParameters = {
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

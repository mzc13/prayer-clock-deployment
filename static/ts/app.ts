let body = document.getElementById("body")!;
let tableBody = document.getElementById("tableBody")!;
let gDate = document.getElementById("gDate")!;
let hDate = document.getElementById("hDate")!;
let adhanElements = {
  fajr: document.getElementById("fajrAdhan")!,
  sunrise: document.getElementById("sunrise")!,
  dhuhr: document.getElementById("dhuhrAdhan")!,
  asr: document.getElementById("asrAdhan")!,
  maghrib: document.getElementById("maghribAdhan")!,
  isha: document.getElementById("ishaAdhan")!,
  jummah: document.getElementById("jummahTimes")!,
};
let iqamahElements = {
  fajr: document.getElementById("fajrIqamah")!,
  dhuhr: document.getElementById("dhuhrIqamah")!,
  asr: document.getElementById("asrIqamah")!,
  maghrib: document.getElementById("maghribIqamah")!,
  isha: document.getElementById("ishaIqamah")!,
};

let now = new Date();
let adhanTimes = {
  fajr: now,
  sunrise: now,
  dhuhr: now,
  asr: now,
  maghrib: now,
  isha: now,
  // jummah: now,
};
let iqamahTimes = {
  fajr: todayTime("6:15 AM"),
  dhuhr: todayTime("12:30 PM"),
  asr: todayTime("2:40 PM"),
  maghrib: now,
  isha: todayTime("7:30 PM"),
};
let switchHighlightTo = {
  fajr: now,
  sunrise: now,
  dhuhr: now,
  asr: now,
  maghrib: now,
  isha: now,
};

let tableRows = {
  fajr: document.getElementById("fajrRow")!,
  sunrise: document.getElementById("sunriseRow")!,
  dhuhr: document.getElementById("dhuhrRow")!,
  asr: document.getElementById("asrRow")!,
  maghrib: document.getElementById("maghribRow")!,
  isha: document.getElementById("ishaRow")!,
};

let adhanUpdateTimeout: NodeJS.Timeout;

// @ts-ignore - Type gets used in other files
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
/**
 * Returns a Date object for today's date at the specified time.
 * @param time Time string in 24 hour format or 12 hour format
 */
function todayTime(time: string) {
  return new Date(new Date().toLocaleDateString() + " " + time);
}

/**
 * Returns the input date object rounded down to the nearest minute.
 * @param date A Date object
 */
function truncateSeconds(date: Date) {
  return todayTime(date.getHours() + ":" + date.getMinutes());
}

function setDate() {
  let now = new Date();
  let updateInterval =
    new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 0).valueOf() -
    now.valueOf();

  clearTimeout(adhanUpdateTimeout);
  // adhanUpdateTimeout = setTimeout(reloadPage, updateInterval + 300000);
  adhanUpdateTimeout = setTimeout(reloadPage, 3600000 * 2);

  let options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
  gDate.innerText = now.toLocaleDateString(undefined, options);

  // Modify this so it fetches from the iqamah server to save time
  fetch("https://api.aladhan.com/v1/timings?latitude=40.68&longitude=-74.11")
    .then((response) => (response.ok ? response.json() : Promise.reject()))
    .then((json) => setHijriDate(json.data))
    .then(() => fetch("http://bmclock2020.xyz:8080/bayonne-if"))
    .then((response) => (response.ok ? response.json() : Promise.reject()))
    .then(islamicFinderAdhan)
    .then(setIqamahTimes)
    .catch(() => {
      errorMode("Failed getting Adhan times or AH date");
      setTimeout(setDate, 5000);
    });
}

function reloadPage() {
  // TODO change this when deploying new app probably
  fetch("https://bmclock2020.xyz")
    .then((res) => (res.ok ? location.reload() : Promise.reject()))
    .catch(() => {
      errorMode("Failed trying to reload page.");
      setTimeout(reloadPage, 5000);
    });
}

/**
 * Converts a 24-hour format string to 12-hour format with AM/PM
 * @param time 24-hour format string
 */
function formatTime(time: string) {
  // TODO This will fail for times that have hour value of 0 - 9
  let hour = Number.parseInt(time.substring(0, 2));
  if (hour < 12) {
    if (hour == 0) {
      return "12" + time.substring(2) + " AM";
    } else {
      return hour + time.substring(2) + " AM";
    }
  } else {
    if (hour == 12) {
      return "12" + time.substring(2) + " PM";
    } else {
      return (hour % 12) + time.substring(2) + " PM";
    }
  }
}

interface AdhanData {
  timings: {
    Fajr: string;
    Sunrise: string;
    Dhuhr: string;
    Asr: string;
    Maghrib: string;
    Isha: string;
  };
  date: {
    hijri: {
      day: number;
      month: {
        en: string;
        ar: string;
      };
      year: number;
    };
  };
}

function setHijriDate(data: AdhanData) {
  let hijri = data.date.hijri;
  hDate.innerText = hijri.month.en + " " + hijri.day + ", " + hijri.year + " AH";
}

function hightlight(tr: HTMLElement) {
  tr.className = "highlight";
}

function unhighlight() {
  for (let tr of Object.values(tableRows)) {
    tr.className = "";
  }
}

function checkIfHighlightSwitch(now: Date) {
  unhighlight();
  // Checking to make sure nothing gets highlighted before adhan times
  // are set.
  if (adhanTimes.fajr == adhanTimes.sunrise) {
    body.className = "fajr";
    hightlight(tableRows["fajr"]);
    return;
  }
  //
  if (now < switchHighlightTo["sunrise"]) {
    body.className = "fajr";
    iqamahElements.fajr.className = "iqamahCell";
    hightlight(tableRows["fajr"]);
  } else if (now < switchHighlightTo["dhuhr"]) {
    body.className = "sunrise";
    hightlight(tableRows["sunrise"]);
  } else if (now < switchHighlightTo["asr"]) {
    body.className = "dhuhr";
    iqamahElements.dhuhr.className = "iqamahCell";
    hightlight(tableRows["dhuhr"]);
  } else if (now < switchHighlightTo["maghrib"]) {
    body.className = "asr";
    iqamahElements.asr.className = "iqamahCell";
    hightlight(tableRows["asr"]);
  } else if (now < switchHighlightTo["isha"]) {
    body.className = "maghrib";
    iqamahElements.maghrib.className = "iqamahCell";
    hightlight(tableRows["maghrib"]);
  } else if (now < switchHighlightTo["fajr"]) {
    body.className = "isha";
    iqamahElements.isha.className = "iqamahCell";
    hightlight(tableRows["isha"]);
  } else {
    body.className = "fajr";
    iqamahElements.fajr.className = "iqamahCell";
    hightlight(tableRows["fajr"]);
  }
}

function checkIfAdhan(now: Date) {
  for (let key in adhanTimes) {
    let prayer = key as keyof typeof adhanTimes;
    if (now.getDay() == 5 && prayer == "dhuhr") continue; // Skip dhuhr on Jummah
    // TODO This might need to be modified when implementing jummah but possibly not
    if (adhanTimes[prayer].valueOf() == now.valueOf()) {
      playAdhan(prayer);
    }
  }
}

function checkIfIqamah(now: Date) {
  const oneMin = 60000;
  for (let key in iqamahTimes) {
    let iqamah = key as keyof typeof iqamahTimes;
    if (now.getDay() == 5 && iqamah == "dhuhr") continue; // Skip dhuhr on Jummah
    if (now.valueOf() + oneMin == iqamahTimes[iqamah].valueOf()) {
      setTimeout(playIqamah, 50 * 1000);
    }
  }
}

function minuteChecks() {
  let now = truncateSeconds(new Date());
  checkIfHighlightSwitch(now);
  checkIfAdhan(now);
  checkIfIqamah(now);
}

function playAdhan(adhanName: keyof typeof tableRows) {
  let audio = new Audio("/audio/takbeer.mp3");
  audio.play();
  flashPrayer(adhanName, 20, 700);
}

function playIqamah() {
  let audio = new Audio("/audio/lasalah.mp3");
  audio.play();
}

function flashPrayer(adhanName: keyof typeof tableRows, times: number, delay: number) {
  setTimeout(unhighlight, delay);
  setTimeout(hightlight.bind(null, tableRows[adhanName]), delay * 1.9);
  if (times > 1) {
    setTimeout(flashPrayer.bind(null, adhanName, times - 1, delay), delay * 2);
  }
}

function islamicFinderAdhan(res: {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
}) {
  try {
    errorFixed();
    let fajr = res.fajr;
    let sunrise = res.sunrise;
    let dhuhr = res.dhuhr;
    let asr = res.asr;
    let maghrib = res.maghrib;
    let isha = res.isha;

    let removeStart0 = (time: string) => (time[0] == "0" ? time.substring(1) : time);

    adhanElements["fajr"].innerText = removeStart0(fajr);
    adhanElements["sunrise"].innerText = removeStart0(sunrise);
    adhanElements["dhuhr"].innerText = removeStart0(dhuhr);
    adhanElements["asr"].innerText = removeStart0(asr);
    adhanElements["maghrib"].innerText = removeStart0(maghrib);
    adhanElements["isha"].innerText = removeStart0(isha);

    let today = new Date().toLocaleDateString();
    adhanTimes["fajr"] = new Date(today + " " + fajr);
    adhanTimes["sunrise"] = new Date(today + " " + sunrise);
    adhanTimes["dhuhr"] = new Date(today + " " + dhuhr);
    adhanTimes["asr"] = new Date(today + " " + asr);
    adhanTimes["maghrib"] = new Date(today + " " + maghrib);
    adhanTimes["isha"] = new Date(today + " " + isha);

    iqamahTimes["maghrib"] = new Date(adhanTimes["maghrib"].getTime() + 5 * 60000);
    let mIqamah = iqamahTimes["maghrib"];
    // TODO fix this so the function is more robust and these extra sanitation steps dont have to happen here
    let mHour = mIqamah.getHours() < 10 ? "0" + mIqamah.getHours() : "" + mIqamah.getHours();
    let mMin = mIqamah.getMinutes() < 10 ? "0" + mIqamah.getMinutes() : "" + mIqamah.getMinutes();
    iqamahElements["maghrib"].innerText = formatTime(mHour + ":" + mMin);

    // TODO fix this so if you end up adding to a time after midnight it still works
    switchHighlightTo["fajr"] = new Date(iqamahTimes["isha"].valueOf() + 20 * 60000);
    switchHighlightTo["sunrise"] = new Date(iqamahTimes["fajr"].valueOf() + 20 * 60000);
    // Deal with special case of jummah
    switchHighlightTo["dhuhr"] = new Date(adhanTimes["sunrise"].valueOf() + 20 * 60000);
    switchHighlightTo["asr"] = new Date(iqamahTimes["dhuhr"].valueOf() + 20 * 60000);

    switchHighlightTo["maghrib"] = new Date(iqamahTimes["asr"].valueOf() + 20 * 60000);
    switchHighlightTo["isha"] = new Date(iqamahTimes["maghrib"].valueOf() + 20 * 60000);

    checkIfHighlightSwitch(new Date());
  } catch (error) {
    errorMode("Failed setting Adhan times");
  }
}

async function setIqamahTimes() {
  let iqamahParameters: IqamahParameters = await (await fetch("/get_times")).json();
  let today = new Date().toLocaleDateString();
  let iqamahSetter = (prayer: keyof typeof iqamahTimes, val: string) =>
    val.startsWith("A")
      ? new Date(`${today} ${val.substring(2)}`)
      : new Date(adhanTimes[prayer].valueOf() + 60000 * Number.parseInt(val.substring(2)));

  iqamahTimes["fajr"] = iqamahSetter("fajr", iqamahParameters.fajr_iqamah);
  iqamahTimes["dhuhr"] = iqamahSetter("dhuhr", iqamahParameters.dhuhr_iqamah);
  iqamahTimes["asr"] = iqamahSetter("asr", iqamahParameters.asr_iqamah);
  iqamahTimes["maghrib"] = iqamahSetter("maghrib", iqamahParameters.maghrib_iqamah);
  iqamahTimes["isha"] = iqamahSetter("isha", iqamahParameters.isha_iqamah);

  let removeStart0 = (time: string) => (time[0] == "0" ? time.substring(1) : time);

  for (let key in iqamahElements) {
    let prayer = key as keyof typeof iqamahElements;
    let timeString = iqamahTimes[prayer].toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    iqamahElements[prayer].innerText = removeStart0(timeString);
  }

  let getJummahString = (jummahVal: string) => {
    return removeStart0(
      new Date(`${today} ${jummahVal.substring(2)}`).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  };

  // TODO I was setting up the jummah cell in the table
  // TODO Still need to finish this jummah thing, then need to set up timestamp field so I can query
  // every minute and see if refresh needed, then might set up session storage thing to highlight 
  // changed iqamah times
  let tempJummah = getJummahString("jummah_1");
  // adhanElements['jummah'].innerText =
}

function errorMode(errorMessage: string) {
  console.error(errorMessage);
  let jummahLabel = document.getElementsByClassName("topBorder");
  for (let element of Object.values(jummahLabel)) {
    element.classList.remove("topBorder");
    element.classList.add("errorTopBorder");
  }
}

function errorFixed() {
  let jummahLabel = document.getElementsByClassName("errorTopBorder");
  for (let element of Object.values(jummahLabel)) {
    element.classList.remove("errorTopBorder");
    element.classList.add("topBorder");
  }
}

setDate();
clockApp();
window.addEventListener("minutePassed", minuteChecks);

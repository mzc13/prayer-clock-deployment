let timeInputs = {
  fajr: document.getElementById("fajrInput") as HTMLInputElement,
  dhuhr: document.getElementById("dhuhrInput") as HTMLInputElement,
  asr: document.getElementById("asrInput") as HTMLInputElement,
  maghrib: document.getElementById("maghribInput") as HTMLInputElement,
  isha: document.getElementById("ishaInput") as HTMLInputElement,
  jummah1: document.getElementById("jummah1Input") as HTMLInputElement,
  jummah2: document.getElementById("jummah2Input") as HTMLInputElement,
  jummah3: document.getElementById("jummah3Input") as HTMLInputElement,
  jummah4: document.getElementById("jummah4Input") as HTMLInputElement,
};

let selectInputs = {
  fajr: document.getElementById("fajrSelectInput") as HTMLSelectElement,
  dhuhr: document.getElementById("dhuhrSelectInput") as HTMLSelectElement,
  asr: document.getElementById("asrSelectInput") as HTMLSelectElement,
  maghrib: document.getElementById("maghribSelectInput") as HTMLSelectElement,
  isha: document.getElementById("ishaSelectInput") as HTMLSelectElement,
};

let checkboxes = {
  fajr: document.getElementById("fc") as HTMLInputElement,
  dhuhr: document.getElementById("dc") as HTMLInputElement,
  asr: document.getElementById("ac") as HTMLInputElement,
  maghrib: document.getElementById("mc") as HTMLInputElement,
  isha: document.getElementById("ic") as HTMLInputElement,
};

let prayerLabels = {
  fajr: document.getElementById("fajrLabel") as HTMLLabelElement,
  dhuhr: document.getElementById("dhuhrLabel") as HTMLLabelElement,
  asr: document.getElementById("asrLabel") as HTMLLabelElement,
  maghrib: document.getElementById("maghribLabel") as HTMLLabelElement,
  isha: document.getElementById("ishaLabel") as HTMLLabelElement,
  jummah: document.getElementById("jummahLabel") as HTMLLabelElement,
};

let removeJummahButtons = {
  jummah2: document.getElementById("brj2") as HTMLButtonElement,
  jummah3: document.getElementById("brj3") as HTMLButtonElement,
  jummah4: document.getElementById("brj4") as HTMLButtonElement,
};

let jummahDivs = {
  jummah2: document.getElementById("dj2") as HTMLDivElement,
  jummah3: document.getElementById("dj3") as HTMLDivElement,
  jummah4: document.getElementById("dj4") as HTMLDivElement,
};

let addJummahButton = document.getElementById("baj") as HTMLButtonElement;
let jummahCount = 1;

let successLabel = document.getElementById("successLabel")!;

function check(checkbox: HTMLInputElement) {
  let prayer = checkbox.getAttribute("data-prayer") as keyof typeof selectInputs;
  if (checkbox.checked) {
    selectInputs[prayer].classList.remove("hidden");
    timeInputs[prayer].classList.add("hidden");
  } else {
    selectInputs[prayer].classList.add("hidden");
    timeInputs[prayer].classList.remove("hidden");
  }
}

function removeJummah(button: HTMLButtonElement) {
  let jummah = button.getAttribute("data-jummah") as keyof typeof jummahDivs;
  jummahDivs[jummah].classList.add("hidden");
  if (jummah == "jummah4") {
  }
  switch (jummah) {
    case "jummah4":
      removeJummahButtons.jummah3.classList.remove("hidden");
      addJummahButton.classList.remove("hidden");
      break;
    case "jummah3":
      removeJummahButtons.jummah2.classList.remove("hidden");
      break;
  }
  jummahCount > 1 ? (jummahCount -= 1) : (jummahCount = 1);
}

function addJummah() {
  switch (jummahCount) {
    case 3:
      jummahDivs.jummah4.classList.remove("hidden");
      removeJummahButtons.jummah4.classList.remove("hidden");
      removeJummahButtons.jummah3.classList.add("hidden");
      addJummahButton.classList.add("hidden");
      break;
    case 2:
      jummahDivs.jummah3.classList.remove("hidden");
      removeJummahButtons.jummah3.classList.remove("hidden");
      removeJummahButtons.jummah2.classList.add("hidden");
      break;
    case 1:
      jummahDivs.jummah2.classList.remove("hidden");
      removeJummahButtons.jummah2.classList.remove("hidden");
      break;
  }
  jummahCount < 4 ? (jummahCount += 1) : (jummahCount = 4);
}

async function changeTimes() {
  successLabel.classList.add("hidden");
  let getPrayerValue = (prayer: keyof typeof checkboxes) =>
    checkboxes[prayer].checked ? selectInputs[prayer].value : timeInputs[prayer].value;
  let iqamahTimes = {
    fajr_iqamah: getPrayerValue("fajr"),
    dhuhr_iqamah: getPrayerValue("dhuhr"),
    asr_iqamah: getPrayerValue("asr"),
    maghrib_iqamah: getPrayerValue("maghrib"),
    isha_iqamah: getPrayerValue("isha"),
    jummah_1: timeInputs.jummah1.value,
    jummah_2: jummahCount > 1 ? timeInputs.jummah2.value : undefined,
    jummah_3: jummahCount > 2 ? timeInputs.jummah3.value : undefined,
    jummah_4: jummahCount > 3 ? timeInputs.jummah4.value : undefined,
  };
  Object.values(prayerLabels).forEach((label) => label.classList.remove("text-red-500"));
  if (iqamahTimes.fajr_iqamah == "") {
    prayerLabels.fajr.classList.add("text-red-500");
    return;
  } else if (iqamahTimes.dhuhr_iqamah == "") {
    prayerLabels.dhuhr.classList.add("text-red-500");
    return;
  } else if (iqamahTimes.asr_iqamah == "") {
    prayerLabels.asr.classList.add("text-red-500");
    return;
  } else if (iqamahTimes.maghrib_iqamah == "") {
    prayerLabels.maghrib.classList.add("text-red-500");
    return;
  } else if (iqamahTimes.isha_iqamah == "") {
    prayerLabels.isha.classList.add("text-red-500");
    return;
  } else if (
    iqamahTimes.jummah_1 == "" ||
    iqamahTimes.jummah_2 == "" ||
    iqamahTimes.jummah_3 == "" ||
    iqamahTimes.jummah_4 == ""
  ) {
    prayerLabels.jummah.classList.add("text-red-500");
    return;
  }

  const res = await fetch("/change_times", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(iqamahTimes),
  });
  if (res.ok) {
    successLabel.classList.remove("hidden");
    setTimeout(() => location.reload(), 3000);
  } else {
    location.href = "/login";
  }
}

function init(iqamahTimes: IqamahParameters) {
  let initPrayer = (prayer: keyof typeof checkboxes, val: string) => {
    if (val.startsWith("A")) {
      checkboxes[prayer].checked = false;
      check(checkboxes[prayer]);
      timeInputs[prayer].value = val.substring(2);
    } else {
      checkboxes[prayer].checked = true;
      check(checkboxes[prayer]);
      selectInputs[prayer].value = val.substring(2);
    }
  };
  initPrayer("fajr", iqamahTimes.fajr_iqamah);
  initPrayer("dhuhr", iqamahTimes.dhuhr_iqamah);
  initPrayer("asr", iqamahTimes.asr_iqamah);
  initPrayer("maghrib", iqamahTimes.maghrib_iqamah);
  initPrayer("isha", iqamahTimes.isha_iqamah);

  jummahCount = 1;
  timeInputs.jummah1.value = iqamahTimes.jummah_1;
  let initJummah = (jummah: keyof typeof jummahDivs, val: string | undefined) => {
    if (val != undefined && val != "") {
      addJummah();
      timeInputs[jummah].value = val;
    }
  };
  initJummah("jummah2", iqamahTimes.jummah_2);
  initJummah("jummah3", iqamahTimes.jummah_3);
  initJummah("jummah4", iqamahTimes.jummah_4);
}

fetch("/get_times")
  .then((res) => res.json())
  .then(init);

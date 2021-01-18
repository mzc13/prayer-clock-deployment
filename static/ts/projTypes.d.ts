type IqamahParameters = {
  timestamp: number;
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

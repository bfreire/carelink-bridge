export interface NightscoutSGVEntry {
  type: 'sgv';
  sgv: number;
  date: number;
  dateString: string;
  device: string;
  direction?: string;
  trend?: number;
}

export interface NightscoutDeviceStatus {
  created_at: string;
  device: string;
  uploader: {
    battery: number;
  };
  pump?: {
    battery: { percent: number };
    reservoir: number | undefined;
    iob: {
      timestamp: string;
      bolusiob?: number;
    };
    clock: string;
  };
  connect: {
    sensorState: string;
    calibStatus: string;
    sensorDurationHours: number;
    timeToNextCalibHours: number;
    conduitInRange: boolean;
    conduitMedicalDeviceInRange: boolean;
    conduitSensorInRange: boolean;
    medicalDeviceBatteryLevelPercent?: number;
    medicalDeviceFamily?: string;
  };
}

export interface NightscoutTreatment {
  eventType: string;
  created_at: string;
  insulin?: number;
  carbs?: number;
  duration?: number; // minutes, for Combo Bolus extended part
  notes?: string;
  device?: string;
}

export interface TransformResult {
  devicestatus: NightscoutDeviceStatus[];
  entries: NightscoutSGVEntry[];
  treatments: NightscoutTreatment[];
}

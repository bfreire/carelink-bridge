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
    /** Reservoir fill level as a percentage (0–100) */
    reservoirPercent?: number;
    /** True when the pump is suspended */
    suspended?: boolean;
    iob: {
      timestamp: string;
      bolusiob?: number;
    };
    clock: string;
    /** Active basal delivery */
    basal?: {
      rate: number;
      activeProfile: string;
    };
    /** SmartGuard / Auto Mode state */
    autoMode?: {
      shieldState: string;
      readinessState: string;
    };
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
    /** Sensor transmitter (Guardian Link) battery % */
    gstBatteryLevel?: number;
    /** CGM statistics from the last reporting window */
    timeInRange?: number;
    averageSG?: number;
    belowHypoLimit?: number;
    aboveHyperLimit?: number;
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

// ─── Marker types ────────────────────────────────────────────────────────────

export type CareLinkMarkerActivationType =
  | 'AUTOCORRECTION'
  | 'MANUAL'
  | 'RECOMMENDED'
  | 'UNDETERMINED';

export type CareLinkMarkerBolusType = 'NORMAL' | 'EXTENDED' | 'MULTIWAVE';

export interface CareLinkMarkerBase {
  type: string;
  index: number;
  kind: string;
  version: number;
  dateTime: string;
  relativeOffset: number;
}

/** Bolus delivered by user or SmartGuard auto-correction — NOT basal micro-boluses */
export interface CareLinkMarkerInsulin extends CareLinkMarkerBase {
  type: 'INSULIN';
  activationType: CareLinkMarkerActivationType;
  bolusType: CareLinkMarkerBolusType;
  programmedFastAmount: number;
  deliveredFastAmount: number;
  programmedExtendedAmount: number;
  deliveredExtendedAmount: number;
  programmedDuration: number;
  effectiveDuration: number;
  completed: boolean;
  id: string;
}

export interface CareLinkMarkerMeal extends CareLinkMarkerBase {
  type: 'MEAL';
  amount: number; // grams of carbs
}

export interface CareLinkMarkerCalibration extends CareLinkMarkerBase {
  type: 'CALIBRATION';
  value: number;
  calibrationSuccess: boolean;
}

/**
 * SmartGuard basal micro-bolus — part of closed-loop basal delivery.
 * These are NOT bolus treatments and should be ignored for /treatments.json.
 */
export interface CareLinkMarkerAutoBasal extends CareLinkMarkerBase {
  type: 'AUTO_BASAL_DELIVERY';
}

export type CareLinkMarker =
  | CareLinkMarkerInsulin
  | CareLinkMarkerMeal
  | CareLinkMarkerCalibration
  | CareLinkMarkerAutoBasal
  | (CareLinkMarkerBase & { type: string });

// ─────────────────────────────────────────────────────────────────────────────

export interface CareLinkSG {
  sg: number;
  datetime: string;
  version: number;
  timeChange: boolean;
  kind: 'SG';
}

export interface CareLinkActiveInsulin {
  datetime: string;
  version: number;
  amount: number;
  kind: 'Insulin';
}

export interface CareLinkAlarm {
  type: string;
  version: number;
  flash: boolean;
  datetime: string;
  kind: 'Alarm';
  code: number;
}

export interface CareLinkData {
  sgs: CareLinkSG[];
  lastSG: CareLinkSG;
  lastSGTrend: string;
  currentServerTime: number;
  sMedicalDeviceTime: string;
  lastMedicalDeviceDataUpdateServerTime: number;
  medicalDeviceFamily: string;
  medicalDeviceBatteryLevelPercent: number;
  conduitBatteryLevel: number;
  conduitBatteryStatus: string;
  conduitInRange: boolean;
  conduitMedicalDeviceInRange: boolean;
  conduitSensorInRange: boolean;
  sensorState: string;
  calibStatus: string;
  sensorDurationHours: number;
  timeToNextCalibHours: number;
  reservoirRemainingUnits?: number;
  reservoirAmount?: number;
  reservoirLevelPercent?: number;
  medicalDeviceSuspended?: boolean;
  activeInsulin?: CareLinkActiveInsulin;
  lastAlarm?: CareLinkAlarm;
  markers?: CareLinkMarker[];
  // CGM statistics (last ~24 h window reported by CareLink)
  timeInRange?: number;
  averageSG?: number;
  belowHypoLimit?: number;
  aboveHyperLimit?: number;
  // Sensor transmitter battery (NGP / Guardian Link)
  gstBatteryLevel?: number;
  // Current basal delivery
  basal?: {
    activeBasalPattern: string;
    basalRate: number;
  };
  // SmartGuard / Auto Mode state
  therapyAlgorithmState?: {
    autoModeShieldState: string;
    autoModeReadinessState: string;
    plgmLgsState: string;
    safeBasalDuration: number;
    waitToCalibrateDuration: number;
  };
  bgUnits?: string;
  bgunits?: string;
  timeFormat?: string;
  [key: string]: unknown;
}

export interface CareLinkUserInfo {
  id?: string;
  accountId?: number;
  username?: string;
  firstName?: string;
  lastName?: string;
  country?: string;
  language?: string;
  role: string;
  loginDateUTC?: string;
  cpRegistrationStatus?: string | null;
  accountSuspended?: string | null;
  needToReconsent?: boolean;
  mfaRequired?: boolean;
  mfaEnabled?: boolean;
}

export interface CareLinkPatientLink {
  username: string;
}

export interface CareLinkCountrySettings {
  blePereodicDataEndpoint?: string;
}

export interface LoginData {
  access_token: string;
  refresh_token: string;
  scope?: string;
  client_id: string;
  token_url: string;
  audience?: string;
}

export interface Auth0SSOConfig {
  server: {
    hostname: string;
    port?: number;
    prefix?: string;
  };
  client: {
    client_id: string;
    scope: string;
    audience: string;
    redirect_uri: string;
  };
  system_endpoints: {
    authorization_endpoint_path: string;
    token_endpoint_path: string;
  };
}

export interface DiscoverResponse {
  CP: Array<{
    region: string;
    UseSSOConfiguration?: string;
    Auth0SSOConfiguration?: string;
    [key: string]: unknown;
  }>;
}

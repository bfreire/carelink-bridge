import type {
  CareLinkData,
  CareLinkMarkerInsulin,
  CareLinkMarkerMeal,
} from '../types/carelink.js';
import type { NightscoutTreatment } from '../types/nightscout.js';

/**
 * Two markers are considered "co-occurring" (i.e. the INSULIN is for a meal)
 * if their pump timestamps are within this window.
 */
const MEAL_BOLUS_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

function parseMarkerTime(dateTime: string, offsetMilliseconds: number): number {
  return Date.parse(dateTime) - offsetMilliseconds;
}

function timestampAsString(timestamp: number): string {
  return new Date(timestamp).toISOString();
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Convert CareLink marker data into Nightscout treatment entries.
 *
 * Rules:
 *  - AUTO_BASAL_DELIVERY: ignored — these are SmartGuard closed-loop basal
 *    micro-boluses, not user treatments.
 *  - INSULIN (activationType === 'AUTOCORRECTION'): SmartGuard auto-correction
 *    bolus → "Correction Bolus" with notes.
 *  - INSULIN (manual) within MEAL_BOLUS_WINDOW_MS of a MEAL marker:
 *    "Meal Bolus" with both insulin and carbs.
 *  - INSULIN (manual, EXTENDED or MULTIWAVE): "Combo Bolus".
 *  - INSULIN (manual, NORMAL, no meal match): "Correction Bolus".
 *  - MEAL without a matching INSULIN: "Carb Correction".
 *  - Incomplete boluses (completed === false) are skipped.
 */
export function treatmentEntries(
  data: CareLinkData,
  offsetMilliseconds: number,
  device: string,
): NightscoutTreatment[] {
  const markers = data.markers;
  if (!markers?.length) return [];

  const insulinMarkers = markers.filter(
    (m): m is CareLinkMarkerInsulin =>
      m.type === 'INSULIN' &&
      (m as CareLinkMarkerInsulin).completed !== false,
  );

  const mealMarkers = markers.filter(
    (m): m is CareLinkMarkerMeal => m.type === 'MEAL',
  );

  const treatments: NightscoutTreatment[] = [];
  const matchedMealIndices = new Set<number>();

  for (const ins of insulinMarkers) {
    const insTime = parseMarkerTime(ins.dateTime, offsetMilliseconds);

    // Total delivered = fast (immediate) + extended (over duration)
    const amount = round2(ins.deliveredFastAmount + ins.deliveredExtendedAmount);
    if (amount <= 0) continue;

    const isAuto = ins.activationType === 'AUTOCORRECTION';
    const isCombo = ins.bolusType === 'EXTENDED' || ins.bolusType === 'MULTIWAVE';

    // Only manual boluses can be meal boluses — pump-initiated corrections never are
    let matchedMeal: CareLinkMarkerMeal | undefined;
    let matchedMealIdx = -1;
    if (!isAuto) {
      for (let i = 0; i < mealMarkers.length; i++) {
        if (matchedMealIndices.has(i)) continue; // already claimed
        const mealTime = parseMarkerTime(mealMarkers[i].dateTime, offsetMilliseconds);
        if (Math.abs(insTime - mealTime) <= MEAL_BOLUS_WINDOW_MS) {
          matchedMeal = mealMarkers[i];
          matchedMealIdx = i;
          break;
        }
      }
    }

    let eventType: string;
    if (matchedMeal) {
      eventType = 'Meal Bolus';
    } else if (isCombo) {
      eventType = 'Combo Bolus';
    } else {
      eventType = 'Correction Bolus';
    }

    const treatment: NightscoutTreatment = {
      eventType,
      created_at: timestampAsString(insTime),
      insulin: amount,
      device,
    };

    if (matchedMeal) {
      treatment.carbs = matchedMeal.amount;
      matchedMealIndices.add(matchedMealIdx);
    }

    if (isAuto) {
      treatment.notes = 'SmartGuard Auto-Correction';
    }

    // For Combo/Multiwave boluses record the extended duration in minutes
    if (isCombo && ins.effectiveDuration > 0) {
      treatment.duration = ins.effectiveDuration;
    }

    treatments.push(treatment);
  }

  // Any MEAL marker that wasn't paired with a bolus → standalone carb entry
  for (let i = 0; i < mealMarkers.length; i++) {
    if (matchedMealIndices.has(i)) continue;
    const meal = mealMarkers[i];
    const mealTime = parseMarkerTime(meal.dateTime, offsetMilliseconds);
    treatments.push({
      eventType: 'Carb Correction',
      created_at: timestampAsString(mealTime),
      carbs: meal.amount,
      device,
    });
  }

  return treatments;
}

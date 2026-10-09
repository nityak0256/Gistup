/**
 * Meal-time configuration for Hostel Food tracker.
 * Pure TypeScript, zero React dependencies.
 *
 * NOTE: As per design requirements, meal timings are internal logic ONLY
 * and MUST NOT be displayed anywhere in the UI.
 */

export type MealType = 'breakfast' | 'lunch' | 'snacks' | 'dinner';

export interface MealSlotConfig {
  id: MealType;
  name: string;
  // Official running hours (internal only)
  runningStart: string; // e.g. "07:30"
  runningEnd: string;   // e.g. "08:30"
}

export const MEAL_SLOTS: MealSlotConfig[] = [
  { id: 'breakfast', name: 'Breakfast', runningStart: '07:30', runningEnd: '08:30' },
  { id: 'lunch', name: 'Lunch', runningStart: '12:30', runningEnd: '13:30' },
  { id: 'snacks', name: 'Snacks & Tea', runningStart: '17:00', runningEnd: '17:30' },
  { id: 'dinner', name: 'Dinner', runningStart: '19:30', runningEnd: '20:30' },
];

/**
 * Assigns each photo to the UPCOMING or currently running meal based on when it was sent:
 * - 8:30 AM – 1:30 PM  = Lunch
 * - 1:30 PM – 5:30 PM  = Snacks & Tea
 * - 5:30 PM – 8:30 PM  = Dinner
 * - 8:30 PM – 8:30 AM  = Breakfast
 */
export function getMealForSentTime(dateOrTimeStr: string | Date): MealType {
  let date: Date;

  if (typeof dateOrTimeStr === 'string') {
    // Try matching time e.g. "10:15", "10:15 AM", "12/03/24, 14:20"
    const timeMatch = dateOrTimeStr.match(/(\d{1,2}):(\d{2})(?::\d{2})?\s*([AaPp][Mm])?/);
    if (timeMatch) {
      let hours = parseInt(timeMatch[1], 10);
      const minutes = parseInt(timeMatch[2], 10);
      const ampm = timeMatch[3]?.toUpperCase();

      if (ampm === 'PM' && hours < 12) hours += 12;
      if (ampm === 'AM' && hours === 12) hours = 0;

      const totalMins = hours * 60 + minutes;

      // 8:30 AM is 8*60+30 = 510
      // 1:30 PM is 13*60+30 = 810
      // 5:30 PM is 17*60+30 = 1050
      // 8:30 PM is 20*60+30 = 1230

      if (totalMins >= 510 && totalMins < 810) {
        return 'lunch';
      }
      if (totalMins >= 810 && totalMins < 1050) {
        return 'snacks';
      }
      if (totalMins >= 1050 && totalMins < 1230) {
        return 'dinner';
      }
      // 8:30 PM to 8:30 AM = Breakfast
      return 'breakfast';
    }
    date = new Date();
  } else {
    date = dateOrTimeStr;
  }

  const hours = date.getHours();
  const minutes = date.getMinutes();
  const totalMins = hours * 60 + minutes;

  if (totalMins >= 510 && totalMins < 810) return 'lunch';
  if (totalMins >= 810 && totalMins < 1050) return 'snacks';
  if (totalMins >= 1050 && totalMins < 1230) return 'dinner';
  return 'breakfast';
}

export function getMealLabel(meal: MealType): string {
  switch (meal) {
    case 'breakfast':
      return 'Breakfast';
    case 'lunch':
      return 'Lunch';
    case 'snacks':
      return 'Snacks & Tea';
    case 'dinner':
      return 'Dinner';
  }
}

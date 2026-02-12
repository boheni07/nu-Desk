
import { addDays, isWeekend, format, isAfter, addHours, setHours, getHours } from 'date-fns';

/**
 * Calculates a date after N business days (excluding Saturday and Sunday).
 */
export const addBusinessDays = (startDate: Date, days: number): Date => {
  let count = 0;
  let currentDate = startDate;
  while (count < days) {
    currentDate = addDays(currentDate, 1);
    if (!isWeekend(currentDate)) {
      count++;
    }
  }
  return currentDate;
};

/**
 * Calculates a date after N business hours (09:00 - 18:00, excluding weekends).
 */
export const addBusinessHours = (startDate: Date, hours: number): Date => {
  let remainingHours = hours;
  let currentDate = new Date(startDate);
  const START_HOUR = 9;
  const END_HOUR = 18;

  while (remainingHours > 0) {
    // 1. If currently on weekend or outside business hours, jump to next business start
    if (isWeekend(currentDate) || getHours(currentDate) >= END_HOUR) {
      currentDate = addDays(currentDate, 1);
      currentDate = setHours(currentDate, START_HOUR);
      currentDate.setMinutes(0);
      currentDate.setSeconds(0);
      currentDate.setMilliseconds(0);
      continue;
    }
    if (getHours(currentDate) < START_HOUR) {
      currentDate = setHours(currentDate, START_HOUR);
      currentDate.setMinutes(0);
      currentDate.setSeconds(0);
      currentDate.setMilliseconds(0);
    }

    // 2. Calculate remaining hours in current business day
    const currentHour = getHours(currentDate);
    const minsInCurrentHour = currentDate.getMinutes() / 60;
    const availableHoursInDay = END_HOUR - (currentHour + minsInCurrentHour);

    if (remainingHours <= availableHoursInDay) {
      // Finish in current day
      currentDate = addHours(currentDate, remainingHours);
      remainingHours = 0;
    } else {
      // Move to next business day start
      remainingHours -= availableHoursInDay;
      currentDate = addDays(currentDate, 1);
      currentDate = setHours(currentDate, START_HOUR);
      currentDate.setMinutes(0);
      currentDate.setSeconds(0);
      currentDate.setMilliseconds(0);
    }
  }
  return currentDate;
};

export const formatDate = (date: string | Date | null | undefined): string => {
  if (!date) return '날짜 없음';
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '유효하지 않은 날짜';
    return format(d, 'yyyy-MM-dd HH:mm');
  } catch (e) {
    return '날짜 오류';
  }
};

export const isOverdue = (dueDate: string): boolean => {
  return isAfter(new Date(), new Date(dueDate));
};

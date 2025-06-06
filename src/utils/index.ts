import { Habit, HabitLog } from "../types";

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const getDateString = (date: Date): string => {
  return date.toISOString().split("T")[0];
};

export const isToday = (date: Date): boolean => {
  const today = new Date();
  return getDateString(date) === getDateString(today);
};

export const isHabitDueToday = (habit: Habit): boolean => {
  const today = new Date();
  const todayString = getDateString(today);

  // Check if already completed today
  if (habit.completedDates.includes(todayString)) {
    return false;
  }

  // Check if already missed today
  if (habit.missedDates.includes(todayString)) {
    return false;
  }

  switch (habit.frequency) {
    case "daily":
      return true;
    case "weekly":
      // Due on the same day of week as created
      const createdDay = habit.createdAt.getDay();
      return today.getDay() === createdDay;
    case "monthly":
      // Due on the same date of month as created
      const createdDate = habit.createdAt.getDate();
      return today.getDate() === createdDate;
    default:
      return false;
  }
};

export const calculateStreak = (completedDates: string[]): number => {
  if (completedDates.length === 0) return 0;

  const sortedDates = completedDates
    .map((date) => new Date(date))
    .sort((a, b) => b.getTime() - a.getTime());

  let streak = 1;
  for (let i = 1; i < sortedDates.length; i++) {
    const current = sortedDates[i - 1];
    const previous = sortedDates[i];
    const daysDiff = Math.floor(
      (current.getTime() - previous.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysDiff === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
};

export const shouldChargeForMissedHabit = (habit: Habit): boolean => {
  const today = new Date();
  const todayString = getDateString(today);

  // Already processed today
  if (
    habit.completedDates.includes(todayString) ||
    habit.missedDates.includes(todayString)
  ) {
    return false;
  }

  // Check if habit was due yesterday and not completed
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayString = getDateString(yesterday);

  return (
    !habit.completedDates.includes(yesterdayString) &&
    isHabitDueToday({ ...habit, createdAt: yesterday })
  );
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

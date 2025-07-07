import { Habit, MissReason, PendingReason } from "../types";

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
};

export const getDateString = (date: Date): string => {
  return date.toISOString().split("T")[0];
};

export const isToday = (date: Date): boolean => {
  const today = new Date();
  return getDateString(date) === getDateString(today);
};

export const getStartOfWeek = (date: Date): Date => {
  const start = new Date(date);
  start.setDate(date.getDate() - date.getDay());
  start.setHours(0, 0, 0, 0);
  return start;
};

export const getEndOfWeek = (date: Date): Date => {
  const end = new Date(date);
  end.setDate(date.getDate() - date.getDay() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
};

export const getStartOfMonth = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth(), 1);
};

export const getEndOfMonth = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
};

export const isHabitDueToday = (
  habit: Habit,
  today: Date = new Date()
): boolean => {
  const todayString = getDateString(today);

  // Don't show habits that are already completed or missed today
  if (
    habit.completedDates.includes(todayString) ||
    habit.missedDates.includes(todayString)
  ) {
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

    case "custom":
      // Handle interval days (every X days)
      if (habit.customFrequency?.intervalDays) {
        const intervalDays = habit.customFrequency.intervalDays;
        const daysSinceCreation = Math.floor(
          (today.getTime() - habit.createdAt.getTime()) / (1000 * 60 * 60 * 24)
        );
        return daysSinceCreation % intervalDays === 0;
      }

      // Handle X times per week
      if (habit.customFrequency?.timesPerWeek) {
        const timesPerWeek = habit.customFrequency.timesPerWeek;
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        weekStart.setHours(0, 0, 0, 0);

        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);

        const completedThisWeek = habit.completedDates.filter((dateStr) => {
          const date = new Date(dateStr);
          return date >= weekStart && date <= weekEnd;
        }).length;

        return completedThisWeek < timesPerWeek;
      }

      // Handle X times per month
      if (habit.customFrequency?.timesPerMonth) {
        const timesPerMonth = habit.customFrequency.timesPerMonth;
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        const completedThisMonth = habit.completedDates.filter((dateStr) => {
          const date = new Date(dateStr);
          return date >= monthStart && date <= monthEnd;
        }).length;

        return completedThisMonth < timesPerMonth;
      }

      // Handle X times in Y days using sliding window
      if (
        habit.customFrequency?.timesInPeriod &&
        habit.customFrequency?.periodDays
      ) {
        const timesInPeriod = habit.customFrequency.timesInPeriod;
        const periodDays = habit.customFrequency.periodDays;

        const periodStart = new Date(today);
        periodStart.setDate(today.getDate() - periodDays + 1);
        periodStart.setHours(0, 0, 0, 0);

        const completedInPeriod = habit.completedDates.filter((dateStr) => {
          const date = new Date(dateStr);
          return date >= periodStart && date <= today;
        }).length;

        return completedInPeriod < timesInPeriod;
      }

      // Handle specific days of week
      if (habit.customFrequency?.daysOfWeek) {
        return habit.customFrequency.daysOfWeek.includes(today.getDay());
      }

      return false;

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

export const detectSlippedHabits = (habits: Habit[]): PendingReason[] => {
  const today = new Date();
  const pendingReasons: PendingReason[] = [];

  habits.forEach((habit) => {
    if (!habit.isActive) return;

    const slippedDates = findSlippedDates(habit, today);

    slippedDates.forEach((date) => {
      const dateString = getDateString(date);

      // If not already missed with reason
      if (!habit.missReasons[dateString]) {
        pendingReasons.push({
          habitId: habit.id,
          date: dateString,
          habitTitle: habit.title,
        });
      }
    });
  });

  return pendingReasons;
};

const findSlippedDates = (habit: Habit, currentDate: Date): Date[] => {
  const slippedDates: Date[] = [];

  switch (habit.frequency) {
    case "daily":
      // Check yesterday if not completed and not already processed
      const yesterday = new Date(currentDate);
      yesterday.setDate(yesterday.getDate() - 1);
      if (shouldMarkAsSlipped(habit, yesterday)) {
        slippedDates.push(yesterday);
      }
      break;

    case "weekly":
      // Check if the week ending yesterday was missed
      const lastWeekEnd = new Date(currentDate);
      lastWeekEnd.setDate(lastWeekEnd.getDate() - 1);
      if (
        isEndOfWeekPeriod(lastWeekEnd) &&
        shouldMarkAsSlipped(habit, lastWeekEnd)
      ) {
        slippedDates.push(lastWeekEnd);
      }
      break;

    case "monthly":
      // Check if the month ending yesterday was missed
      const lastMonthEnd = new Date(currentDate);
      lastMonthEnd.setDate(lastMonthEnd.getDate() - 1);
      if (
        isEndOfMonthPeriod(lastMonthEnd) &&
        shouldMarkAsSlipped(habit, lastMonthEnd)
      ) {
        slippedDates.push(lastMonthEnd);
      }
      break;

    case "custom":
      // For custom frequency, check based on the specific pattern
      if (habit.customFrequency?.daysOfWeek) {
        // Check each day of the week that was supposed to happen
        for (let i = 1; i <= 7; i++) {
          const checkDate = new Date(currentDate);
          checkDate.setDate(checkDate.getDate() - i);

          if (
            habit.customFrequency.daysOfWeek.includes(checkDate.getDay()) &&
            shouldMarkAsSlipped(habit, checkDate)
          ) {
            slippedDates.push(checkDate);
          }
        }
      }
      break;
  }

  return slippedDates;
};

const shouldMarkAsSlipped = (habit: Habit, date: Date): boolean => {
  const dateString = getDateString(date);

  // Don't mark as slipped if:
  // 1. It was completed
  // 2. It was already missed with or without reason
  // 3. It's before the habit was created
  return (
    !habit.completedDates.includes(dateString) &&
    !habit.missedDates.includes(dateString) &&
    date >= habit.createdAt
  );
};

const isEndOfWeekPeriod = (date: Date): boolean => {
  // Consider end of week as Sunday
  return date.getDay() === 0;
};

const isEndOfMonthPeriod = (date: Date): boolean => {
  const tomorrow = new Date(date);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.getMonth() !== date.getMonth();
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

export const getMissReasonLabel = (reason: MissReason["reason"]): string => {
  const labels = {
    stressed: "Stressed/Tired",
    distracted: "Distracted",
    no_time: "Ran out of time",
    sick: "Feeling sick",
    emergency: "Emergency situation",
    other: "Other reason",
  };
  return labels[reason];
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const formatFrequencyDisplay = (habit: Habit): string => {
  switch (habit.frequency) {
    case "daily":
      return "Daily";

    case "weekly":
      return "Weekly";

    case "monthly":
      return "Monthly";

    case "custom":
      if (habit.customFrequency?.intervalDays) {
        const days = habit.customFrequency.intervalDays;
        return days === 1 ? "Daily" : `Every ${days} days`;
      }
      if (habit.customFrequency?.timesPerWeek) {
        return `${habit.customFrequency.timesPerWeek}x per week`;
      }
      if (habit.customFrequency?.timesPerMonth) {
        return `${habit.customFrequency.timesPerMonth}x per month`;
      }
      if (
        habit.customFrequency?.timesInPeriod &&
        habit.customFrequency?.periodDays
      ) {
        return `${habit.customFrequency.timesInPeriod}x in ${habit.customFrequency.periodDays} days`;
      }
      if (habit.customFrequency?.daysOfWeek) {
        return `${habit.customFrequency.daysOfWeek.length} days/week`;
      }
      return "Custom";

    default:
      return "Unknown";
  }
};

import { Habit, User, Payment, HabitLog } from "../types";

export const generateSampleData = () => {
  const user: User = {
    id: "user_1",
    name: "Alex Johnson",
    email: "alex@example.com",
    totalPledged: 75,
    totalCharged: 45,
    activeHabits: 3,
    joinedAt: new Date("2024-01-01"),
    lastAppOpen: new Date(),
  };

  const habits: Habit[] = [
    {
      id: "habit_1",
      title: "Morning Exercise",
      description: "Complete 30 minutes of exercise every morning",
      frequency: "daily",
      pledgeAmount: 5,
      isActive: true,
      createdAt: new Date("2024-01-01"),
      lastCompleted: new Date(),
      streak: 7,
      totalPledged: 25,
      completedDates: [
        "2024-01-01",
        "2024-01-02",
        "2024-01-03",
        "2024-01-04",
        "2024-01-05",
        "2024-01-06",
        new Date().toISOString().split("T")[0], // Today
      ],
      missedDates: [],
      pendingReasonDates: [],
      missReasons: {},
    },
    {
      id: "habit_2",
      title: "Read for 1 Hour",
      description: "Read books for personal development",
      frequency: "daily",
      pledgeAmount: 10,
      isActive: true,
      createdAt: new Date("2024-01-02"),
      streak: 0,
      totalPledged: 30,
      completedDates: ["2024-01-02", "2024-01-03", "2024-01-05"],
      missedDates: ["2024-01-04", "2024-01-06"],
      pendingReasonDates: [],
      missReasons: {
        "2024-01-04": {
          reason: "stressed",
          timestamp: new Date("2024-01-04T22:00:00"),
        },
        "2024-01-06": {
          reason: "no_time",
          timestamp: new Date("2024-01-06T23:30:00"),
        },
      },
    },
    {
      id: "habit_3",
      title: "Meditation",
      description: "Practice mindfulness meditation",
      frequency: "daily",
      pledgeAmount: 3,
      isActive: true,
      createdAt: new Date("2024-01-03"),
      streak: 2,
      totalPledged: 15,
      completedDates: ["2024-01-03", "2024-01-05", "2024-01-06"],
      missedDates: ["2024-01-04"],
      pendingReasonDates: [
        "2024-01-07", // Yesterday - pending reason
      ],
      missReasons: {
        "2024-01-04": {
          reason: "distracted",
          timestamp: new Date("2024-01-04T21:00:00"),
        },
      },
    },
    {
      id: "habit_4",
      title: "Weekly Gym Session",
      description: "Attend gym for strength training",
      frequency: "weekly",
      pledgeAmount: 15,
      isActive: true,
      createdAt: new Date("2024-01-01"),
      streak: 1,
      totalPledged: 15,
      completedDates: [
        "2024-01-07", // Last Sunday
      ],
      missedDates: [
        "2023-12-31", // Previous week
      ],
      pendingReasonDates: [],
      missReasons: {
        "2023-12-31": {
          reason: "sick",
          timestamp: new Date("2023-12-31T20:00:00"),
        },
      },
    },
    {
      id: "habit_5",
      title: "Yoga Practice",
      description: "Practice yoga 3 times per week",
      frequency: "custom",
      customFrequency: {
        timesPerWeek: 3,
        daysOfWeek: [1, 3, 5], // Monday, Wednesday, Friday
      },
      pledgeAmount: 8,
      isActive: true,
      createdAt: new Date("2024-01-01"),
      streak: 4,
      totalPledged: 8,
      completedDates: [
        "2024-01-01", // Monday
        "2024-01-03", // Wednesday
        "2024-01-05", // Friday
        "2024-01-08", // Next Monday
      ],
      missedDates: [],
      pendingReasonDates: [],
      missReasons: {},
    },
  ];

  const payments: Payment[] = [
    {
      id: "payment_1",
      habitId: "habit_2",
      amount: 10,
      date: new Date("2024-01-04"),
      reason: "Missed habit: Read for 1 Hour",
      missReason: {
        reason: "stressed",
        timestamp: new Date("2024-01-04T22:00:00"),
      },
      status: "completed",
    },
    {
      id: "payment_2",
      habitId: "habit_2",
      amount: 10,
      date: new Date("2024-01-06"),
      reason: "Missed habit: Read for 1 Hour",
      missReason: {
        reason: "no_time",
        timestamp: new Date("2024-01-06T23:30:00"),
      },
      status: "completed",
    },
    {
      id: "payment_3",
      habitId: "habit_3",
      amount: 3,
      date: new Date("2024-01-04"),
      reason: "Missed habit: Meditation",
      missReason: {
        reason: "distracted",
        timestamp: new Date("2024-01-04T21:00:00"),
      },
      status: "completed",
    },
    {
      id: "payment_4",
      habitId: "habit_4",
      amount: 15,
      date: new Date("2023-12-31"),
      reason: "Missed habit: Weekly Gym Session",
      missReason: {
        reason: "sick",
        timestamp: new Date("2023-12-31T20:00:00"),
      },
      status: "completed",
    },
  ];

  const habitLogs: HabitLog[] = [
    {
      id: "log_1",
      habitId: "habit_1",
      date: new Date().toISOString().split("T")[0],
      completed: true,
      note: "Great morning workout!",
    },
    {
      id: "log_2",
      habitId: "habit_2",
      date: "2024-01-04",
      completed: false,
      missReason: {
        reason: "stressed",
        timestamp: new Date("2024-01-04T22:00:00"),
      },
    },
    {
      id: "log_3",
      habitId: "habit_3",
      date: "2024-01-04",
      completed: false,
      missReason: {
        reason: "distracted",
        timestamp: new Date("2024-01-04T21:00:00"),
      },
    },
  ];

  return {
    user,
    habits,
    payments,
    habitLogs,
  };
};

// Helper function to load sample data (useful for testing)
export const loadSampleData = async () => {
  const { StorageService } = await import("../services/storage");
  const { habits, user } = generateSampleData();

  // Save sample habits
  await StorageService.saveHabits(habits);

  // Save sample user
  await StorageService.saveUser(user);

  console.log("Sample data loaded successfully!");
};

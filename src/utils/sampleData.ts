import { Habit, User } from "../types";
import { generateId } from "./index";

export const sampleHabits: Habit[] = [
  {
    id: generateId(),
    title: "Morning Exercise",
    description: "Do 30 minutes of cardio or strength training",
    frequency: "daily",
    pledgeAmount: 5,
    isActive: true,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    streak: 5,
    totalPledged: 10, // Missed twice
    completedDates: [
      new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
    ],
    missedDates: [
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
    ],
  },
  {
    id: generateId(),
    title: "Read for 20 minutes",
    description: "Read books, articles, or educational content",
    frequency: "daily",
    pledgeAmount: 3,
    isActive: true,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    streak: 3,
    totalPledged: 6, // Missed twice
    completedDates: [
      new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
    ],
    missedDates: [
      new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
    ],
  },
  {
    id: generateId(),
    title: "Weekly Meal Prep",
    description: "Prepare healthy meals for the week",
    frequency: "weekly",
    pledgeAmount: 10,
    isActive: true,
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 2 weeks ago
    streak: 1,
    totalPledged: 10, // Missed once
    completedDates: [
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
    ],
    missedDates: [
      new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
    ],
  },
];

export const sampleUser: User = {
  id: generateId(),
  name: "Demo User",
  email: "demo@pledge.app",
  totalPledged: 26,
  totalCharged: 26,
  activeHabits: 3,
  joinedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 2 weeks ago
};

// Helper function to load sample data (useful for testing)
export const loadSampleData = async () => {
  const { StorageService } = await import("../services/storage");

  // Save sample habits
  await StorageService.saveHabits(sampleHabits);

  // Save sample user
  await StorageService.saveUser(sampleUser);

  console.log("Sample data loaded successfully!");
};

export interface Habit {
  id: string;
  title: string;
  description: string;
  frequency: "daily" | "weekly" | "monthly";
  pledgeAmount: number;
  isActive: boolean;
  createdAt: Date;
  lastCompleted?: Date;
  streak: number;
  totalPledged: number;
  completedDates: string[];
  missedDates: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  totalPledged: number;
  totalCharged: number;
  activeHabits: number;
  joinedAt: Date;
}

export interface Payment {
  id: string;
  habitId: string;
  amount: number;
  date: Date;
  reason: string;
  status: "pending" | "completed" | "failed";
}

export interface HabitLog {
  id: string;
  habitId: string;
  date: string;
  completed: boolean;
  note?: string;
}

export type RootStackParamList = {
  Tabs: undefined;
  CreateHabit: undefined;
  HabitDetail: { habitId: string };
  Profile: undefined;
};

export type TabParamList = {
  Home: undefined;
  Habits: undefined;
  Analytics: undefined;
  Settings: undefined;
};

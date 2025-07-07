export interface Habit {
  id: string;
  title: string;
  frequency: "daily" | "weekly" | "monthly" | "custom";
  customFrequency?: {
    timesPerWeek?: number;
    daysOfWeek?: number[]; // 0=Sunday, 1=Monday, etc.
    intervalDays?: number; // For "every X days"
    timesPerMonth?: number; // For "X times per month"
    timesInPeriod?: number; // For "X times in Y days"
    periodDays?: number; // For "X times in Y days"
  };
  pledgeAmount: number;
  isActive: boolean;
  pendingCancellation?: boolean;
  cancellationRequestedAt?: Date;
  createdAt: Date;
  lastCompleted?: Date;
  streak: number;
  totalPledged: number;
  completedDates: string[];
  missedDates: string[];
  missReasons: { [date: string]: MissReason }; // Date -> reason mapping
}

export interface MissReason {
  reason:
    | "stressed"
    | "distracted"
    | "no_time"
    | "sick"
    | "emergency"
    | "other";
  customReason?: string;
  timestamp: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
  totalPledged: number;
  totalCharged: number;
  activeHabits: number;
  joinedAt: Date;
  lastAppOpen: Date; // Track when app was last opened
}

export interface Payment {
  id: string;
  habitId: string;
  amount: number;
  date: Date;
  reason: string;
  missReason?: MissReason; // Why the habit was missed
  status: "pending" | "completed" | "failed";
}

export interface HabitLog {
  id: string;
  habitId: string;
  date: string;
  completed: boolean;
  note?: string;
  missReason?: MissReason;
}

export interface PendingReason {
  habitId: string;
  date: string;
  habitTitle: string;
}

export type RootStackParamList = {
  Tabs: undefined;
  CreateHabit: undefined;
  HabitDetail: { habitId: string };
  Profile: undefined;
  PendingReasons: { pendingReasons: PendingReason[] };
};

export type TabParamList = {
  Home: undefined;
  Habits: undefined;
  Analytics: undefined;
  Settings: undefined;
};

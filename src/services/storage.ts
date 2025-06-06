import AsyncStorage from "@react-native-async-storage/async-storage";
import { Habit, User, Payment, HabitLog } from "../types";

const STORAGE_KEYS = {
  HABITS: "@pledge_habits",
  USER: "@pledge_user",
  PAYMENTS: "@pledge_payments",
  HABIT_LOGS: "@pledge_habit_logs",
};

export class StorageService {
  // Habits
  static async getHabits(): Promise<Habit[]> {
    try {
      const habitsJson = await AsyncStorage.getItem(STORAGE_KEYS.HABITS);
      if (!habitsJson) return [];

      const habits = JSON.parse(habitsJson);
      return habits.map((habit: any) => ({
        ...habit,
        createdAt: new Date(habit.createdAt),
        lastCompleted: habit.lastCompleted
          ? new Date(habit.lastCompleted)
          : undefined,
      }));
    } catch (error) {
      console.error("Error getting habits:", error);
      return [];
    }
  }

  static async saveHabits(habits: Habit[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits));
    } catch (error) {
      console.error("Error saving habits:", error);
      throw error;
    }
  }

  static async addHabit(habit: Habit): Promise<void> {
    const habits = await this.getHabits();
    habits.push(habit);
    await this.saveHabits(habits);
  }

  static async updateHabit(
    habitId: string,
    updates: Partial<Habit>
  ): Promise<void> {
    const habits = await this.getHabits();
    const index = habits.findIndex((h) => h.id === habitId);
    if (index !== -1) {
      habits[index] = { ...habits[index], ...updates };
      await this.saveHabits(habits);
    }
  }

  static async deleteHabit(habitId: string): Promise<void> {
    const habits = await this.getHabits();
    const filteredHabits = habits.filter((h) => h.id !== habitId);
    await this.saveHabits(filteredHabits);
  }

  // User
  static async getUser(): Promise<User | null> {
    try {
      const userJson = await AsyncStorage.getItem(STORAGE_KEYS.USER);
      if (!userJson) return null;

      const user = JSON.parse(userJson);
      return {
        ...user,
        joinedAt: new Date(user.joinedAt),
      };
    } catch (error) {
      console.error("Error getting user:", error);
      return null;
    }
  }

  static async saveUser(user: User): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } catch (error) {
      console.error("Error saving user:", error);
      throw error;
    }
  }

  // Payments
  static async getPayments(): Promise<Payment[]> {
    try {
      const paymentsJson = await AsyncStorage.getItem(STORAGE_KEYS.PAYMENTS);
      if (!paymentsJson) return [];

      const payments = JSON.parse(paymentsJson);
      return payments.map((payment: any) => ({
        ...payment,
        date: new Date(payment.date),
      }));
    } catch (error) {
      console.error("Error getting payments:", error);
      return [];
    }
  }

  static async addPayment(payment: Payment): Promise<void> {
    const payments = await this.getPayments();
    payments.push(payment);
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.PAYMENTS,
        JSON.stringify(payments)
      );
    } catch (error) {
      console.error("Error adding payment:", error);
      throw error;
    }
  }

  // Habit Logs
  static async getHabitLogs(): Promise<HabitLog[]> {
    try {
      const logsJson = await AsyncStorage.getItem(STORAGE_KEYS.HABIT_LOGS);
      return logsJson ? JSON.parse(logsJson) : [];
    } catch (error) {
      console.error("Error getting habit logs:", error);
      return [];
    }
  }

  static async addHabitLog(log: HabitLog): Promise<void> {
    const logs = await this.getHabitLogs();
    logs.push(log);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.HABIT_LOGS, JSON.stringify(logs));
    } catch (error) {
      console.error("Error adding habit log:", error);
      throw error;
    }
  }

  // Clear all data
  static async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
    } catch (error) {
      console.error("Error clearing data:", error);
      throw error;
    }
  }
}

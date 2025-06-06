import { useState, useEffect, useCallback } from "react";
import { Habit, Payment } from "../types";
import { StorageService } from "../services/storage";
import {
  generateId,
  getDateString,
  isHabitDueToday,
  calculateStreak,
} from "../utils";

export const useHabits = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadHabits = useCallback(async () => {
    try {
      setLoading(true);
      const loadedHabits = await StorageService.getHabits();
      setHabits(loadedHabits);
      setError(null);
    } catch (err) {
      setError("Failed to load habits");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const addHabit = useCallback(
    async (
      habitData: Omit<
        Habit,
        | "id"
        | "createdAt"
        | "streak"
        | "totalPledged"
        | "completedDates"
        | "missedDates"
      >
    ) => {
      try {
        const newHabit: Habit = {
          ...habitData,
          id: generateId(),
          createdAt: new Date(),
          streak: 0,
          totalPledged: 0,
          completedDates: [],
          missedDates: [],
        };

        await StorageService.addHabit(newHabit);
        setHabits((prev) => [...prev, newHabit]);
        return newHabit;
      } catch (err) {
        setError("Failed to add habit");
        console.error(err);
        throw err;
      }
    },
    []
  );

  const updateHabit = useCallback(
    async (habitId: string, updates: Partial<Habit>) => {
      try {
        await StorageService.updateHabit(habitId, updates);
        setHabits((prev) =>
          prev.map((habit) =>
            habit.id === habitId ? { ...habit, ...updates } : habit
          )
        );
      } catch (err) {
        setError("Failed to update habit");
        console.error(err);
        throw err;
      }
    },
    []
  );

  const deleteHabit = useCallback(async (habitId: string) => {
    try {
      await StorageService.deleteHabit(habitId);
      setHabits((prev) => prev.filter((habit) => habit.id !== habitId));
    } catch (err) {
      setError("Failed to delete habit");
      console.error(err);
      throw err;
    }
  }, []);

  const completeHabit = useCallback(
    async (habitId: string) => {
      try {
        const habit = habits.find((h) => h.id === habitId);
        if (!habit) return;

        const today = getDateString(new Date());
        if (habit.completedDates.includes(today)) {
          // Already completed today
          return;
        }

        const updatedCompletedDates = [...habit.completedDates, today];
        const newStreak = calculateStreak(updatedCompletedDates);

        await updateHabit(habitId, {
          completedDates: updatedCompletedDates,
          lastCompleted: new Date(),
          streak: newStreak,
          // Remove from missed dates if it was there
          missedDates: habit.missedDates.filter((date) => date !== today),
        });
      } catch (err) {
        setError("Failed to complete habit");
        console.error(err);
        throw err;
      }
    },
    [habits, updateHabit]
  );

  const markHabitMissed = useCallback(
    async (habitId: string) => {
      try {
        const habit = habits.find((h) => h.id === habitId);
        if (!habit) return;

        const today = getDateString(new Date());
        if (habit.missedDates.includes(today)) {
          // Already marked as missed
          return;
        }

        // Create payment record
        const payment: Payment = {
          id: generateId(),
          habitId,
          amount: habit.pledgeAmount,
          date: new Date(),
          reason: `Missed habit: ${habit.title}`,
          status: "pending",
        };

        await StorageService.addPayment(payment);

        await updateHabit(habitId, {
          missedDates: [...habit.missedDates, today],
          totalPledged: habit.totalPledged + habit.pledgeAmount,
          streak: 0, // Reset streak when habit is missed
        });
      } catch (err) {
        setError("Failed to mark habit as missed");
        console.error(err);
        throw err;
      }
    },
    [habits, updateHabit]
  );

  const getTodaysHabits = useCallback(() => {
    return habits.filter((habit) => habit.isActive && isHabitDueToday(habit));
  }, [habits]);

  const getActiveHabits = useCallback(() => {
    return habits.filter((habit) => habit.isActive);
  }, [habits]);

  const getTotalPledgedAmount = useCallback(() => {
    return habits.reduce((total, habit) => total + habit.totalPledged, 0);
  }, [habits]);

  useEffect(() => {
    loadHabits();
  }, [loadHabits]);

  return {
    habits,
    loading,
    error,
    addHabit,
    updateHabit,
    deleteHabit,
    completeHabit,
    markHabitMissed,
    getTodaysHabits,
    getActiveHabits,
    getTotalPledgedAmount,
    refresh: loadHabits,
  };
};

import { useState, useEffect, useCallback } from "react";
import { Habit, Payment, MissReason, PendingReason } from "../types";
import { StorageService } from "../services/storage";
import { loadSampleData } from "../utils/sampleData";
import {
  generateId,
  getDateString,
  isHabitDueToday,
  calculateStreak,
  detectSlippedHabits,
} from "../utils";

export const useHabits = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingReasons, setPendingReasons] = useState<PendingReason[]>([]);

  const loadHabits = useCallback(async () => {
    try {
      setLoading(true);
      const loadedHabits = await StorageService.getHabits();

      // If no habits exist, load sample data
      if (loadedHabits.length === 0) {
        try {
          await loadSampleData();
          const sampleHabits = await StorageService.getHabits();

          // Ensure all habits have the new fields
          const updatedHabits = sampleHabits.map((habit) => ({
            ...habit,
            missReasons: habit.missReasons || {},
          }));

          setHabits(updatedHabits);
          setError(null);
          return;
        } catch (sampleError) {
          console.error("Error loading sample data:", sampleError);
          // Continue with empty habits if sample data fails
        }
      }

      // Ensure all habits have the new fields
      const updatedHabits = loadedHabits.map((habit) => ({
        ...habit,
        missReasons: habit.missReasons || {},
      }));

      setHabits(updatedHabits);

      // Check for slipped habits
      const slipped = detectSlippedHabits(updatedHabits);
      if (slipped.length > 0) {
        setPendingReasons(slipped);
      }

      setError(null);
    } catch (err) {
      console.error("Error loading habits:", err);
      setError("Failed to load habits");
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
        | "missReasons"
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
          missReasons: {},
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
    async (
      habitId: string,
      reason?: MissReason["reason"],
      customReason?: string
    ) => {
      try {
        const habit = habits.find((h) => h.id === habitId);
        if (!habit) return;

        const today = getDateString(new Date());

        if (reason) {
          // User provided a reason immediately
          const missReason: MissReason = {
            reason,
            customReason,
            timestamp: new Date(),
          };

          // Create payment record
          const payment: Payment = {
            id: generateId(),
            habitId,
            amount: habit.pledgeAmount,
            date: new Date(),
            reason: `Missed habit: ${habit.title}`,
            missReason,
            status: "pending",
          };

          await StorageService.addPayment(payment);

          await updateHabit(habitId, {
            missedDates: [...habit.missedDates, today],
            missReasons: { ...habit.missReasons, [today]: missReason },
            totalPledged: habit.totalPledged + habit.pledgeAmount,
            streak: 0, // Reset streak on miss
          });
        } else {
          // No reason provided - this shouldn't happen anymore since reasons are required
          await updateHabit(habitId, {
            missedDates: [...habit.missedDates, today],
            totalPledged: habit.totalPledged + habit.pledgeAmount,
            streak: 0,
          });
        }
      } catch (err) {
        setError("Failed to mark habit as missed");
        console.error(err);
        throw err;
      }
    },
    [habits, updateHabit]
  );

  const provideMissReason = useCallback(
    async (
      habitId: string,
      date: string,
      reason: MissReason["reason"],
      customReason?: string
    ) => {
      try {
        const habit = habits.find((h) => h.id === habitId);
        if (!habit) return;

        const missReason: MissReason = {
          reason,
          customReason,
          timestamp: new Date(),
        };

        // Create payment record
        const payment: Payment = {
          id: generateId(),
          habitId,
          amount: habit.pledgeAmount,
          date: new Date(date),
          reason: `Missed habit: ${habit.title}`,
          missReason,
          status: "pending",
        };

        await StorageService.addPayment(payment);

        await updateHabit(habitId, {
          missedDates: [...habit.missedDates, date],
          missReasons: { ...habit.missReasons, [date]: missReason },
          totalPledged: habit.totalPledged + habit.pledgeAmount,
        });

        // Remove from pending reasons
        setPendingReasons((prev) =>
          prev.filter((p) => !(p.habitId === habitId && p.date === date))
        );
      } catch (err) {
        setError("Failed to provide miss reason");
        console.error(err);
        throw err;
      }
    },
    [habits, updateHabit]
  );

  const refresh = useCallback(() => {
    loadHabits();
  }, [loadHabits]);

  const getActiveHabits = useCallback(() => {
    return habits.filter((habit) => habit.isActive);
  }, [habits]);

  const getHabitsDueToday = useCallback(() => {
    return habits.filter((habit) => habit.isActive && isHabitDueToday(habit));
  }, [habits]);

  const getTotalPledged = useCallback(() => {
    return habits.reduce((total, habit) => total + habit.totalPledged, 0);
  }, [habits]);

  useEffect(() => {
    loadHabits();
  }, [loadHabits]);

  return {
    habits,
    loading,
    error,
    pendingReasons,
    addHabit,
    updateHabit,
    deleteHabit,
    completeHabit,
    markHabitMissed,
    provideMissReason,
    refresh,
    getActiveHabits,
    getHabitsDueToday,
    getTotalPledged,
  };
};

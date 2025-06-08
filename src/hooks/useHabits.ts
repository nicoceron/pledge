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
            pendingReasonDates: habit.pendingReasonDates || [],
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
        pendingReasonDates: habit.pendingReasonDates || [],
        missReasons: habit.missReasons || {},
      }));

      setHabits(updatedHabits);

      // Check for slipped habits
      const slipped = detectSlippedHabits(updatedHabits);
      if (slipped.length > 0) {
        setPendingReasons(slipped);
        // Mark these dates as pending reasons
        await markDatesAsPendingReasons(slipped, updatedHabits);
      }

      setError(null);
    } catch (err) {
      console.error("Error loading habits:", err);
      setError("Failed to load habits");
    } finally {
      setLoading(false);
    }
  }, []);

  const markDatesAsPendingReasons = async (
    pendingList: PendingReason[],
    currentHabits: Habit[]
  ) => {
    for (const pending of pendingList) {
      const habit = currentHabits.find((h) => h.id === pending.habitId);
      if (habit) {
        await updateHabit(pending.habitId, {
          pendingReasonDates: [...habit.pendingReasonDates, pending.date],
        });
      }
    }
  };

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
        | "pendingReasonDates"
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
          pendingReasonDates: [],
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
          // Remove from missed dates and pending reasons if it was there
          missedDates: habit.missedDates.filter((date) => date !== today),
          pendingReasonDates: habit.pendingReasonDates.filter(
            (date) => date !== today
          ),
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
            streak: 0, // Reset streak when habit is missed
            // Remove from pending reasons if it was there
            pendingReasonDates: habit.pendingReasonDates.filter(
              (date) => date !== today
            ),
          });
        } else {
          // No reason provided, mark as pending
          await updateHabit(habitId, {
            pendingReasonDates: [...habit.pendingReasonDates, today],
            // Remove from missed dates if it was there
            missedDates: habit.missedDates.filter((date) => date !== today),
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
          pendingReasonDates: habit.pendingReasonDates.filter(
            (d) => d !== date
          ),
          streak: 0, // Reset streak when habit is missed
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

  const getTodaysHabits = useCallback(() => {
    return habits.filter((habit) => habit.isActive && isHabitDueToday(habit));
  }, [habits]);

  const getActiveHabits = useCallback(() => {
    return habits.filter((habit) => habit.isActive);
  }, [habits]);

  const getTotalPledgedAmount = useCallback(() => {
    return habits.reduce((total, habit) => total + habit.totalPledged, 0);
  }, [habits]);

  const getPendingReasons = useCallback(() => {
    return pendingReasons;
  }, [pendingReasons]);

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
    getTodaysHabits,
    getActiveHabits,
    getTotalPledgedAmount,
    getPendingReasons,
    refresh: loadHabits,
  };
};

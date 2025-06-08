import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, RefreshControl } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useHabits } from "../hooks/useHabits";
import { StorageService } from "../services/storage";
import { Payment } from "../types";
import { formatCurrency, formatDate } from "../utils";

export const AnalyticsScreen: React.FC = () => {
  const { habits, loading, getTotalPledgedAmount, refresh } = useHabits();
  const [payments, setPayments] = useState<Payment[]>([]);

  const loadPayments = async () => {
    const loadedPayments = await StorageService.getPayments();
    setPayments(loadedPayments);
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const handleRefresh = async () => {
    await refresh();
    await loadPayments();
  };

  const totalHabits = habits.length;
  const activeHabits = habits.filter((h) => h.isActive).length;
  const totalStreak = habits.reduce((sum, habit) => sum + habit.streak, 0);
  const averageStreak =
    totalHabits > 0 ? Math.round(totalStreak / totalHabits) : 0;
  const totalPledged = getTotalPledgedAmount();
  const completedHabits = habits.reduce(
    (sum, habit) => sum + habit.completedDates.length,
    0
  );
  const missedHabits = habits.reduce(
    (sum, habit) => sum + habit.missedDates.length,
    0
  );
  const successRate =
    completedHabits + missedHabits > 0
      ? Math.round((completedHabits / (completedHabits + missedHabits)) * 100)
      : 0;

  const StatCard = ({
    icon,
    title,
    value,
    bgColor,
    iconColor,
    subtitle,
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    value: string;
    bgColor: string;
    iconColor: string;
    subtitle?: string;
  }) => (
    <View className="bg-white rounded-2xl p-4 items-center border border-navy-100 flex-1">
      <View
        className={`w-12 h-12 rounded-full ${bgColor} items-center justify-center mb-3`}
      >
        <Ionicons name={icon} size={24} className={iconColor} />
      </View>
      <Text className="text-navy-600 text-sm font-medium mb-1">{title}</Text>
      <Text className="text-navy-900 text-2xl font-bold">{value}</Text>
      {subtitle && (
        <Text className="text-navy-500 text-xs mt-1">{subtitle}</Text>
      )}
    </View>
  );

  return (
    <View className="flex-1 bg-navy-50">
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="bg-navy-800 pt-12 pb-6 px-6">
          <Text className="text-white text-2xl font-bold mb-1">
            Your Progress
          </Text>
          <Text className="text-navy-200 text-base">
            Track your habit journey
          </Text>
        </View>

        {/* Key Metrics */}
        <View className="px-4 mt-4">
          <View className="flex-row gap-3 mb-3">
            <StatCard
              icon="trophy"
              title="Success Rate"
              value={`${successRate}%`}
              bgColor="bg-green-100"
              iconColor="text-green-600"
              subtitle={`${completedHabits} completed`}
            />
            <StatCard
              icon="flame"
              title="Avg Streak"
              value={`${averageStreak}`}
              bgColor="bg-orange-100"
              iconColor="text-orange-600"
              subtitle="days"
            />
          </View>

          <View className="flex-row gap-3">
            <StatCard
              icon="list"
              title="Active Habits"
              value={activeHabits.toString()}
              bgColor="bg-blue-100"
              iconColor="text-blue-600"
              subtitle={`${totalHabits} total`}
            />
            <StatCard
              icon="card"
              title="Total Charged"
              value={formatCurrency(totalPledged)}
              bgColor="bg-red-100"
              iconColor="text-red-600"
              subtitle={`${missedHabits} missed`}
            />
          </View>
        </View>

        {/* Detailed Stats */}
        <View className="px-4 mt-6">
          <Text className="text-navy-900 text-xl font-bold mb-4">
            Detailed Statistics
          </Text>

          <View className="bg-white rounded-2xl p-4 border border-navy-100">
            <View className="flex-row justify-between items-center py-3 border-b border-navy-100">
              <Text className="text-navy-600 text-base">Habits Completed</Text>
              <Text className="text-navy-900 text-lg font-semibold">
                {completedHabits}
              </Text>
            </View>

            <View className="flex-row justify-between items-center py-3 border-b border-navy-100">
              <Text className="text-navy-600 text-base">Habits Missed</Text>
              <Text className="text-red-600 text-lg font-semibold">
                {missedHabits}
              </Text>
            </View>

            <View className="flex-row justify-between items-center py-3 border-b border-navy-100">
              <Text className="text-navy-600 text-base">Total Streak Days</Text>
              <Text className="text-navy-900 text-lg font-semibold">
                {totalStreak}
              </Text>
            </View>

            <View className="flex-row justify-between items-center py-3">
              <Text className="text-navy-600 text-base">Average Pledge</Text>
              <Text className="text-navy-900 text-lg font-semibold">
                {totalHabits > 0
                  ? formatCurrency(
                      habits.reduce((sum, h) => sum + h.pledgeAmount, 0) /
                        totalHabits
                    )
                  : formatCurrency(0)}
              </Text>
            </View>
          </View>
        </View>

        {/* Recent Payments */}
        <View className="px-4 mt-6">
          <Text className="text-navy-900 text-xl font-bold mb-4">
            Recent Charges
          </Text>

          {payments.length === 0 ? (
            <View className="bg-white rounded-2xl p-8 items-center border border-navy-100">
              <Ionicons
                name="happy-outline"
                size={48}
                className="text-navy-400 mb-4"
              />
              <Text className="text-navy-900 text-lg font-semibold mb-2">
                No charges yet!
              </Text>
              <Text className="text-navy-600 text-base text-center">
                Keep up the good work and avoid missing your habits.
              </Text>
            </View>
          ) : (
            <View className="space-y-3">
              {payments.slice(0, 10).map((payment) => {
                const habit = habits.find((h) => h.id === payment.habitId);
                return (
                  <View
                    key={payment.id}
                    className="bg-white rounded-xl p-4 border border-navy-100"
                  >
                    <View className="flex-row justify-between items-start mb-2">
                      <View className="flex-row items-center">
                        <Ionicons
                          name="card"
                          size={20}
                          className="text-red-500 mr-2"
                        />
                        <Text className="text-red-600 text-lg font-bold">
                          {formatCurrency(payment.amount)}
                        </Text>
                      </View>
                      <View
                        className={`px-2 py-1 rounded-full ${
                          payment.status === "completed"
                            ? "bg-green-100"
                            : payment.status === "pending"
                            ? "bg-yellow-100"
                            : "bg-red-100"
                        }`}
                      >
                        <Text
                          className={`text-xs font-medium ${
                            payment.status === "completed"
                              ? "text-green-700"
                              : payment.status === "pending"
                              ? "text-yellow-700"
                              : "text-red-700"
                          }`}
                        >
                          {payment.status}
                        </Text>
                      </View>
                    </View>
                    <Text className="text-navy-900 text-base font-medium mb-1">
                      {habit?.title || "Unknown Habit"}
                    </Text>
                    <Text className="text-navy-500 text-sm">
                      {formatDate(payment.date)}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        <View className="h-20" />
      </ScrollView>
    </View>
  );
};

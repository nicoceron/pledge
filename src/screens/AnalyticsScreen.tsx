import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, RefreshControl } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useHabits } from "../hooks/useHabits";
import { StorageService } from "../services/storage";
import { Payment } from "../types";
import { formatCurrency, formatDate } from "../utils";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const AnalyticsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { habits, loading, getTotalPledged, refresh } = useHabits();
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
  const totalPledged = getTotalPledged();
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
    <View className="bg-white rounded-2xl p-4 items-center border border-gray-200 flex-1">
      <View
        className={`w-12 h-12 rounded-full ${bgColor} items-center justify-center mb-3`}
      >
        <Ionicons
          name={icon}
          size={24}
          color={
            iconColor === "text-green-600"
              ? "#059669"
              : iconColor === "text-orange-600"
              ? "#ea580c"
              : iconColor === "text-blue-600"
              ? "#2563eb"
              : iconColor === "text-red-600"
              ? "#dc2626"
              : "#6b7280"
          }
        />
      </View>
      <Text className="text-gray-600 text-sm font-medium mb-1">{title}</Text>
      <Text className="text-gray-900 text-2xl font-bold">{value}</Text>
      {subtitle && (
        <Text className="text-gray-500 text-xs mt-1">{subtitle}</Text>
      )}
    </View>
  );

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="pt-12 pb-6 px-6">
          <Text className="text-gray-900 text-3xl font-bold mb-2">
            Your Progress
          </Text>
          <Text className="text-gray-600 text-base">
            Track your habit journey
          </Text>
        </View>

        {/* Key Metrics */}
        <View className="px-6 mt-4">
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
        <View className="px-6 mt-8">
          <Text className="text-gray-900 text-xl font-bold mb-4">
            Detailed Statistics
          </Text>

          <View className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
            <View className="flex-row justify-between items-center py-3 border-b border-gray-200">
              <Text className="text-gray-600 text-base">Habits Completed</Text>
              <Text className="text-gray-900 text-lg font-semibold">
                {completedHabits}
              </Text>
            </View>

            <View className="flex-row justify-between items-center py-3 border-b border-gray-200">
              <Text className="text-gray-600 text-base">Habits Missed</Text>
              <Text className="text-red-600 text-lg font-semibold">
                {missedHabits}
              </Text>
            </View>

            <View className="flex-row justify-between items-center py-3 border-b border-gray-200">
              <Text className="text-gray-600 text-base">Total Streak Days</Text>
              <Text className="text-gray-900 text-lg font-semibold">
                {totalStreak}
              </Text>
            </View>

            <View className="flex-row justify-between items-center py-3">
              <Text className="text-gray-600 text-base">Average Pledge</Text>
              <Text className="text-gray-900 text-lg font-semibold">
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
        <View className="px-6 mt-8">
          <Text className="text-gray-900 text-xl font-bold mb-4">
            Recent Charges
          </Text>

          {payments.length === 0 ? (
            <View className="bg-gray-50 rounded-2xl p-8 items-center border border-gray-200">
              <Ionicons
                name="happy-outline"
                size={48}
                color="#9CA3AF"
                style={{ marginBottom: 16 }}
              />
              <Text className="text-gray-900 text-lg font-semibold mb-2">
                No charges yet!
              </Text>
              <Text className="text-gray-600 text-base text-center">
                Keep up the good work and avoid missing your habits.
              </Text>
            </View>
          ) : (
            <View className="space-y-3">
              {payments.slice(0, 10).map((payment) => (
                <View
                  key={payment.id}
                  className="bg-gray-50 rounded-2xl p-4 border border-gray-200"
                >
                  <View className="flex-row justify-between items-start">
                    <View className="flex-1">
                      <Text className="text-gray-900 text-base font-medium">
                        {payment.reason}
                      </Text>
                      <Text className="text-gray-600 text-sm mt-1">
                        {formatDate(payment.date)}
                      </Text>
                      {payment.missReason && (
                        <Text className="text-gray-500 text-xs mt-1">
                          Reason: {payment.missReason.reason}
                        </Text>
                      )}
                    </View>
                    <View className="items-end">
                      <Text className="text-red-600 text-lg font-semibold">
                        -{formatCurrency(payment.amount)}
                      </Text>
                      <Text
                        className={`text-xs font-medium ${
                          payment.status === "completed"
                            ? "text-green-600"
                            : payment.status === "failed"
                            ? "text-red-600"
                            : "text-orange-600"
                        }`}
                      >
                        {payment.status}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        <View className="h-8" />
      </ScrollView>
    </View>
  );
};

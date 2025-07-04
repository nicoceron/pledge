import React, { useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { LineChart } from "react-native-chart-kit";
import { useHabits } from "../hooks/useHabits";
import { RootStackParamList } from "../types";
import { formatCurrency, getDateString } from "../utils";

type HabitDetailRouteProp = RouteProp<RootStackParamList, "HabitDetail">;

export const HabitDetailScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute<HabitDetailRouteProp>();
  const { habitId } = route.params;
  const { habits, completeHabit, markHabitMissed } = useHabits();

  const habit = habits.find((h) => h.id === habitId);

  // Generate streak calendar data (last 365 days)
  const streakData = useMemo(() => {
    if (!habit) return [];

    const days = [];
    const today = new Date();

    for (let i = 364; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateString = getDateString(date);

      const status = habit.completedDates.includes(dateString)
        ? "completed"
        : habit.missedDates.includes(dateString)
        ? "missed"
        : "none";

      days.push({
        date: dateString,
        day: date.getDate(),
        month: date.getMonth(),
        status,
        dayOfWeek: date.getDay(),
      });
    }

    return days;
  }, [habit]);

  // Generate chart data (last 7 days completion rate)
  const chartData = useMemo(() => {
    if (!habit) return [0, 0, 0, 0, 0, 0, 0];

    const last7Days = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateString = getDateString(date);

      const completed = habit.completedDates.includes(dateString) ? 1 : 0;
      last7Days.push(completed);
    }

    return last7Days;
  }, [habit]);

  const completionRate = useMemo(() => {
    if (!habit) return 0;

    const totalDays = habit.completedDates.length + habit.missedDates.length;
    if (totalDays === 0) return 0;
    return Math.round((habit.completedDates.length / totalDays) * 100);
  }, [habit]);

  const screenWidth = Dimensions.get("window").width;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "#059669";
      case "missed":
        return "#dc2626";
      default:
        return "#e5e7eb";
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case "completed":
        return "#10b981";
      case "missed":
        return "#ef4444";
      default:
        return "#f3f4f6";
    }
  };

  // Handle the case where habit is not found
  if (!habit) {
    return (
      <View
        className="flex-1 bg-white justify-center items-center"
        style={{ paddingTop: insets.top }}
      >
        <Text className="text-gray-600 text-lg">Habit not found</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="px-6 py-4 border-b border-gray-200 bg-white">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-gray-900 text-xl font-bold">Habit Details</Text>
          <View className="w-6" />
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Habit Info */}
        <View className="px-6 py-6 border-b border-gray-100">
          <Text className="text-gray-900 text-2xl font-bold mb-2">
            {habit.title}
          </Text>
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Ionicons name="flame" size={16} color="#6b7280" />
              <Text className="text-gray-600 text-base ml-2">
                {habit.streak} day streak
              </Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="card" size={16} color="#6b7280" />
              <Text className="text-gray-600 text-base ml-2">
                {formatCurrency(habit.pledgeAmount)} pledge
              </Text>
            </View>
          </View>
        </View>

        {/* Stats Cards */}
        <View className="px-6 py-6 border-b border-gray-100">
          <View className="flex-row justify-between mb-4">
            <View className="flex-1 bg-green-50 rounded-xl p-4 mr-2">
              <Text className="text-green-800 text-2xl font-bold">
                {habit.completedDates.length}
              </Text>
              <Text className="text-green-600 text-sm">Completed</Text>
            </View>
            <View className="flex-1 bg-red-50 rounded-xl p-4 mx-2">
              <Text className="text-red-800 text-2xl font-bold">
                {habit.missedDates.length}
              </Text>
              <Text className="text-red-600 text-sm">Missed</Text>
            </View>
            <View className="flex-1 bg-blue-50 rounded-xl p-4 ml-2">
              <Text className="text-blue-800 text-2xl font-bold">
                {completionRate}%
              </Text>
              <Text className="text-blue-600 text-sm">Success Rate</Text>
            </View>
          </View>
        </View>

        {/* Streak Calendar */}
        <View className="px-6 py-6 border-b border-gray-100">
          <Text className="text-gray-900 text-xl font-bold mb-4">
            Year Overview
          </Text>

          {/* Calendar Grid */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row">
              {/* Generate weeks */}
              {Array.from({ length: 53 }).map((_, weekIndex) => (
                <View key={weekIndex} className="mr-1">
                  {/* Generate days of the week */}
                  {Array.from({ length: 7 }).map((_, dayIndex) => {
                    const dataIndex = weekIndex * 7 + dayIndex;
                    const day = streakData[dataIndex];

                    if (!day)
                      return <View key={dayIndex} className="w-3 h-3 mb-1" />;

                    return (
                      <View
                        key={dayIndex}
                        className="w-3 h-3 rounded-sm mb-1"
                        style={{
                          backgroundColor: getStatusBgColor(day.status),
                        }}
                      />
                    );
                  })}
                </View>
              ))}
            </View>
          </ScrollView>

          {/* Month labels */}
          <View className="flex-row justify-between mt-2 px-1">
            {[
              "Jan",
              "Feb",
              "Mar",
              "Apr",
              "May",
              "Jun",
              "Jul",
              "Aug",
              "Sep",
              "Oct",
              "Nov",
              "Dec",
            ].map((month, index) => (
              <Text key={index} className="text-xs text-gray-500">
                {month}
              </Text>
            ))}
          </View>

          {/* Legend */}
          <View className="flex-row justify-center mt-4 gap-6">
            <View className="flex-row items-center">
              <View className="w-3 h-3 bg-gray-300 rounded-sm mr-2" />
              <Text className="text-gray-600 text-sm">None</Text>
            </View>
            <View className="flex-row items-center">
              <View className="w-3 h-3 bg-green-500 rounded-sm mr-2" />
              <Text className="text-gray-600 text-sm">Completed</Text>
            </View>
            <View className="flex-row items-center">
              <View className="w-3 h-3 bg-red-500 rounded-sm mr-2" />
              <Text className="text-gray-600 text-sm">Missed</Text>
            </View>
          </View>
        </View>

        {/* Chart */}
        <View className="px-6 py-6">
          <Text className="text-gray-900 text-xl font-bold mb-4">
            7-Day Trend
          </Text>
          <LineChart
            data={{
              labels: ["6d", "5d", "4d", "3d", "2d", "1d", "Today"],
              datasets: [
                {
                  data: chartData,
                  color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
                  strokeWidth: 3,
                },
              ],
            }}
            width={screenWidth - 48}
            height={220}
            yAxisInterval={1}
            chartConfig={{
              backgroundColor: "#ffffff",
              backgroundGradientFrom: "#ffffff",
              backgroundGradientTo: "#ffffff",
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: "6",
                strokeWidth: "2",
                stroke: "#10b981",
              },
              propsForLabels: {
                fontSize: 12,
              },
            }}
            bezier
            style={{
              borderRadius: 16,
            }}
          />
        </View>

        <View className="h-6" />
      </ScrollView>
    </View>
  );
};

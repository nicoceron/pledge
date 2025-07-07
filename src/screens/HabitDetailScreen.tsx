import React, { useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { LineChart } from "react-native-chart-kit";
import { useHabits } from "../hooks/useHabits";
import { RootStackParamList } from "../types";
import {
  formatCurrency,
  getDateString,
  getMissReasonLabel,
} from "../utils/index";

type HabitDetailRouteProp = RouteProp<RootStackParamList, "HabitDetail">;

export const HabitDetailScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute<HabitDetailRouteProp>();
  const { habitId } = route.params;
  const {
    habits,
    completeHabit,
    markHabitMissed,
    requestCancellation,
    cancelCancellationRequest,
    getDaysUntilCancellation,
  } = useHabits();

  const habit = habits.find((h) => h.id === habitId);

  // Generate streak calendar data (last 6 months)
  const streakData = useMemo(() => {
    if (!habit) return [];

    const days = [];
    const today = new Date();

    for (let i = 172; i >= 0; i--) {
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

  const daysUntilCancellation = useMemo(() => {
    if (!habit) return null;
    return getDaysUntilCancellation(habit);
  }, [habit, getDaysUntilCancellation]);

  const handleCancelHabit = () => {
    if (!habit) return;

    if (habit.pendingCancellation) {
      // Show option to undo cancellation
      Alert.alert(
        "Cancel Cancellation Request",
        "Do you want to cancel your cancellation request and keep this habit active?",
        [
          {
            text: "Keep Cancellation Request",
            style: "cancel",
          },
          {
            text: "Cancel Request",
            onPress: () => cancelCancellationRequest(habit.id),
          },
        ]
      );
    } else {
      // Show cancellation request
      Alert.alert(
        "Request Habit Cancellation",
        "This will request cancellation of your habit. Like Beeminder, there's a one-week delay before the habit is actually cancelled. This gives you time to reconsider and prevents impulsive decisions.\n\nDo you want to proceed?",
        [
          {
            text: "No, Keep Habit",
            style: "cancel",
          },
          {
            text: "Yes, Request Cancellation",
            style: "destructive",
            onPress: () => requestCancellation(habit.id),
          },
        ]
      );
    }
  };

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

      {/* ScrollView */}
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

        {/* Pending Cancellation Warning */}
        {habit.pendingCancellation && (
          <View className="px-6 py-4 bg-orange-50 border-b border-orange-200">
            <View className="flex-row items-center mb-2">
              <Ionicons name="warning" size={20} color="#f59e0b" />
              <Text className="text-orange-800 text-lg font-bold ml-2">
                Cancellation Pending
              </Text>
            </View>
            <Text className="text-orange-700 text-base mb-2">
              This habit will be cancelled in{" "}
              <Text className="font-semibold">
                {daysUntilCancellation === 0
                  ? "less than 1 day"
                  : `${daysUntilCancellation} day${
                      daysUntilCancellation === 1 ? "" : "s"
                    }`}
              </Text>
              .
            </Text>
            <TouchableOpacity
              className="bg-orange-600 rounded-lg py-2 px-4 self-start"
              onPress={handleCancelHabit}
            >
              <Text className="text-white text-sm font-medium">
                Cancel Cancellation Request
              </Text>
            </TouchableOpacity>
          </View>
        )}

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
            6 Month Overview
          </Text>

          {/* Calendar Grid */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            scrollEnabled={false}
          >
            <View className="flex-row">
              {/* Generate weeks */}
              {Array.from({ length: 26 }).map((_, weekIndex) => (
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
            {(() => {
              const months = [
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
              ];
              const today = new Date();
              const last6Months = [];
              for (let i = 5; i >= 0; i--) {
                const date = new Date(today);
                date.setMonth(date.getMonth() - i);
                last6Months.push(months[date.getMonth()]);
              }
              return last6Months.map((month, index) => (
                <Text key={index} className="text-xs text-gray-500">
                  {month}
                </Text>
              ));
            })()}
          </View>

          {/* Legend */}
          <View className="flex-row justify-center mt-4 gap-6">
            <View className="flex-row items-center">
              <View className="w-2 h-2 bg-gray-300 rounded-sm mr-2" />
              <Text className="text-gray-600 text-sm">None</Text>
            </View>
            <View className="flex-row items-center">
              <View className="w-2 h-2 bg-green-500 rounded-sm mr-2" />
              <Text className="text-gray-600 text-sm">Completed</Text>
            </View>
            <View className="flex-row items-center">
              <View className="w-2 h-2 bg-red-500 rounded-sm mr-2" />
              <Text className="text-gray-600 text-sm">Missed</Text>
            </View>
          </View>
        </View>

        {/* Missed Habits Justification */}
        {habit.missedDates.length > 0 && (
          <View className="px-6 py-6">
            <Text className="text-gray-900 text-xl font-bold mb-4">
              Missed Days - Provide Justification
            </Text>
            <Text className="text-gray-600 text-base mb-4">
              Help us understand what happened on these days. Transparency
              builds trust and accountability.
            </Text>

            {habit.missedDates
              .slice(-10)
              .reverse()
              .map((missedDate) => {
                const missReason = habit.missReasons[missedDate];
                const dateObj = new Date(missedDate);
                const formattedDate = dateObj.toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                });

                return (
                  <View
                    key={missedDate}
                    className="bg-red-50 rounded-xl p-4 mb-3 border border-red-100"
                  >
                    <View className="flex-row items-center justify-between mb-2">
                      <Text className="text-red-800 font-semibold text-base">
                        {formattedDate}
                      </Text>
                      <View className="bg-red-500 rounded-full px-3 py-1">
                        <Text className="text-white text-xs font-medium">
                          {formatCurrency(habit.pledgeAmount)} charged
                        </Text>
                      </View>
                    </View>

                    {missReason ? (
                      <View>
                        <Text className="text-red-700 text-sm mb-1">
                          Reason: {getMissReasonLabel(missReason.reason)}
                        </Text>
                        {missReason.customReason && (
                          <Text className="text-red-600 text-sm italic">
                            "{missReason.customReason}"
                          </Text>
                        )}
                        <Text className="text-red-500 text-xs mt-1">
                          Submitted:{" "}
                          {new Date(missReason.timestamp).toLocaleDateString()}
                        </Text>
                      </View>
                    ) : (
                      <View>
                        <Text className="text-red-700 text-sm mb-2">
                          ⚠️ No justification provided yet
                        </Text>
                        <TouchableOpacity
                          className="bg-red-600 rounded-lg py-2 px-4 self-start"
                          onPress={() => {
                            // This would typically open a modal to add justification
                            // For now, we'll show an alert
                            Alert.alert(
                              "Add Justification",
                              "Explain why you missed this habit to maintain accountability.",
                              [
                                {
                                  text: "Stressed/Overwhelmed",
                                  onPress: () =>
                                    markHabitMissed(habit.id, "stressed"),
                                },
                                {
                                  text: "Got Distracted",
                                  onPress: () =>
                                    markHabitMissed(habit.id, "distracted"),
                                },
                                {
                                  text: "Ran Out of Time",
                                  onPress: () =>
                                    markHabitMissed(habit.id, "no_time"),
                                },
                                {
                                  text: "Not Feeling Well",
                                  onPress: () =>
                                    markHabitMissed(habit.id, "sick"),
                                },
                                {
                                  text: "Emergency Situation",
                                  onPress: () =>
                                    markHabitMissed(habit.id, "emergency"),
                                },
                                {
                                  text: "Custom Reason",
                                  onPress: () => {
                                    Alert.prompt(
                                      "Custom Justification",
                                      "Provide a detailed explanation:",
                                      (text: string | undefined) => {
                                        if (text && text.trim()) {
                                          markHabitMissed(
                                            habit.id,
                                            "other",
                                            text.trim()
                                          );
                                        }
                                      }
                                    );
                                  },
                                },
                                { text: "Cancel", style: "cancel" },
                              ]
                            );
                          }}
                        >
                          <Text className="text-white text-sm font-medium">
                            Add Justification
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                );
              })}

            {habit.missedDates.length > 10 && (
              <Text className="text-gray-500 text-sm text-center mt-2">
                Showing last 10 missed days. Total missed:{" "}
                {habit.missedDates.length}
              </Text>
            )}
          </View>
        )}

        {/* Cancel Habit Section */}
        {!habit.pendingCancellation && (
          <View className="px-6 py-6">
            <Text className="text-gray-900 text-xl font-bold mb-4">
              Habit Management
            </Text>
            <Text className="text-gray-600 text-base mb-4">
              Need to cancel this habit? Like Beeminder, we use a one-week delay
              to prevent impulsive decisions and give you time to reconsider.
            </Text>
            <TouchableOpacity
              className="bg-red-600 rounded-lg py-3 px-6 self-start"
              onPress={handleCancelHabit}
            >
              <Text className="text-white text-base font-medium">
                Request Habit Cancellation
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View className="h-6" />
      </ScrollView>
    </View>
  );
};

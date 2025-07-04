import React from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Habit, MissReason } from "../types";
import {
  formatCurrency,
  getDateString,
  isHabitDueToday,
  getMissReasonLabel,
} from "../utils";

interface HabitCardProps {
  habit: Habit;
  onComplete: (habitId: string) => void;
  onMiss: (
    habitId: string,
    reason?: MissReason["reason"],
    customReason?: string
  ) => void;
  onPress?: (habit: Habit) => void;
}

export const HabitCard: React.FC<HabitCardProps> = ({
  habit,
  onComplete,
  onMiss,
  onPress,
}) => {
  const today = getDateString(new Date());
  const isCompletedToday = habit.completedDates.includes(today);
  const isMissedToday = habit.missedDates.includes(today);
  const isDueToday = isHabitDueToday(habit);

  const handleComplete = () => {
    if (isCompletedToday) return;
    onComplete(habit.id);
  };

  const handleMiss = () => {
    if (isMissedToday) return;

    Alert.alert(
      `You missed "${habit.title}"`,
      `That's okay, we all have tough days. Help us understand what happened so we can better support you. Your ${formatCurrency(
        habit.pledgeAmount
      )} pledge will be processed after you select a reason.`,
      [
        {
          text: "Stressed/Overwhelmed",
          onPress: () => onMiss(habit.id, "stressed"),
        },
        {
          text: "Got Distracted",
          onPress: () => onMiss(habit.id, "distracted"),
        },
        {
          text: "Ran Out of Time",
          onPress: () => onMiss(habit.id, "no_time"),
        },
        {
          text: "Not Feeling Well",
          onPress: () => onMiss(habit.id, "sick"),
        },
        {
          text: "Emergency Situation",
          onPress: () => onMiss(habit.id, "emergency"),
        },
        {
          text: "Something Else",
          onPress: () => {
            Alert.prompt(
              "What happened?",
              "Share what made this challenging today:",
              (text) => {
                if (text && text.trim()) {
                  onMiss(habit.id, "other", text.trim());
                }
              }
            );
          },
        },
      ]
    );
  };

  const getStatusInfo = () => {
    if (isCompletedToday)
      return {
        color: "#059669",
        bgColor: "#f0fdf4",
        icon: "checkmark-circle" as const,
        message: "Completed",
        showStatus: true,
      };
    if (isMissedToday) {
      const missReason = habit.missReasons[today];
      return {
        color: "#dc2626",
        bgColor: "#fef2f2",
        icon: "close-circle" as const,
        message: missReason
          ? `Missed: ${getMissReasonLabel(missReason.reason)}`
          : "Missed",
        showStatus: true,
      };
    }

    if (isDueToday)
      return {
        color: "#6b7280",
        bgColor: "#f9fafb",
        icon: "ellipse-outline" as const,
        message: "",
        showStatus: false,
      };
    return {
      color: "#6b7280",
      bgColor: "#f9fafb",
      icon: "ellipse-outline" as const,
      message: "Not due today",
      showStatus: true,
    };
  };

  const statusInfo = getStatusInfo();

  return (
    <TouchableOpacity
      className="mb-6"
      onPress={() => onPress?.(habit)}
      activeOpacity={0.7}
    >
      <View className="bg-white rounded-2xl p-6 border border-gray-200">
        {/* Header Row */}
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-1">
            <Text className="text-gray-900 text-xl font-bold mb-1">
              {habit.title}
            </Text>
            <Text className="text-gray-500 text-base capitalize">
              {habit.frequency === "custom" &&
              habit.customFrequency?.timesPerWeek
                ? `${habit.customFrequency.timesPerWeek}x per week`
                : habit.frequency}
            </Text>
          </View>
          <View
            className={`w-12 h-12 rounded-lg items-center justify-center ${
              isCompletedToday
                ? "bg-green-500"
                : isMissedToday
                ? "bg-red-500"
                : "bg-gray-100"
            }`}
          >
            {isCompletedToday ? (
              <Ionicons name="checkmark" size={24} color="white" />
            ) : isMissedToday ? (
              <Ionicons name="close" size={24} color="white" />
            ) : (
              <View className="w-6 h-6 border-2 border-gray-400 rounded" />
            )}
          </View>
        </View>

        {/* Stats Row */}
        <View className="flex-row items-center justify-between mb-4">
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

        {/* Status Message */}
        {statusInfo.showStatus && (
          <View className="mb-4">
            <Text
              className="text-base font-medium"
              style={{ color: statusInfo.color }}
            >
              {statusInfo.message}
            </Text>
          </View>
        )}

        {/* Action Buttons */}
        {isDueToday && !isCompletedToday && !isMissedToday && (
          <View className="flex-row gap-3">
            <TouchableOpacity
              className="flex-1 bg-green-600 rounded-xl py-4 flex-row items-center justify-center"
              onPress={handleComplete}
            >
              <Ionicons name="checkmark" size={20} color="white" />
              <Text className="text-white text-base font-semibold ml-2">
                Complete
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 bg-gray-200 rounded-xl py-4 flex-row items-center justify-center"
              onPress={handleMiss}
            >
              <Ionicons name="close" size={20} color="#6b7280" />
              <Text className="text-gray-600 text-base font-semibold ml-2">
                Miss
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

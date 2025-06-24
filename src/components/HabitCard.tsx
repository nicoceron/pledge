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
  const isPendingReasonToday = habit.pendingReasonDates.includes(today);
  const isDueToday = isHabitDueToday(habit);

  const handleComplete = () => {
    if (isCompletedToday) return;
    onComplete(habit.id);
  };

  const handleMiss = () => {
    if (isMissedToday || isPendingReasonToday) return;

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
        {
          text: "I'll explain later",
          style: "cancel",
          onPress: () => onMiss(habit.id), // No reason provided
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
    if (isPendingReasonToday)
      return {
        color: "#ea580c",
        bgColor: "#fff7ed",
        icon: "time" as const,
        message: "Needs attention",
        showStatus: true,
      };
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
  const hasPendingReasons = habit.pendingReasonDates.length > 0;

  return (
    <TouchableOpacity
      className="mx-2 mb-4"
      onPress={() => onPress?.(habit)}
      activeOpacity={0.7}
    >
      <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        {hasPendingReasons && (
          <View className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-4 flex-row items-center">
            <View className="bg-orange-500 rounded-full p-1 mr-3">
              <Ionicons name="chatbubble-ellipses" size={16} color="white" />
            </View>
            <Text className="text-orange-700 text-base font-medium flex-1">
              {habit.pendingReasonDates.length} day
              {habit.pendingReasonDates.length > 1 ? "s" : ""} need your
              attention
            </Text>
          </View>
        )}

        <View className="flex-row justify-between items-start mb-4">
          <View className="flex-1 mr-4">
            <Text className="text-gray-900 text-xl font-bold mb-2">
              {habit.title}
            </Text>
            <Text className="text-gray-600 text-base capitalize">
              {habit.frequency === "custom" &&
              habit.customFrequency?.timesPerWeek
                ? `${habit.customFrequency.timesPerWeek}x per week`
                : habit.frequency}
            </Text>
          </View>
          <View
            className="rounded-full p-3 items-center justify-center"
            style={{ backgroundColor: statusInfo.bgColor }}
          >
            <Ionicons
              name={statusInfo.icon}
              size={24}
              color={statusInfo.color}
            />
          </View>
        </View>

        {habit.description && (
          <Text className="text-gray-600 text-base mb-4 leading-6">
            {habit.description}
          </Text>
        )}

        <View className="flex-row justify-between mb-6 gap-4">
          <View className="bg-gray-50 rounded-xl p-4 items-center flex-1">
            <Text className="text-gray-500 text-sm font-medium mb-1">
              Current Streak
            </Text>
            <Text className="text-gray-900 text-2xl font-bold">
              {habit.streak}
            </Text>
          </View>
          <View className="bg-gray-50 rounded-xl p-4 items-center flex-1">
            <Text className="text-gray-500 text-sm font-medium mb-1">
              Pledge Amount
            </Text>
            <Text className="text-gray-900 text-2xl font-bold">
              {formatCurrency(habit.pledgeAmount)}
            </Text>
          </View>
        </View>

        {statusInfo.showStatus && (
          <View
            className="rounded-xl p-3 mb-4 flex-row items-center"
            style={{ backgroundColor: statusInfo.bgColor }}
          >
            <Ionicons
              name={statusInfo.icon}
              size={18}
              color={statusInfo.color}
              style={{ marginRight: 8 }}
            />
            <Text
              className="text-base font-medium"
              style={{ color: statusInfo.color }}
            >
              {statusInfo.message}
            </Text>
          </View>
        )}

        {isDueToday && !isCompletedToday && !isMissedToday && (
          <View className="flex-row gap-3">
            <TouchableOpacity
              className="flex-1 bg-green-600 rounded-xl py-4 px-6 flex-row items-center justify-center"
              onPress={handleComplete}
            >
              <Ionicons name="checkmark" size={20} color="white" />
              <Text className="text-white text-lg font-semibold ml-2">
                Complete
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 bg-gray-200 rounded-xl py-4 px-6 flex-row items-center justify-center"
              onPress={handleMiss}
            >
              <Ionicons name="close" size={20} color="#6b7280" />
              <Text className="text-gray-600 text-lg font-semibold ml-2">
                Miss
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

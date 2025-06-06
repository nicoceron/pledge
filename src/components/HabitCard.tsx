import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Habit } from "../types";
import { formatCurrency, getDateString, isHabitDueToday } from "../utils";

interface HabitCardProps {
  habit: Habit;
  onComplete: (habitId: string) => void;
  onMiss: (habitId: string) => void;
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
      "Mark as Missed",
      `You will be charged ${formatCurrency(habit.pledgeAmount)} for missing "${
        habit.title
      }". Are you sure?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes, Charge Me",
          style: "destructive",
          onPress: () => onMiss(habit.id),
        },
      ]
    );
  };

  const getStatusColor = () => {
    if (isCompletedToday) return "#10B981"; // Green
    if (isMissedToday) return "#EF4444"; // Red
    if (isDueToday) return "#F59E0B"; // Yellow
    return "#6B7280"; // Gray
  };

  const getStatusIcon = () => {
    if (isCompletedToday) return "checkmark-circle";
    if (isMissedToday) return "close-circle";
    if (isDueToday) return "time";
    return "ellipse-outline";
  };

  const getStatusText = () => {
    if (isCompletedToday) return "Completed";
    if (isMissedToday) return "Missed";
    if (isDueToday) return "Due Today";
    return "Not Due";
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress?.(habit)}
      activeOpacity={0.8}
    >
      <LinearGradient colors={["#FFFFFF", "#F8FAFC"]} style={styles.gradient}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{habit.title}</Text>
            <Text style={styles.frequency}>{habit.frequency}</Text>
          </View>
          <View
            style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}
          >
            <Ionicons name={getStatusIcon()} size={12} color="white" />
          </View>
        </View>

        {habit.description && (
          <Text style={styles.description}>{habit.description}</Text>
        )}

        <View style={styles.statsContainer}>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Streak</Text>
            <Text style={styles.statValue}>{habit.streak} days</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Pledge</Text>
            <Text style={styles.statValue}>
              {formatCurrency(habit.pledgeAmount)}
            </Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Total Charged</Text>
            <Text style={[styles.statValue, { color: "#EF4444" }]}>
              {formatCurrency(habit.totalPledged)}
            </Text>
          </View>
        </View>

        <View style={styles.statusContainer}>
          <Text style={[styles.statusText, { color: getStatusColor() }]}>
            {getStatusText()}
          </Text>
        </View>

        {isDueToday && !isCompletedToday && !isMissedToday && (
          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.completeButton]}
              onPress={handleComplete}
            >
              <Ionicons name="checkmark" size={16} color="white" />
              <Text style={styles.actionButtonText}>Complete</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.missButton]}
              onPress={handleMiss}
            >
              <Ionicons name="close" size={16} color="white" />
              <Text style={styles.actionButtonText}>Miss</Text>
            </TouchableOpacity>
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  gradient: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  frequency: {
    fontSize: 14,
    color: "#6B7280",
    textTransform: "capitalize",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 24,
    height: 24,
  },
  description: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 16,
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  stat: {
    alignItems: "center",
  },
  statLabel: {
    fontSize: 12,
    color: "#9CA3AF",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  statusContainer: {
    alignItems: "center",
    marginBottom: 12,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  actionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  completeButton: {
    backgroundColor: "#10B981",
  },
  missButton: {
    backgroundColor: "#EF4444",
  },
  actionButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
});

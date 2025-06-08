import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Habit, MissReason } from "../types";
import {
  formatCurrency,
  getDateString,
  isHabitDueToday,
  getMissReasonLabel,
} from "../utils";
import { theme } from "../utils/theme";

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
      `You missed "${habit.title}" 💙`,
      `That's okay, we all have tough days! Help us understand what happened so we can better support you. A gentle reminder: your ${formatCurrency(
        habit.pledgeAmount
      )} pledge will be processed after you select a reason.`,
      [
        {
          text: "😰 Stressed/Overwhelmed",
          onPress: () => onMiss(habit.id, "stressed"),
        },
        {
          text: "📱 Got Distracted",
          onPress: () => onMiss(habit.id, "distracted"),
        },
        {
          text: "⏰ Ran Out of Time",
          onPress: () => onMiss(habit.id, "no_time"),
        },
        {
          text: "🤒 Not Feeling Well",
          onPress: () => onMiss(habit.id, "sick"),
        },
        {
          text: "🚨 Emergency Situation",
          onPress: () => onMiss(habit.id, "emergency"),
        },
        {
          text: "💭 Something Else",
          onPress: () => {
            Alert.prompt(
              "What happened?",
              "Share what made this challenging today - no judgment here:",
              (text) => {
                if (text && text.trim()) {
                  onMiss(habit.id, "other", text.trim());
                }
              }
            );
          },
        },
        {
          text: "⏸️ I'll explain later",
          style: "cancel",
          onPress: () => onMiss(habit.id), // No reason provided
        },
      ]
    );
  };

  const getStatusColor = () => {
    if (isCompletedToday) return theme.colors.status.success;
    if (isMissedToday) return theme.colors.status.error;
    if (isPendingReasonToday) return theme.colors.status.warning;
    if (isDueToday) return theme.colors.primary.light;
    return theme.colors.text.light;
  };

  const getStatusBgColor = () => {
    if (isCompletedToday) return theme.colors.pastel.green;
    if (isMissedToday) return theme.colors.pastel.pink;
    if (isPendingReasonToday) return theme.colors.pastel.yellow;
    if (isDueToday) return theme.colors.pastel.blue;
    return theme.colors.pastel.gray;
  };

  const getStatusIcon = () => {
    if (isCompletedToday) return "checkmark-circle";
    if (isMissedToday) return "heart-dislike";
    if (isPendingReasonToday) return "chatbubble-ellipses";
    if (isDueToday) return "time";
    return "ellipse-outline";
  };

  const getStatusText = () => {
    if (isCompletedToday) return "✨ Completed!";
    if (isMissedToday) {
      const missReason = habit.missReasons[today];
      return missReason
        ? `Missed: ${getMissReasonLabel(missReason.reason)}`
        : "Missed";
    }
    if (isPendingReasonToday) return "💭 Tell us what happened";
    if (isDueToday) return "⏰ Ready to go!";
    return "Not due today";
  };

  const hasPendingReasons = habit.pendingReasonDates.length > 0;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress?.(habit)}
      activeOpacity={0.7}
    >
      <LinearGradient
        colors={[
          theme.colors.background.card,
          theme.colors.background.secondary,
        ]}
        style={[styles.gradient, { borderColor: theme.colors.border.light }]}
      >
        {hasPendingReasons && (
          <View
            style={[
              styles.pendingBanner,
              { backgroundColor: theme.colors.pastel.yellow },
            ]}
          >
            <Ionicons
              name="chatbubble-ellipses"
              size={16}
              color={theme.colors.status.warning}
            />
            <Text
              style={[
                styles.pendingText,
                { color: theme.colors.status.warning },
              ]}
            >
              💭 {habit.pendingReasonDates.length} day
              {habit.pendingReasonDates.length > 1 ? "s" : ""} need your
              thoughts
            </Text>
          </View>
        )}

        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={[styles.title, { color: theme.colors.text.primary }]}>
              {habit.title}
            </Text>
            <Text
              style={[styles.frequency, { color: theme.colors.text.secondary }]}
            >
              {habit.frequency === "custom" &&
              habit.customFrequency?.timesPerWeek
                ? `${habit.customFrequency.timesPerWeek}x per week`
                : habit.frequency}
            </Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: getStatusBgColor(),
                borderColor: getStatusColor(),
                borderWidth: 1,
              },
            ]}
          >
            <Ionicons
              name={getStatusIcon()}
              size={14}
              color={getStatusColor()}
            />
          </View>
        </View>

        {habit.description && (
          <Text
            style={[styles.description, { color: theme.colors.text.secondary }]}
          >
            {habit.description}
          </Text>
        )}

        <View style={styles.statsContainer}>
          <View
            style={[styles.stat, { backgroundColor: theme.colors.pastel.blue }]}
          >
            <Text
              style={[styles.statLabel, { color: theme.colors.text.secondary }]}
            >
              Streak
            </Text>
            <Text
              style={[styles.statValue, { color: theme.colors.primary.main }]}
            >
              🔥 {habit.streak}
            </Text>
          </View>
          <View
            style={[
              styles.stat,
              { backgroundColor: theme.colors.pastel.purple },
            ]}
          >
            <Text
              style={[styles.statLabel, { color: theme.colors.text.secondary }]}
            >
              Pledge
            </Text>
            <Text
              style={[styles.statValue, { color: theme.colors.primary.main }]}
            >
              💰 {formatCurrency(habit.pledgeAmount)}
            </Text>
          </View>
          <View
            style={[styles.stat, { backgroundColor: theme.colors.pastel.pink }]}
          >
            <Text
              style={[styles.statLabel, { color: theme.colors.text.secondary }]}
            >
              Charged
            </Text>
            <Text
              style={[styles.statValue, { color: theme.colors.status.error }]}
            >
              💸 {formatCurrency(habit.totalPledged)}
            </Text>
          </View>
        </View>

        <View style={styles.statusContainer}>
          <View
            style={[styles.statusChip, { backgroundColor: getStatusBgColor() }]}
          >
            <Text style={[styles.statusText, { color: getStatusColor() }]}>
              {getStatusText()}
            </Text>
          </View>
        </View>

        {isDueToday &&
          !isCompletedToday &&
          !isMissedToday &&
          !isPendingReasonToday && (
            <View style={styles.actionContainer}>
              <TouchableOpacity
                style={[styles.actionButton, styles.completeButton]}
                onPress={handleComplete}
              >
                <Ionicons name="checkmark-circle" size={18} color="white" />
                <Text style={styles.actionButtonText}>✨ Complete</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.missButton]}
                onPress={handleMiss}
              >
                <Ionicons name="chatbubble-ellipses" size={18} color="white" />
                <Text style={styles.actionButtonText}>💭 Can't do it</Text>
              </TouchableOpacity>
            </View>
          )}

        {isPendingReasonToday && (
          <View style={styles.pendingActionContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.pendingButton]}
              onPress={handleMiss}
            >
              <Ionicons name="chatbubble-ellipses" size={18} color="white" />
              <Text style={styles.actionButtonText}>
                💭 Tell us what happened
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: theme.spacing.md,
    marginVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    shadowColor: theme.colors.shadow.color,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: theme.colors.shadow.opacity,
    shadowRadius: 12,
    elevation: 6,
  },
  gradient: {
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
  },
  pendingBanner: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing.sm + 2,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  pendingText: {
    fontSize: theme.typography.size.sm,
    fontWeight: theme.typography.weight.semibold as any,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: theme.spacing.sm,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: theme.typography.size.xl,
    fontWeight: theme.typography.weight.bold as any,
    marginBottom: theme.spacing.xs,
  },
  frequency: {
    fontSize: theme.typography.size.md,
    textTransform: "capitalize",
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.sm + 2,
    paddingVertical: theme.spacing.xs + 2,
    borderRadius: theme.borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 32,
    height: 32,
  },
  description: {
    fontSize: theme.typography.size.md,
    marginBottom: theme.spacing.md,
    lineHeight: 22,
    fontStyle: "italic",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  stat: {
    alignItems: "center",
    flex: 1,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  statLabel: {
    fontSize: theme.typography.size.xs,
    marginBottom: theme.spacing.xs,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    fontWeight: theme.typography.weight.medium as any,
  },
  statValue: {
    fontSize: theme.typography.size.lg,
    fontWeight: theme.typography.weight.bold as any,
  },
  statusContainer: {
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  statusChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.xl,
  },
  statusText: {
    fontSize: theme.typography.size.md,
    fontWeight: theme.typography.weight.semibold as any,
    textAlign: "center",
  },
  actionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: theme.spacing.md,
  },
  pendingActionContainer: {
    alignItems: "center",
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.sm,
    shadowColor: theme.colors.shadow.color,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  completeButton: {
    backgroundColor: theme.colors.status.success,
  },
  missButton: {
    backgroundColor: theme.colors.primary.main,
  },
  pendingButton: {
    backgroundColor: theme.colors.status.warning,
    minWidth: 220,
  },
  actionButtonText: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.size.md,
    fontWeight: theme.typography.weight.semibold as any,
  },
});

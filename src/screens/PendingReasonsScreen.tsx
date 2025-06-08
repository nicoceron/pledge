import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { PendingReason, RootStackParamList, MissReason } from "../types";
import { useHabits } from "../hooks/useHabits";
import { formatCurrency, formatDate } from "../utils";
import { theme } from "../utils/theme";

type PendingReasonsRouteProp = RouteProp<RootStackParamList, "PendingReasons">;

export const PendingReasonsScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<PendingReasonsRouteProp>();
  const { pendingReasons } = route.params;
  const { provideMissReason, habits } = useHabits();

  const handleProvideReason = (pending: PendingReason) => {
    const habit = habits.find((h) => h.id === pending.habitId);
    if (!habit) return;

    Alert.alert(
      `What happened with "${pending.habitTitle}"? 💙`,
      `We're here to listen, not judge! Share what made this challenging.\n\nDate: ${formatDate(
        new Date(pending.date)
      )}\nGentle reminder: ${formatCurrency(
        habit.pledgeAmount
      )} pledge will be processed.`,
      [
        {
          text: "😰 Felt Overwhelmed/Stressed",
          onPress: () => handleReasonSelected(pending, "stressed"),
        },
        {
          text: "📱 Got Distracted",
          onPress: () => handleReasonSelected(pending, "distracted"),
        },
        {
          text: "⏰ Ran Out of Time",
          onPress: () => handleReasonSelected(pending, "no_time"),
        },
        {
          text: "🤒 Wasn't Feeling Well",
          onPress: () => handleReasonSelected(pending, "sick"),
        },
        {
          text: "🚨 Emergency Came Up",
          onPress: () => handleReasonSelected(pending, "emergency"),
        },
        {
          text: "💭 Something Else",
          onPress: () => {
            Alert.prompt(
              "What happened? 💙",
              "Share what made this challenging today - we're here to understand, not judge:",
              (text) => {
                if (text && text.trim()) {
                  handleReasonSelected(pending, "other", text.trim());
                }
              }
            );
          },
        },
        {
          text: "⏸️ I'll share later",
          style: "cancel",
        },
      ]
    );
  };

  const handleReasonSelected = async (
    pending: PendingReason,
    reason: MissReason["reason"],
    customReason?: string
  ) => {
    try {
      await provideMissReason(
        pending.habitId,
        pending.date,
        reason,
        customReason
      );
      // If this was the last pending reason, go back
      if (pendingReasons.length === 1) {
        navigation.goBack();
      }
    } catch (error) {
      Alert.alert(
        "Oops! 😔",
        "Something went wrong saving your response. Please try again when you're ready."
      );
    }
  };

  const handleSkipAll = () => {
    Alert.alert(
      "Take Your Time 💙",
      "No pressure! You can always share what happened later from your habit cards. Ready to continue?",
      [
        { text: "Wait, I'll share now", style: "cancel" },
        {
          text: "Continue to app",
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.background.secondary },
      ]}
    >
      <LinearGradient
        colors={[theme.colors.primary.main, theme.colors.primary.light]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Ionicons name="heart" size={48} color={theme.colors.text.inverse} />
          <Text
            style={[styles.headerTitle, { color: theme.colors.text.inverse }]}
          >
            We're Here to Listen 💙
          </Text>
          <Text
            style={[
              styles.headerSubtitle,
              { color: theme.colors.text.inverse },
            ]}
          >
            Help us understand your journey so we can support you better - no
            judgment, just understanding
          </Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View
          style={[
            styles.infoCard,
            { backgroundColor: theme.colors.background.card },
          ]}
        >
          <View
            style={[
              styles.infoHeader,
              { backgroundColor: theme.colors.pastel.blue },
            ]}
          >
            <Ionicons
              name="information-circle"
              size={24}
              color={theme.colors.primary.main}
            />
            <Text
              style={[styles.infoTitle, { color: theme.colors.primary.main }]}
            >
              Why We Ask 🤗
            </Text>
          </View>
          <Text
            style={[styles.infoText, { color: theme.colors.text.secondary }]}
          >
            Understanding what makes habits challenging helps us provide better
            support and insights for your journey. Your gentle accountability
            pledge will still be processed, but sharing helps us learn together!
            💪
          </Text>
        </View>

        {pendingReasons.map((pending, index) => {
          const habit = habits.find((h) => h.id === pending.habitId);
          return (
            <View
              key={`${pending.habitId}-${pending.date}`}
              style={[
                styles.pendingCard,
                { backgroundColor: theme.colors.background.card },
              ]}
            >
              <View style={styles.pendingHeader}>
                <Text
                  style={[
                    styles.pendingTitle,
                    { color: theme.colors.text.primary },
                  ]}
                >
                  {pending.habitTitle}
                </Text>
                <View
                  style={[
                    styles.dateBadge,
                    { backgroundColor: theme.colors.pastel.purple },
                  ]}
                >
                  <Text
                    style={[
                      styles.pendingDate,
                      { color: theme.colors.primary.main },
                    ]}
                  >
                    {formatDate(new Date(pending.date))}
                  </Text>
                </View>
              </View>

              {habit && (
                <View
                  style={[
                    styles.pledgeContainer,
                    { backgroundColor: theme.colors.pastel.orange },
                  ]}
                >
                  <Ionicons
                    name="wallet"
                    size={16}
                    color={theme.colors.status.warning}
                  />
                  <Text
                    style={[
                      styles.pendingPledge,
                      { color: theme.colors.status.warning },
                    ]}
                  >
                    Gentle reminder: {formatCurrency(habit.pledgeAmount)}{" "}
                    accountability investment
                  </Text>
                </View>
              )}

              <TouchableOpacity
                style={styles.provideReasonButton}
                onPress={() => handleProvideReason(pending)}
              >
                <LinearGradient
                  colors={[
                    theme.colors.primary.main,
                    theme.colors.primary.light,
                  ]}
                  style={styles.buttonGradient}
                >
                  <Ionicons
                    name="chatbubble-ellipses"
                    size={20}
                    color={theme.colors.text.inverse}
                  />
                  <Text
                    style={[
                      styles.buttonText,
                      { color: theme.colors.text.inverse },
                    ]}
                  >
                    💭 Share What Happened
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          );
        })}

        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[
              styles.skipButton,
              { backgroundColor: theme.colors.pastel.gray },
            ]}
            onPress={handleSkipAll}
          >
            <Ionicons
              name="time"
              size={20}
              color={theme.colors.text.secondary}
            />
            <Text
              style={[
                styles.skipButtonText,
                { color: theme.colors.text.secondary },
              ]}
            >
              ⏸️ I'll share later
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: theme.spacing.xl,
  },
  headerContent: {
    alignItems: "center",
  },
  headerTitle: {
    fontSize: theme.typography.size.header,
    fontWeight: theme.typography.weight.bold as any,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: theme.typography.size.md,
    textAlign: "center",
    opacity: 0.9,
    lineHeight: 22,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  infoCard: {
    marginTop: -20,
    borderRadius: theme.borderRadius.xl,
    shadowColor: theme.colors.shadow.color,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    overflow: "hidden",
    marginBottom: theme.spacing.xl,
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  infoTitle: {
    fontSize: theme.typography.size.lg,
    fontWeight: theme.typography.weight.bold as any,
  },
  infoText: {
    fontSize: theme.typography.size.md,
    lineHeight: 24,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
    fontWeight: theme.typography.weight.normal as any,
  },
  pendingCard: {
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    shadowColor: theme.colors.shadow.color,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  pendingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  pendingTitle: {
    fontSize: theme.typography.size.xl,
    fontWeight: theme.typography.weight.bold as any,
    flex: 1,
  },
  dateBadge: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
  },
  pendingDate: {
    fontSize: theme.typography.size.sm,
    fontWeight: theme.typography.weight.semibold as any,
  },
  pledgeContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  pendingPledge: {
    fontSize: theme.typography.size.sm,
    fontWeight: theme.typography.weight.medium as any,
  },
  provideReasonButton: {
    borderRadius: theme.borderRadius.md,
    overflow: "hidden",
    shadowColor: theme.colors.shadow.color,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  buttonText: {
    fontSize: theme.typography.size.md,
    fontWeight: theme.typography.weight.semibold as any,
  },
  actionContainer: {
    alignItems: "center",
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  skipButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.sm,
  },
  skipButtonText: {
    fontSize: theme.typography.size.md,
    fontWeight: theme.typography.weight.medium as any,
  },
  bottomSpacing: {
    height: theme.spacing.xxl,
  },
});

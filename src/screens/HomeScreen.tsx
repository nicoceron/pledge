import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useHabits } from "../hooks/useHabits";
import { HabitCard } from "../components/HabitCard";
import { formatCurrency } from "../utils";
import { RootStackParamList } from "../types";
import { theme } from "../utils/theme";

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList>;

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const {
    habits,
    loading,
    error,
    pendingReasons,
    completeHabit,
    markHabitMissed,
    getTodaysHabits,
    getActiveHabits,
    getTotalPledgedAmount,
    refresh,
  } = useHabits();

  const todaysHabits = getTodaysHabits();
  const activeHabits = getActiveHabits();
  const totalPledged = getTotalPledgedAmount();

  // Check for pending reasons on component mount
  useEffect(() => {
    if (pendingReasons.length > 0) {
      // Small delay to ensure navigation is ready
      const timer = setTimeout(() => {
        navigation.navigate("PendingReasons", { pendingReasons });
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [pendingReasons, navigation]);

  const completedToday = todaysHabits.filter((habit) => {
    const today = new Date().toISOString().split("T")[0];
    return habit.completedDates.includes(today);
  }).length;

  const missedToday = todaysHabits.filter((habit) => {
    const today = new Date().toISOString().split("T")[0];
    return habit.missedDates.includes(today);
  }).length;

  const pendingToday = todaysHabits.filter((habit) => {
    const today = new Date().toISOString().split("T")[0];
    return habit.pendingReasonDates.includes(today);
  }).length;

  const handleShowPendingReasons = () => {
    if (pendingReasons.length > 0) {
      navigation.navigate("PendingReasons", { pendingReasons });
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning! 🌅";
    if (hour < 17) return "Good afternoon! ☀️";
    return "Good evening! 🌙";
  };

  if (loading) {
    return (
      <View
        style={[
          styles.centered,
          { backgroundColor: theme.colors.background.secondary },
        ]}
      >
        <Ionicons
          name="hourglass"
          size={48}
          color={theme.colors.primary.main}
        />
        <Text
          style={[styles.loadingText, { color: theme.colors.text.primary }]}
        >
          Loading your habits...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View
        style={[
          styles.centered,
          { backgroundColor: theme.colors.background.secondary },
        ]}
      >
        <Ionicons name="sad" size={48} color={theme.colors.status.error} />
        <Text style={[styles.errorText, { color: theme.colors.status.error }]}>
          {error}
        </Text>
        <TouchableOpacity
          style={[
            styles.retryButton,
            { backgroundColor: theme.colors.primary.main },
          ]}
          onPress={refresh}
        >
          <Text
            style={[
              styles.retryButtonText,
              { color: theme.colors.text.inverse },
            ]}
          >
            Try Again
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

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
          <Text style={[styles.greeting, { color: theme.colors.text.inverse }]}>
            {getGreeting()}
          </Text>
          <Text
            style={[styles.headerTitle, { color: theme.colors.text.inverse }]}
          >
            Your Daily Journey
          </Text>

          {pendingReasons.length > 0 && (
            <TouchableOpacity
              style={[
                styles.pendingBanner,
                { backgroundColor: theme.colors.background.card },
              ]}
              onPress={handleShowPendingReasons}
            >
              <Ionicons
                name="chatbubble-ellipses"
                size={20}
                color={theme.colors.status.warning}
              />
              <View style={styles.pendingBannerContent}>
                <Text
                  style={[
                    styles.pendingBannerTitle,
                    { color: theme.colors.text.primary },
                  ]}
                >
                  💭 {pendingReasons.length} habit
                  {pendingReasons.length > 1 ? "s" : ""} need
                  {pendingReasons.length === 1 ? "s" : ""} your attention
                </Text>
                <Text
                  style={[
                    styles.pendingBannerSubtitle,
                    { color: theme.colors.text.secondary },
                  ]}
                >
                  Tap to share what happened - we're here to help!
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={theme.colors.primary.main}
              />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refresh} />
        }
      >
        <View
          style={[
            styles.statsContainer,
            { backgroundColor: theme.colors.background.card },
          ]}
        >
          <View
            style={[
              styles.stat,
              { backgroundColor: theme.colors.pastel.green },
            ]}
          >
            <Text
              style={[styles.statValue, { color: theme.colors.status.success }]}
            >
              ✨ {completedToday}
            </Text>
            <Text
              style={[styles.statLabel, { color: theme.colors.text.secondary }]}
            >
              Completed
            </Text>
          </View>
          <View
            style={[
              styles.stat,
              { backgroundColor: theme.colors.pastel.yellow },
            ]}
          >
            <Text
              style={[styles.statValue, { color: theme.colors.status.warning }]}
            >
              💭 {pendingToday}
            </Text>
            <Text
              style={[styles.statLabel, { color: theme.colors.text.secondary }]}
            >
              Needs Attention
            </Text>
          </View>
          <View
            style={[styles.stat, { backgroundColor: theme.colors.pastel.pink }]}
          >
            <Text
              style={[styles.statValue, { color: theme.colors.status.error }]}
            >
              💔 {missedToday}
            </Text>
            <Text
              style={[styles.statLabel, { color: theme.colors.text.secondary }]}
            >
              Missed
            </Text>
          </View>
          <View
            style={[
              styles.stat,
              { backgroundColor: theme.colors.pastel.purple },
            ]}
          >
            <Text
              style={[styles.statValue, { color: theme.colors.primary.main }]}
            >
              💰 {formatCurrency(totalPledged)}
            </Text>
            <Text
              style={[styles.statLabel, { color: theme.colors.text.secondary }]}
            >
              Invested
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text
              style={[
                styles.sectionTitle,
                { color: theme.colors.text.primary },
              ]}
            >
              {todaysHabits.length === 0
                ? "🎉 All done today!"
                : "⏰ Today's Habits"}
            </Text>
            <View
              style={[
                styles.sectionBadge,
                { backgroundColor: theme.colors.pastel.blue },
              ]}
            >
              <Text
                style={[
                  styles.sectionCount,
                  { color: theme.colors.primary.main },
                ]}
              >
                {todaysHabits.length}
              </Text>
            </View>
          </View>

          {todaysHabits.length === 0 ? (
            <View
              style={[
                styles.emptyState,
                { backgroundColor: theme.colors.background.card },
              ]}
            >
              <Ionicons
                name="checkmark-circle"
                size={64}
                color={theme.colors.status.success}
              />
              <Text
                style={[
                  styles.emptyTitle,
                  { color: theme.colors.text.primary },
                ]}
              >
                You're all caught up! ✨
              </Text>
              <Text
                style={[
                  styles.emptySubtitle,
                  { color: theme.colors.text.secondary },
                ]}
              >
                No habits due today. Take a moment to celebrate your
                consistency! 🎉
              </Text>
            </View>
          ) : (
            todaysHabits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                onComplete={completeHabit}
                onMiss={markHabitMissed}
              />
            ))
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text
              style={[
                styles.sectionTitle,
                { color: theme.colors.text.primary },
              ]}
            >
              📋 All Your Habits
            </Text>
            <View
              style={[
                styles.sectionBadge,
                { backgroundColor: theme.colors.pastel.gray },
              ]}
            >
              <Text
                style={[
                  styles.sectionCount,
                  { color: theme.colors.text.secondary },
                ]}
              >
                {activeHabits.length}
              </Text>
            </View>
          </View>

          {activeHabits.length === 0 ? (
            <View
              style={[
                styles.emptyState,
                { backgroundColor: theme.colors.background.card },
              ]}
            >
              <Ionicons
                name="sparkles"
                size={64}
                color={theme.colors.primary.main}
              />
              <Text
                style={[
                  styles.emptyTitle,
                  { color: theme.colors.text.primary },
                ]}
              >
                Ready to start your journey? 🚀
              </Text>
              <Text
                style={[
                  styles.emptySubtitle,
                  { color: theme.colors.text.secondary },
                ]}
              >
                Create your first habit and begin building the life you want
                with gentle accountability!
              </Text>
            </View>
          ) : (
            activeHabits
              .filter((habit) => !todaysHabits.includes(habit))
              .map((habit) => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  onComplete={completeHabit}
                  onMiss={markHabitMissed}
                />
              ))
          )}
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
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  loadingText: {
    fontSize: theme.typography.size.lg,
    fontWeight: theme.typography.weight.medium as any,
  },
  errorText: {
    fontSize: theme.typography.size.lg,
    textAlign: "center",
    marginBottom: theme.spacing.md,
    fontWeight: theme.typography.weight.medium as any,
  },
  retryButton: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    shadowColor: theme.colors.shadow.color,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  retryButtonText: {
    fontSize: theme.typography.size.lg,
    fontWeight: theme.typography.weight.semibold as any,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: theme.spacing.xl,
  },
  headerContent: {
    alignItems: "center",
  },
  greeting: {
    fontSize: theme.typography.size.lg,
    opacity: 0.9,
    marginBottom: theme.spacing.sm,
    fontWeight: theme.typography.weight.medium as any,
  },
  headerTitle: {
    fontSize: theme.typography.size.hero,
    fontWeight: theme.typography.weight.bold as any,
    marginBottom: theme.spacing.xl,
    textAlign: "center",
  },
  pendingBanner: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    width: "100%",
    gap: theme.spacing.md,
    shadowColor: theme.colors.shadow.color,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  pendingBannerContent: {
    flex: 1,
  },
  pendingBannerTitle: {
    fontSize: theme.typography.size.md,
    fontWeight: theme.typography.weight.semibold as any,
    marginBottom: theme.spacing.xs,
  },
  pendingBannerSubtitle: {
    fontSize: theme.typography.size.sm,
  },
  content: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginHorizontal: theme.spacing.lg,
    marginTop: -30,
    borderRadius: theme.borderRadius.xl,
    paddingVertical: theme.spacing.xl,
    paddingHorizontal: theme.spacing.md,
    shadowColor: theme.colors.shadow.color,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
    gap: theme.spacing.xs,
  },
  stat: {
    alignItems: "center",
    flex: 1,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  statValue: {
    fontSize: theme.typography.size.title,
    fontWeight: theme.typography.weight.bold as any,
    marginBottom: theme.spacing.xs,
  },
  statLabel: {
    fontSize: theme.typography.size.xs,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    fontWeight: theme.typography.weight.medium as any,
    textAlign: "center",
  },
  section: {
    marginTop: theme.spacing.xxl,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.size.title,
    fontWeight: theme.typography.weight.bold as any,
  },
  sectionBadge: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.round,
  },
  sectionCount: {
    fontSize: theme.typography.size.md,
    fontWeight: theme.typography.weight.semibold as any,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: theme.spacing.xxl + theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
    marginHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    shadowColor: theme.colors.shadow.color,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyTitle: {
    fontSize: theme.typography.size.xl,
    fontWeight: theme.typography.weight.bold as any,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: theme.typography.size.md,
    textAlign: "center",
    lineHeight: 24,
    fontWeight: theme.typography.weight.normal as any,
  },
  bottomSpacing: {
    height: theme.spacing.xxl,
  },
});

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useHabits } from "../hooks/useHabits";
import { HabitCard } from "../components/HabitCard";
import { formatCurrency, formatDate } from "../utils";

export const HomeScreen: React.FC = () => {
  const {
    habits,
    loading,
    completeHabit,
    markHabitMissed,
    getTodaysHabits,
    getTotalPledgedAmount,
    refresh,
  } = useHabits();

  const todaysHabits = getTodaysHabits();
  const totalPledged = getTotalPledgedAmount();
  const completedToday = todaysHabits.filter((habit) =>
    habit.completedDates.includes(new Date().toISOString().split("T")[0])
  ).length;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header Stats */}
        <LinearGradient
          colors={["#4F46E5", "#7C3AED"]}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Today's Overview</Text>
            <Text style={styles.headerDate}>{formatDate(new Date())}</Text>

            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                <Text style={styles.statNumber}>{completedToday}</Text>
                <Text style={styles.statLabel}>Completed</Text>
              </View>

              <View style={styles.statCard}>
                <Ionicons name="list" size={24} color="#F59E0B" />
                <Text style={styles.statNumber}>{todaysHabits.length}</Text>
                <Text style={styles.statLabel}>Due Today</Text>
              </View>

              <View style={styles.statCard}>
                <Ionicons name="card" size={24} color="#EF4444" />
                <Text style={styles.statNumber}>
                  {formatCurrency(totalPledged)}
                </Text>
                <Text style={styles.statLabel}>Total Pledged</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Today's Habits */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Habits</Text>

          {todaysHabits.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="happy-outline" size={64} color="#9CA3AF" />
              <Text style={styles.emptyStateTitle}>No habits due today!</Text>
              <Text style={styles.emptyStateText}>
                You're all caught up. Great job staying committed to your goals!
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

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>

          <View style={styles.quickActionsContainer}>
            <TouchableOpacity style={styles.quickAction}>
              <LinearGradient
                colors={["#10B981", "#059669"]}
                style={styles.quickActionGradient}
              >
                <Ionicons name="add-circle" size={24} color="white" />
                <Text style={styles.quickActionText}>Add Habit</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickAction}>
              <LinearGradient
                colors={["#8B5CF6", "#7C3AED"]}
                style={styles.quickActionGradient}
              >
                <Ionicons name="bar-chart" size={24} color="white" />
                <Text style={styles.quickActionText}>View Analytics</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  scrollView: {
    flex: 1,
  },
  headerGradient: {
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "white",
    marginBottom: 4,
  },
  headerDate: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 24,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "700",
    color: "white",
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
  },
  section: {
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
  },
  quickActionsContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 12,
  },
  quickAction: {
    flex: 1,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  quickActionGradient: {
    padding: 20,
    alignItems: "center",
    gap: 8,
  },
  quickActionText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  bottomSpacing: {
    height: 20,
  },
});

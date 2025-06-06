import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useHabits } from "../hooks/useHabits";
import { StorageService } from "../services/storage";
import { Payment } from "../types";
import { formatCurrency, formatDate } from "../utils";

export const AnalyticsScreen: React.FC = () => {
  const { habits, loading, getTotalPledgedAmount, refresh } = useHabits();
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
  const totalPledged = getTotalPledgedAmount();
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
    color,
    subtitle,
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    value: string;
    color: string;
    subtitle?: string;
  }) => (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: color }]}>
        <Ionicons name={icon} size={24} color="white" />
      </View>
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={styles.statValue}>{value}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Overview Stats */}
        <LinearGradient
          colors={["#4F46E5", "#7C3AED"]}
          style={styles.headerGradient}
        >
          <Text style={styles.headerTitle}>Your Progress</Text>
          <Text style={styles.headerSubtitle}>Track your habit journey</Text>
        </LinearGradient>

        {/* Key Metrics */}
        <View style={styles.metricsContainer}>
          <StatCard
            icon="trophy"
            title="Success Rate"
            value={`${successRate}%`}
            color="#10B981"
            subtitle={`${completedHabits} completed`}
          />

          <StatCard
            icon="flame"
            title="Avg Streak"
            value={`${averageStreak}`}
            color="#F59E0B"
            subtitle="days"
          />
        </View>

        <View style={styles.metricsContainer}>
          <StatCard
            icon="list"
            title="Active Habits"
            value={activeHabits.toString()}
            color="#3B82F6"
            subtitle={`${totalHabits} total`}
          />

          <StatCard
            icon="card"
            title="Total Charged"
            value={formatCurrency(totalPledged)}
            color="#EF4444"
            subtitle={`${missedHabits} missed`}
          />
        </View>

        {/* Detailed Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detailed Statistics</Text>

          <View style={styles.detailCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Habits Completed</Text>
              <Text style={styles.detailValue}>{completedHabits}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Habits Missed</Text>
              <Text style={[styles.detailValue, { color: "#EF4444" }]}>
                {missedHabits}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Total Streak Days</Text>
              <Text style={styles.detailValue}>{totalStreak}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Average Pledge</Text>
              <Text style={styles.detailValue}>
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
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Charges</Text>

          {payments.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="happy-outline" size={48} color="#9CA3AF" />
              <Text style={styles.emptyStateText}>No charges yet!</Text>
              <Text style={styles.emptyStateSubtext}>
                Keep up the good work and avoid missing your habits.
              </Text>
            </View>
          ) : (
            <View style={styles.paymentsContainer}>
              {payments.slice(0, 10).map((payment) => {
                const habit = habits.find((h) => h.id === payment.habitId);
                return (
                  <View key={payment.id} style={styles.paymentCard}>
                    <View style={styles.paymentHeader}>
                      <Ionicons name="card" size={20} color="#EF4444" />
                      <Text style={styles.paymentAmount}>
                        {formatCurrency(payment.amount)}
                      </Text>
                    </View>
                    <Text style={styles.paymentHabit}>
                      {habit?.title || "Unknown Habit"}
                    </Text>
                    <Text style={styles.paymentDate}>
                      {formatDate(payment.date)}
                    </Text>
                    <View
                      style={[
                        styles.paymentStatus,
                        {
                          backgroundColor:
                            payment.status === "completed"
                              ? "#10B981"
                              : "#F59E0B",
                        },
                      ]}
                    >
                      <Text style={styles.paymentStatusText}>
                        {payment.status.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
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
    backgroundColor: "#F9FAFB",
  },
  scrollView: {
    flex: 1,
  },
  headerGradient: {
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "white",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
  },
  metricsContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  statTitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 4,
    textAlign: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  statSubtitle: {
    fontSize: 12,
    color: "#9CA3AF",
    textAlign: "center",
  },
  section: {
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 16,
  },
  detailCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  detailLabel: {
    fontSize: 16,
    color: "#6B7280",
  },
  detailValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
    backgroundColor: "white",
    borderRadius: 16,
    marginHorizontal: 16,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginTop: 12,
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },
  paymentsContainer: {
    gap: 12,
  },
  paymentCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  paymentHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  paymentAmount: {
    fontSize: 18,
    fontWeight: "700",
    color: "#EF4444",
  },
  paymentHabit: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  paymentDate: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 8,
  },
  paymentStatus: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  paymentStatusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "white",
  },
  bottomSpacing: {
    height: 20,
  },
});

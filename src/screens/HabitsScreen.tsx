import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useHabits } from "../hooks/useHabits";
import { HabitCard } from "../components/HabitCard";
import { Habit } from "../types";

export const HabitsScreen: React.FC = () => {
  const {
    habits,
    loading,
    addHabit,
    completeHabit,
    markHabitMissed,
    deleteHabit,
    getActiveHabits,
    refresh,
  } = useHabits();

  const [showAddModal, setShowAddModal] = useState(false);
  const [newHabit, setNewHabit] = useState({
    title: "",
    description: "",
    frequency: "daily" as "daily" | "weekly" | "monthly",
    pledgeAmount: 5,
  });

  const activeHabits = getActiveHabits();

  const handleAddHabit = async () => {
    if (!newHabit.title.trim()) {
      Alert.alert("Error", "Please enter a habit title");
      return;
    }

    try {
      await addHabit({
        title: newHabit.title.trim(),
        description: newHabit.description.trim(),
        frequency: newHabit.frequency,
        pledgeAmount: newHabit.pledgeAmount,
        isActive: true,
      });

      setNewHabit({
        title: "",
        description: "",
        frequency: "daily",
        pledgeAmount: 5,
      });
      setShowAddModal(false);
    } catch (error) {
      Alert.alert("Error", "Failed to add habit");
    }
  };

  const handleDeleteHabit = (habit: Habit) => {
    Alert.alert(
      "Delete Habit",
      `Are you sure you want to delete "${habit.title}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteHabit(habit.id),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Summary */}
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryText}>
            You have {activeHabits.length} active habit
            {activeHabits.length !== 1 ? "s" : ""}
          </Text>
        </View>

        {/* Habits List */}
        {activeHabits.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="leaf-outline" size={64} color="#9CA3AF" />
            <Text style={styles.emptyStateTitle}>No habits yet</Text>
            <Text style={styles.emptyStateText}>
              Start building better habits by creating your first one!
            </Text>
            <TouchableOpacity
              style={styles.addFirstHabitButton}
              onPress={() => setShowAddModal(true)}
            >
              <LinearGradient
                colors={["#4F46E5", "#7C3AED"]}
                style={styles.addFirstHabitGradient}
              >
                <Ionicons name="add" size={24} color="white" />
                <Text style={styles.addFirstHabitText}>
                  Create Your First Habit
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          activeHabits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              onComplete={completeHabit}
              onMiss={markHabitMissed}
              onPress={() => handleDeleteHabit(habit)}
            />
          ))
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Floating Add Button */}
      {activeHabits.length > 0 && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setShowAddModal(true)}
        >
          <LinearGradient
            colors={["#10B981", "#059669"]}
            style={styles.fabGradient}
          >
            <Ionicons name="add" size={24} color="white" />
          </LinearGradient>
        </TouchableOpacity>
      )}

      {/* Add Habit Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setShowAddModal(false)}
              style={styles.modalCloseButton}
            >
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Create New Habit</Text>
            <TouchableOpacity
              onPress={handleAddHabit}
              style={styles.modalSaveButton}
            >
              <Text style={styles.modalSaveText}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Habit Name</Text>
              <TextInput
                style={styles.textInput}
                value={newHabit.title}
                onChangeText={(text) =>
                  setNewHabit({ ...newHabit, title: text })
                }
                placeholder="e.g., Exercise for 30 minutes"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description (Optional)</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={newHabit.description}
                onChangeText={(text) =>
                  setNewHabit({ ...newHabit, description: text })
                }
                placeholder="Add more details about your habit"
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Frequency</Text>
              <View style={styles.frequencyContainer}>
                {(["daily", "weekly", "monthly"] as const).map((freq) => (
                  <TouchableOpacity
                    key={freq}
                    style={[
                      styles.frequencyButton,
                      newHabit.frequency === freq &&
                        styles.frequencyButtonActive,
                    ]}
                    onPress={() =>
                      setNewHabit({ ...newHabit, frequency: freq })
                    }
                  >
                    <Text
                      style={[
                        styles.frequencyButtonText,
                        newHabit.frequency === freq &&
                          styles.frequencyButtonTextActive,
                      ]}
                    >
                      {freq.charAt(0).toUpperCase() + freq.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Pledge Amount</Text>
              <TextInput
                style={styles.textInput}
                value={newHabit.pledgeAmount.toString()}
                onChangeText={(text) => {
                  const amount = parseFloat(text) || 0;
                  setNewHabit({
                    ...newHabit,
                    pledgeAmount: Math.max(0, amount),
                  });
                }}
                placeholder="5.00"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
              />
              <Text style={styles.inputHelp}>
                Amount you'll be charged for missing this habit
              </Text>
            </View>
          </ScrollView>
        </View>
      </Modal>
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
  summaryContainer: {
    padding: 20,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  summaryText: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyStateTitle: {
    fontSize: 20,
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
    marginBottom: 24,
  },
  addFirstHabitButton: {
    borderRadius: 16,
    overflow: "hidden",
  },
  addFirstHabitGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
  },
  addFirstHabitText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  bottomSpacing: {
    height: 100,
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    borderRadius: 28,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "white",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalCloseButton: {
    padding: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
  },
  modalSaveButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#4F46E5",
    borderRadius: 8,
  },
  modalSaveText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1F2937",
    backgroundColor: "white",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  inputHelp: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },
  frequencyContainer: {
    flexDirection: "row",
    gap: 12,
  },
  frequencyButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    alignItems: "center",
    backgroundColor: "white",
  },
  frequencyButtonActive: {
    backgroundColor: "#4F46E5",
    borderColor: "#4F46E5",
  },
  frequencyButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  frequencyButtonTextActive: {
    color: "white",
  },
});

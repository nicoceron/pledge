import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useHabits } from "../hooks/useHabits";
import { HabitCard } from "../components/HabitCard";
import { generateId } from "../utils";
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
  const [newHabit, setNewHabit] = useState<
    Omit<
      Habit,
      | "id"
      | "createdAt"
      | "streak"
      | "completedDates"
      | "missedDates"
      | "totalPledged"
      | "pendingReasonDates"
      | "missReasons"
    >
  >({
    title: "",
    description: "",
    frequency: "daily",
    pledgeAmount: 5,
    isActive: true,
  });

  const activeHabits = getActiveHabits();

  const handleAddHabit = async () => {
    if (!newHabit.title.trim()) {
      Alert.alert("Please enter a habit name");
      return;
    }

    const habit: Habit = {
      ...newHabit,
      id: generateId(),
      title: newHabit.title.trim(),
      description: newHabit.description.trim(),
      createdAt: new Date(),
      streak: 0,
      completedDates: [],
      missedDates: [],
      totalPledged: 0,
      pendingReasonDates: [],
      missReasons: {},
    };

    await addHabit(habit);
    setNewHabit({
      title: "",
      description: "",
      frequency: "daily",
      pledgeAmount: 5,
      isActive: true,
    });
    setShowAddModal(false);
  };

  const handleDeleteHabit = (habit: Habit) => {
    Alert.alert(
      `Delete "${habit.title}"? 💔`,
      "This will permanently remove this habit and all its progress. This can't be undone.",
      [
        { text: "Keep it", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteHabit(habit.id),
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-navy-50">
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Summary */}
        <View className="bg-white border-b border-navy-100 px-6 py-4">
          <Text className="text-navy-600 text-base text-center">
            {activeHabits.length === 0
              ? "Ready to start your habit journey? 🌟"
              : `You have ${activeHabits.length} active habit${
                  activeHabits.length === 1 ? "" : "s"
                } 💪`}
          </Text>
        </View>

        {/* Habits List */}
        {activeHabits.length === 0 ? (
          <View className="bg-white mx-4 mt-6 rounded-2xl p-8 items-center border border-navy-100">
            <Ionicons
              name="sparkles"
              size={64}
              className="text-navy-600 mb-4"
            />
            <Text className="text-navy-900 text-xl font-bold mb-2 text-center">
              Ready to build great habits? 🚀
            </Text>
            <Text className="text-navy-600 text-base text-center leading-6 mb-6">
              Start your journey to a better you by creating your first habit
              with gentle accountability!
            </Text>
            <TouchableOpacity
              className="bg-navy-600 rounded-xl px-6 py-4 flex-row items-center shadow-sm"
              onPress={() => setShowAddModal(true)}
            >
              <Ionicons name="add-circle" size={24} color="white" />
              <Text className="text-white text-base font-semibold ml-2">
                ✨ Create Your First Habit
              </Text>
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

        <View className="h-20" />
      </ScrollView>

      {/* Floating Add Button */}
      {activeHabits.length > 0 && (
        <TouchableOpacity
          className="absolute bottom-6 right-6 bg-navy-600 w-14 h-14 rounded-full items-center justify-center shadow-lg"
          onPress={() => setShowAddModal(true)}
        >
          <Ionicons name="add" size={28} color="white" />
        </TouchableOpacity>
      )}

      {/* Add Habit Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View className="flex-1 bg-navy-50">
          {/* Modal Header */}
          <View className="bg-white border-b border-navy-100 px-6 py-4 pt-12">
            <View className="flex-row justify-between items-center">
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Text className="text-navy-600 text-base font-medium">
                  Cancel
                </Text>
              </TouchableOpacity>
              <Text className="text-navy-900 text-lg font-bold">
                ✨ New Habit
              </Text>
              <TouchableOpacity onPress={handleAddHabit}>
                <Text className="text-navy-600 text-base font-semibold">
                  Save
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView className="flex-1 p-6">
            {/* Habit Name */}
            <View className="mb-6">
              <Text className="text-navy-900 text-base font-semibold mb-2">
                Habit Name *
              </Text>
              <TextInput
                className="bg-white border border-navy-200 rounded-xl px-4 py-3 text-navy-900 text-base"
                placeholder="e.g., Morning meditation, Daily walk..."
                placeholderTextColor="#9fb3c8"
                value={newHabit.title}
                onChangeText={(text) =>
                  setNewHabit({ ...newHabit, title: text })
                }
              />
            </View>

            {/* Description */}
            <View className="mb-6">
              <Text className="text-navy-900 text-base font-semibold mb-2">
                Description (Optional)
              </Text>
              <TextInput
                className="bg-white border border-navy-200 rounded-xl px-4 py-3 text-navy-900 text-base"
                placeholder="Why is this habit important to you?"
                placeholderTextColor="#9fb3c8"
                value={newHabit.description}
                onChangeText={(text) =>
                  setNewHabit({ ...newHabit, description: text })
                }
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            {/* Frequency */}
            <View className="mb-6">
              <Text className="text-navy-900 text-base font-semibold mb-3">
                Frequency
              </Text>
              <View className="flex-row gap-3">
                {["daily", "weekly", "monthly"].map((freq) => (
                  <TouchableOpacity
                    key={freq}
                    className={`flex-1 py-3 px-4 rounded-xl border-2 ${
                      newHabit.frequency === freq
                        ? "bg-navy-600 border-navy-600"
                        : "bg-white border-navy-200"
                    }`}
                    onPress={() =>
                      setNewHabit({ ...newHabit, frequency: freq as any })
                    }
                  >
                    <Text
                      className={`text-center font-semibold capitalize ${
                        newHabit.frequency === freq
                          ? "text-white"
                          : "text-navy-700"
                      }`}
                    >
                      {freq}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Pledge Amount */}
            <View className="mb-6">
              <Text className="text-navy-900 text-base font-semibold mb-2">
                Pledge Amount
              </Text>
              <Text className="text-navy-600 text-sm mb-3">
                Amount charged when you miss this habit
              </Text>
              <View className="flex-row gap-3">
                {[1, 5, 10, 25].map((amount) => (
                  <TouchableOpacity
                    key={amount}
                    className={`flex-1 py-3 px-4 rounded-xl border-2 ${
                      newHabit.pledgeAmount === amount
                        ? "bg-navy-600 border-navy-600"
                        : "bg-white border-navy-200"
                    }`}
                    onPress={() =>
                      setNewHabit({ ...newHabit, pledgeAmount: amount })
                    }
                  >
                    <Text
                      className={`text-center font-semibold ${
                        newHabit.pledgeAmount === amount
                          ? "text-white"
                          : "text-navy-700"
                      }`}
                    >
                      ${amount}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Info Card */}
            <View className="bg-pastel-info border border-blue-200 rounded-xl p-4">
              <View className="flex-row items-start">
                <Ionicons
                  name="information-circle"
                  size={20}
                  className="text-blue-600 mr-3 mt-0.5"
                />
                <View className="flex-1">
                  <Text className="text-blue-800 text-sm font-semibold mb-1">
                    💙 Gentle Accountability
                  </Text>
                  <Text className="text-blue-700 text-sm leading-5">
                    We believe in understanding, not punishment. When you miss a
                    habit, we'll ask why to help you grow stronger together.
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

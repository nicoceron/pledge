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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useHabits } from "../hooks/useHabits";
import { HabitCard } from "../components/HabitCard";
import { generateId } from "../utils/index";
import { Habit } from "../types";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types";

type HabitsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Tabs"
>;

export const HabitsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<HabitsScreenNavigationProp>();
  const {
    habits,
    loading,
    addHabit,
    completeHabit,
    markHabitMissed,
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
    frequency: "daily",
    customFrequency: {},
    pledgeAmount: 5,
    isActive: true,
  });

  // Separate state for input values
  const [intervalDays, setIntervalDays] = useState("3");
  const [timesPerWeek, setTimesPerWeek] = useState("3");
  const [timesPerMonth, setTimesPerMonth] = useState("10");
  const [timesInPeriod, setTimesInPeriod] = useState("3");
  const [periodDays, setPeriodDays] = useState("14");

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
      createdAt: new Date(),
      streak: 0,
      completedDates: [],
      missedDates: [],
      totalPledged: 0,
      missReasons: {},
    };

    await addHabit(habit);
    setNewHabit({
      title: "",
      frequency: "daily",
      customFrequency: {},
      pledgeAmount: 5,
      isActive: true,
    });
    setIntervalDays("3");
    setTimesPerWeek("3");
    setTimesPerMonth("10");
    setTimesInPeriod("3");
    setPeriodDays("14");
    setShowAddModal(false);
  };

  const handleHabitPress = (habit: Habit) => {
    navigation.navigate("HabitDetail", { habitId: habit.id });
  };

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="pt-12 pb-6 px-6">
          <Text className="text-gray-900 text-3xl font-bold mb-2">
            Your Habits
          </Text>
          <Text className="text-gray-600 text-base">
            {activeHabits.length === 0
              ? "Ready to start your habit journey?"
              : `Building ${activeHabits.length} great habit${
                  activeHabits.length === 1 ? "" : "s"
                }`}
          </Text>
        </View>

        {/* Habits List */}
        {activeHabits.length === 0 ? (
          <View className="px-6 py-8 items-center">
            <View className="bg-gray-100 rounded-full w-16 h-16 items-center justify-center mb-6">
              <Ionicons name="add" size={32} color="#374151" />
            </View>
            <Text className="text-gray-900 text-xl font-bold mb-3 text-center">
              Ready to build great habits?
            </Text>
            <Text className="text-gray-600 text-base text-center leading-6 mb-8">
              Start your journey to a better you by creating your first habit
              with gentle accountability
            </Text>
            <TouchableOpacity
              className="bg-gray-900 rounded-xl px-8 py-4 flex-row items-center"
              onPress={() => setShowAddModal(true)}
            >
              <Ionicons name="add-circle" size={24} color="white" />
              <Text className="text-white text-lg font-semibold ml-2">
                Create Your First Habit
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="px-6">
            {activeHabits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                onComplete={completeHabit}
                onMiss={markHabitMissed}
                onPress={handleHabitPress}
              />
            ))}
          </View>
        )}

        <View className="h-6" />
      </ScrollView>

      {/* Floating Add Button */}
      {activeHabits.length > 0 && (
        <TouchableOpacity
          className="absolute bottom-6 right-6 bg-gray-900 w-14 h-14 rounded-full items-center justify-center shadow-lg"
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
        <View className="flex-1 bg-white">
          {/* Modal Header */}
          <View className="bg-white px-6 py-4 pt-12 shadow-sm">
            <View className="flex-row justify-between items-center">
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Text className="text-gray-600 text-lg font-medium">
                  Cancel
                </Text>
              </TouchableOpacity>
              <Text className="text-gray-900 text-xl font-bold">New Habit</Text>
              <TouchableOpacity onPress={handleAddHabit}>
                <Text className="text-gray-900 text-lg font-semibold">
                  Save
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView className="flex-1 p-6">
            {/* Habit Name */}
            <View className="mb-6">
              <Text className="text-gray-900 text-lg font-semibold mb-3">
                Habit Name *
              </Text>
              <View className="bg-white border border-gray-200 rounded-xl h-14 justify-center">
                <TextInput
                  className="px-4 text-gray-900 text-lg"
                  placeholder="e.g., Morning meditation"
                  placeholderTextColor="#6b7280"
                  value={newHabit.title}
                  onChangeText={(text) =>
                    setNewHabit({ ...newHabit, title: text })
                  }
                  multiline={false}
                  style={{ height: 56, fontSize: 18 }}
                />
              </View>
            </View>

            {/* Frequency */}
            <View className="mb-6">
              <Text className="text-gray-900 text-lg font-semibold mb-3">
                Frequency
              </Text>

              {/* Every day */}
              <TouchableOpacity
                className="flex-row items-center mb-4"
                onPress={() =>
                  setNewHabit({
                    ...newHabit,
                    frequency: "daily",
                    customFrequency: {},
                  })
                }
              >
                <View
                  className={`w-6 h-6 rounded-full border-2 items-center justify-center mr-4 ${
                    newHabit.frequency === "daily"
                      ? "border-blue-500 bg-blue-500"
                      : "border-gray-300"
                  }`}
                >
                  {newHabit.frequency === "daily" && (
                    <View className="w-2 h-2 bg-white rounded-full" />
                  )}
                </View>
                <Text className="text-gray-900 text-lg">Every day</Text>
              </TouchableOpacity>

              {/* Every X days */}
              <TouchableOpacity
                className="flex-row items-center mb-4"
                onPress={() =>
                  setNewHabit({
                    ...newHabit,
                    frequency: "custom",
                    customFrequency: {
                      intervalDays: parseInt(intervalDays) || 3,
                    },
                  })
                }
              >
                <View
                  className={`w-6 h-6 rounded-full border-2 items-center justify-center mr-4 ${
                    newHabit.frequency === "custom" &&
                    newHabit.customFrequency?.intervalDays
                      ? "border-blue-500 bg-blue-500"
                      : "border-gray-300"
                  }`}
                >
                  {newHabit.frequency === "custom" &&
                    newHabit.customFrequency?.intervalDays && (
                      <View className="w-2 h-2 bg-white rounded-full" />
                    )}
                </View>
                <View className="flex-row items-center flex-1">
                  <Text className="text-gray-900 text-lg">Every</Text>
                  <View className="bg-white border border-gray-200 rounded-lg mx-3 w-16 h-12 justify-center">
                    <TextInput
                      className="text-gray-900 text-lg"
                      placeholder="3"
                      placeholderTextColor="#9ca3af"
                      value={intervalDays}
                      onChangeText={setIntervalDays}
                      keyboardType="numeric"
                      maxLength={2}
                      textAlign="center"
                      onFocus={() => {
                        setNewHabit({
                          ...newHabit,
                          frequency: "custom",
                          customFrequency: {
                            intervalDays: parseInt(intervalDays) || 3,
                          },
                        });
                      }}
                    />
                  </View>
                  <Text className="text-gray-900 text-lg">days</Text>
                </View>
              </TouchableOpacity>

              {/* X times per week */}
              <TouchableOpacity
                className="flex-row items-center mb-4"
                onPress={() =>
                  setNewHabit({
                    ...newHabit,
                    frequency: "custom",
                    customFrequency: {
                      timesPerWeek: parseInt(timesPerWeek) || 3,
                    },
                  })
                }
              >
                <View
                  className={`w-6 h-6 rounded-full border-2 items-center justify-center mr-4 ${
                    newHabit.frequency === "custom" &&
                    newHabit.customFrequency?.timesPerWeek
                      ? "border-blue-500 bg-blue-500"
                      : "border-gray-300"
                  }`}
                >
                  {newHabit.frequency === "custom" &&
                    newHabit.customFrequency?.timesPerWeek && (
                      <View className="w-2 h-2 bg-white rounded-full" />
                    )}
                </View>
                <View className="flex-row items-center flex-1">
                  <View className="bg-white border border-gray-200 rounded-lg mr-3 w-16 h-12 justify-center">
                    <TextInput
                      className="text-gray-900 text-lg"
                      placeholder="3"
                      placeholderTextColor="#9ca3af"
                      value={timesPerWeek}
                      onChangeText={setTimesPerWeek}
                      keyboardType="numeric"
                      maxLength={1}
                      textAlign="center"
                      onFocus={() => {
                        setNewHabit({
                          ...newHabit,
                          frequency: "custom",
                          customFrequency: {
                            timesPerWeek: parseInt(timesPerWeek) || 3,
                          },
                        });
                      }}
                    />
                  </View>
                  <Text className="text-gray-900 text-lg">times per week</Text>
                </View>
              </TouchableOpacity>

              {/* X times per month */}
              <TouchableOpacity
                className="flex-row items-center mb-4"
                onPress={() =>
                  setNewHabit({
                    ...newHabit,
                    frequency: "custom",
                    customFrequency: {
                      timesPerMonth: parseInt(timesPerMonth) || 10,
                    },
                  })
                }
              >
                <View
                  className={`w-6 h-6 rounded-full border-2 items-center justify-center mr-4 ${
                    newHabit.frequency === "custom" &&
                    newHabit.customFrequency?.timesPerMonth
                      ? "border-blue-500 bg-blue-500"
                      : "border-gray-300"
                  }`}
                >
                  {newHabit.frequency === "custom" &&
                    newHabit.customFrequency?.timesPerMonth && (
                      <View className="w-2 h-2 bg-white rounded-full" />
                    )}
                </View>
                <View className="flex-row items-center flex-1">
                  <View className="bg-white border border-gray-200 rounded-lg mr-3 w-16 h-12 justify-center">
                    <TextInput
                      className="text-gray-900 text-lg"
                      placeholder="10"
                      placeholderTextColor="#9ca3af"
                      value={timesPerMonth}
                      onChangeText={setTimesPerMonth}
                      keyboardType="numeric"
                      maxLength={2}
                      textAlign="center"
                      onFocus={() => {
                        setNewHabit({
                          ...newHabit,
                          frequency: "custom",
                          customFrequency: {
                            timesPerMonth: parseInt(timesPerMonth) || 10,
                          },
                        });
                      }}
                    />
                  </View>
                  <Text className="text-gray-900 text-lg">times per month</Text>
                </View>
              </TouchableOpacity>

              {/* X times in Y days */}
              <TouchableOpacity
                className="flex-row items-center mb-4"
                onPress={() =>
                  setNewHabit({
                    ...newHabit,
                    frequency: "custom",
                    customFrequency: {
                      timesInPeriod: parseInt(timesInPeriod) || 3,
                      periodDays: parseInt(periodDays) || 14,
                    },
                  })
                }
              >
                <View
                  className={`w-6 h-6 rounded-full border-2 items-center justify-center mr-4 ${
                    newHabit.frequency === "custom" &&
                    newHabit.customFrequency?.timesInPeriod
                      ? "border-blue-500 bg-blue-500"
                      : "border-gray-300"
                  }`}
                >
                  {newHabit.frequency === "custom" &&
                    newHabit.customFrequency?.timesInPeriod && (
                      <View className="w-2 h-2 bg-white rounded-full" />
                    )}
                </View>
                <View className="flex-row items-center flex-1 flex-wrap">
                  <View className="bg-white border border-gray-200 rounded-lg mr-3 w-16 h-12 justify-center">
                    <TextInput
                      className="text-gray-900 text-lg"
                      placeholder="3"
                      placeholderTextColor="#9ca3af"
                      value={timesInPeriod}
                      onChangeText={setTimesInPeriod}
                      keyboardType="numeric"
                      maxLength={2}
                      textAlign="center"
                      onFocus={() => {
                        setNewHabit({
                          ...newHabit,
                          frequency: "custom",
                          customFrequency: {
                            timesInPeriod: parseInt(timesInPeriod) || 3,
                            periodDays: parseInt(periodDays) || 14,
                          },
                        });
                      }}
                    />
                  </View>
                  <Text className="text-gray-900 text-lg mr-3">times in</Text>
                  <View className="bg-white border border-gray-200 rounded-lg mr-3 w-16 h-12 justify-center">
                    <TextInput
                      className="text-gray-900 text-lg"
                      placeholder="14"
                      placeholderTextColor="#9ca3af"
                      value={periodDays}
                      onChangeText={setPeriodDays}
                      keyboardType="numeric"
                      maxLength={2}
                      textAlign="center"
                      onFocus={() => {
                        setNewHabit({
                          ...newHabit,
                          frequency: "custom",
                          customFrequency: {
                            timesInPeriod: parseInt(timesInPeriod) || 3,
                            periodDays: parseInt(periodDays) || 14,
                          },
                        });
                      }}
                    />
                  </View>
                  <Text className="text-gray-900 text-lg">days</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Pledge Amount */}
            <View className="mb-6">
              <Text className="text-gray-900 text-lg font-semibold mb-3">
                Pledge Amount
              </Text>
              <View className="flex-row gap-3">
                {[1, 5, 10, 25].map((amount) => (
                  <TouchableOpacity
                    key={amount}
                    className={`flex-1 rounded-xl p-4 border-2 ${
                      newHabit.pledgeAmount === amount
                        ? "bg-gray-900 border-gray-900"
                        : "bg-white border-gray-200"
                    }`}
                    onPress={() =>
                      setNewHabit({ ...newHabit, pledgeAmount: amount })
                    }
                  >
                    <Text
                      className={`text-lg font-medium text-center ${
                        newHabit.pledgeAmount === amount
                          ? "text-white"
                          : "text-gray-900"
                      }`}
                    >
                      ${amount}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text className="text-gray-600 text-base mt-2">
                Amount charged when you miss this habit
              </Text>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

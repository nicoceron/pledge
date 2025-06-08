import React, { useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useHabits } from "../hooks/useHabits";
import { HabitCard } from "../components/HabitCard";
import { formatCurrency } from "../utils";
import { RootStackParamList } from "../types";

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
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50 px-8">
        <Ionicons name="hourglass" size={48} color="#6b7280" />
        <Text className="text-gray-800 text-xl font-medium mt-4">
          Loading your habits...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50 px-8">
        <Ionicons name="alert-circle" size={48} color="#ef4444" />
        <Text className="text-red-600 text-xl text-center mb-6 font-medium">
          {error}
        </Text>
        <TouchableOpacity
          className="bg-gray-900 px-8 py-4 rounded-lg"
          onPress={refresh}
        >
          <Text className="text-white text-lg font-semibold">Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refresh} />
        }
      >
        {/* Header Card */}
        <View className="bg-white mx-4 mt-6 rounded-2xl p-6 shadow-sm">
          <Text className="text-gray-600 text-lg font-medium mb-2">
            {getGreeting()}
          </Text>
          <Text className="text-gray-900 text-2xl font-bold mb-6">
            Your Daily Progress
          </Text>

          {pendingReasons.length > 0 && (
            <TouchableOpacity
              className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex-row items-center"
              onPress={handleShowPendingReasons}
            >
              <View className="bg-orange-500 rounded-full p-2 mr-4">
                <Ionicons name="chatbubble-ellipses" size={20} color="white" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-900 text-lg font-semibold">
                  {pendingReasons.length} habit
                  {pendingReasons.length > 1 ? "s" : ""} need attention
                </Text>
                <Text className="text-gray-600 text-base mt-1">
                  Share what happened - we're here to help
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#6b7280" />
            </TouchableOpacity>
          )}
        </View>

        {/* Stats Grid */}
        <View className="mx-4 mt-6">
          <View className="flex-row gap-3 mb-3">
            <View className="bg-white rounded-2xl p-6 flex-1 shadow-sm">
              <View className="bg-green-100 rounded-full w-12 h-12 items-center justify-center mb-4">
                <Ionicons name="checkmark" size={24} color="#059669" />
              </View>
              <Text className="text-green-600 text-3xl font-bold mb-1">
                {completedToday}
              </Text>
              <Text className="text-gray-600 text-base font-medium">
                Completed
              </Text>
            </View>
            <View className="bg-white rounded-2xl p-6 flex-1 shadow-sm">
              <View className="bg-orange-100 rounded-full w-12 h-12 items-center justify-center mb-4">
                <Ionicons name="time" size={24} color="#ea580c" />
              </View>
              <Text className="text-orange-600 text-3xl font-bold mb-1">
                {pendingToday}
              </Text>
              <Text className="text-gray-600 text-base font-medium">
                Pending
              </Text>
            </View>
          </View>
          <View className="flex-row gap-3">
            <View className="bg-white rounded-2xl p-6 flex-1 shadow-sm">
              <View className="bg-red-100 rounded-full w-12 h-12 items-center justify-center mb-4">
                <Ionicons name="close" size={24} color="#dc2626" />
              </View>
              <Text className="text-red-600 text-3xl font-bold mb-1">
                {missedToday}
              </Text>
              <Text className="text-gray-600 text-base font-medium">
                Missed
              </Text>
            </View>
            <View className="bg-white rounded-2xl p-6 flex-1 shadow-sm">
              <View className="bg-blue-100 rounded-full w-12 h-12 items-center justify-center mb-4">
                <Ionicons name="card" size={24} color="#2563eb" />
              </View>
              <Text className="text-blue-600 text-3xl font-bold mb-1">
                {formatCurrency(totalPledged)}
              </Text>
              <Text className="text-gray-600 text-base font-medium">
                Invested
              </Text>
            </View>
          </View>
        </View>

        {/* Today's Habits Section */}
        <View className="mt-8 mb-6">
          <View className="px-6 mb-4">
            <Text className="text-gray-900 text-2xl font-bold">
              {todaysHabits.length === 0 ? "All done today!" : "Today's Habits"}
            </Text>
            <Text className="text-gray-600 text-lg mt-1">
              {todaysHabits.length} habits to complete
            </Text>
          </View>

          <View className="px-4">
            {todaysHabits.length > 0 ? (
              todaysHabits.map((habit) => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  onComplete={completeHabit}
                  onMiss={markHabitMissed}
                />
              ))
            ) : (
              <View className="bg-white mx-2 rounded-2xl p-8 shadow-sm items-center">
                <View className="bg-green-100 rounded-full w-16 h-16 items-center justify-center mb-4">
                  <Ionicons name="trophy" size={32} color="#059669" />
                </View>
                <Text className="text-gray-900 text-xl font-bold mb-2">
                  Great work!
                </Text>
                <Text className="text-gray-600 text-lg text-center">
                  You've completed all your habits for today
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Quick Actions Section */}
        {activeHabits.length > 0 && (
          <View className="mt-6 mb-8">
            <View className="px-6 mb-4">
              <Text className="text-gray-900 text-2xl font-bold">
                All Habits
              </Text>
              <Text className="text-gray-600 text-lg mt-1">
                {activeHabits.length} active habits
              </Text>
            </View>

            <TouchableOpacity
              className="bg-white mx-4 rounded-2xl p-6 shadow-sm flex-row items-center"
              onPress={() => navigation.navigate("Tabs")}
            >
              <View className="bg-gray-100 rounded-full w-12 h-12 items-center justify-center mr-4">
                <Ionicons name="list" size={24} color="#374151" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-900 text-lg font-semibold">
                  Manage Habits
                </Text>
                <Text className="text-gray-600 text-base mt-1">
                  View and edit all your habits
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useNavigationState } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHabits } from "../hooks/useHabits";
import { RootStackParamList } from "../types";
import Calendar from "../components/Calendar";

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList>;
// Set today to 00:00:00
const today = new Date();
today.setHours(0, 0, 0, 0);

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const navigationState = useNavigationState((state) => state);
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const { habits, pendingReasons, completeHabit, getActiveHabits } =
    useHabits();
  const insets = useSafeAreaInsets();

  // Check for pending reasons on component mount
  useEffect(() => {
    if (pendingReasons.length > 0 && navigation && navigationState) {
      const timer = setTimeout(() => {
        try {
          navigation.navigate("PendingReasons", { pendingReasons });
        } catch (error) {
          console.log("Navigation not ready yet:", error);
        }
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [pendingReasons, navigation, navigationState]);

  // Custom function to get habits for any date
  const getHabitsForDate = (date: Date) => {
    const activeHabits = getActiveHabits();
    return activeHabits.filter((habit) => {
      switch (habit.frequency) {
        case "daily":
          return true;
        case "weekly":
          const createdDay = habit.createdAt.getDay();
          return date.getDay() === createdDay;
        case "monthly":
          const createdDate = habit.createdAt.getDate();
          return date.getDate() === createdDate;
        case "custom":
          if (habit.customFrequency?.daysOfWeek) {
            return habit.customFrequency.daysOfWeek.includes(date.getDay());
          }
          return false;
        default:
          return false;
      }
    });
  };

  const selectedDateHabits = getHabitsForDate(selectedDate);

  const isSelectedDateToday =
    selectedDate.toDateString() === today.toDateString();

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <ScrollView className="flex-1">
        {/* Calendar */}
        <Calendar date={selectedDate} onChange={setSelectedDate} />

        {/* Focus Message */}
        <View className="mb-12 px-6">
          <Text className="text-center text-gray-600 text-base leading-relaxed">
            Focus on the 3 most important habits to accomplish{"\n"}
            {isSelectedDateToday ? "today" : "this day"}.
          </Text>
        </View>

        {/* Today Section */}
        <View className="mb-12 px-6">
          <Text className="text-3xl font-bold text-gray-900 mb-8">
            {isSelectedDateToday ? "Today" : "Habits"}
          </Text>

          {/* Habits List - Show only existing habits, limit to 3 */}
          <View className="space-y-6">
            {selectedDateHabits && selectedDateHabits.length > 0 ? (
              selectedDateHabits.slice(0, 3).map((habit) => {
                const dateStr = selectedDate.toISOString().split("T")[0];
                const isCompleted = habit.completedDates.includes(dateStr);
                const isMissed = habit.missedDates.includes(dateStr);
                const completionTime = habit.lastCompleted
                  ? (() => {
                      const completedDate = new Date(habit.lastCompleted);
                      const completedStr = completedDate
                        .toISOString()
                        .split("T")[0];
                      if (completedStr === dateStr) {
                        return completedDate.toLocaleTimeString([], {
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true,
                        });
                      }
                      return null;
                    })()
                  : null;

                return (
                  <TouchableOpacity
                    key={habit.id}
                    className="flex-row items-center py-4"
                    onPress={() => {
                      if (isSelectedDateToday && !isCompleted && !isMissed) {
                        completeHabit(habit.id);
                      }
                    }}
                  >
                    <View
                      className={`w-12 h-12 rounded-lg mr-4 items-center justify-center ${
                        isCompleted
                          ? "bg-red-500"
                          : isMissed
                          ? "bg-gray-400"
                          : "bg-gray-100"
                      }`}
                    >
                      {isCompleted ? (
                        <Ionicons name="checkmark" size={24} color="white" />
                      ) : isMissed ? (
                        <Ionicons name="close" size={24} color="white" />
                      ) : (
                        <View className="w-6 h-6 border-2 border-gray-400 rounded" />
                      )}
                    </View>

                    <View className="flex-1">
                      <Text
                        className={`text-xl ${
                          isCompleted
                            ? "text-red-500 font-medium"
                            : isMissed
                            ? "text-gray-500 line-through"
                            : "text-gray-900"
                        }`}
                      >
                        {habit.title}
                      </Text>
                      {completionTime && (
                        <Text className="text-red-400 text-sm mt-1">
                          {completionTime}
                        </Text>
                      )}
                      {isMissed && (
                        <Text className="text-gray-400 text-sm mt-1">
                          Missed
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })
            ) : (
              <View className="py-8 items-center">
                <Text className="text-gray-500 text-lg">
                  No habits for today
                </Text>
                <Text className="text-gray-400 text-sm mt-2">
                  Go to Habits tab to add some
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Bottom Message - Only show if there are more than 3 habits */}
        {selectedDateHabits.length > 3 && (
          <View className="items-center pb-12 px-6">
            <View className="w-16 h-px bg-gray-300 mb-6" />
            <Text className="text-center text-gray-500 text-sm leading-relaxed max-w-xs">
              Every other habit stays in your list. Tackle your top 3 habits
              before working on any of these.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

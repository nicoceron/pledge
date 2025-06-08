import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { PendingReason, RootStackParamList, MissReason } from "../types";
import { useHabits } from "../hooks/useHabits";
import { formatCurrency, formatDate } from "../utils";

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
    <View className="flex-1 bg-navy-50">
      {/* Header */}
      <View className="bg-navy-800 pt-4 pb-8 px-6">
        <View className="items-center">
          <Ionicons name="heart" size={48} color="white" />
          <Text className="text-white text-2xl font-bold mt-4 mb-2 text-center">
            We're Here to Listen 💙
          </Text>
          <Text className="text-navy-200 text-base text-center leading-6">
            Help us understand your journey so we can support you better - no
            judgment, just understanding
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Info Card */}
        <View className="bg-white mx-4 mt-4 rounded-2xl border border-navy-100 overflow-hidden">
          <View className="bg-pastel-info p-4 flex-row items-center">
            <Ionicons
              name="information-circle"
              size={24}
              className="text-blue-600 mr-3"
            />
            <Text className="text-blue-800 text-lg font-bold">
              Why We Ask 🤗
            </Text>
          </View>
          <View className="p-4">
            <Text className="text-navy-600 text-base leading-6">
              Understanding what makes habits challenging helps us provide
              better support and insights for your journey. Your gentle
              accountability pledge will still be processed, but sharing helps
              us learn together! 💪
            </Text>
          </View>
        </View>

        {/* Pending Reasons List */}
        {pendingReasons.map((pending, index) => {
          const habit = habits.find((h) => h.id === pending.habitId);
          return (
            <View
              key={`${pending.habitId}-${pending.date}`}
              className="bg-white mx-4 mt-4 rounded-2xl p-4 border border-navy-100"
            >
              <View className="flex-row justify-between items-start mb-3">
                <Text className="text-navy-900 text-lg font-bold flex-1 mr-3">
                  {pending.habitTitle}
                </Text>
                <View className="bg-pastel-warning rounded-full px-3 py-1">
                  <Text className="text-yellow-700 text-xs font-semibold">
                    Pending
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center mb-3">
                <Ionicons
                  name="calendar"
                  size={16}
                  className="text-navy-500 mr-2"
                />
                <Text className="text-navy-600 text-sm">
                  {formatDate(new Date(pending.date))}
                </Text>
              </View>

              {habit && (
                <View className="flex-row items-center mb-4">
                  <Ionicons
                    name="card"
                    size={16}
                    className="text-navy-500 mr-2"
                  />
                  <Text className="text-navy-600 text-sm">
                    Pledge: {formatCurrency(habit.pledgeAmount)}
                  </Text>
                </View>
              )}

              <TouchableOpacity
                className="bg-navy-600 rounded-xl p-4 flex-row items-center justify-center"
                onPress={() => handleProvideReason(pending)}
              >
                <Ionicons name="chatbubble-ellipses" size={20} color="white" />
                <Text className="text-white text-base font-semibold ml-2">
                  💭 Share What Happened
                </Text>
              </TouchableOpacity>
            </View>
          );
        })}

        {/* Skip All Button */}
        <View className="px-4 mt-6 mb-8">
          <TouchableOpacity
            className="bg-navy-200 rounded-xl p-4 items-center"
            onPress={handleSkipAll}
          >
            <Text className="text-navy-700 text-base font-medium">
              ⏸️ I'll share these later
            </Text>
          </TouchableOpacity>
        </View>

        <View className="h-20" />
      </ScrollView>
    </View>
  );
};

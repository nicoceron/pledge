import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { StorageService } from "../services/storage";
import { useHabits } from "../hooks/useHabits";
import { User } from "../types";
import { formatCurrency, formatDate, generateId } from "../utils";

export const SettingsScreen: React.FC = () => {
  const { habits, getTotalPledgedAmount } = useHabits();
  const [user, setUser] = useState<User | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
  });

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const savedUser = await StorageService.getUser();
    if (savedUser) {
      setUser(savedUser);
      setProfileForm({
        name: savedUser.name,
        email: savedUser.email,
      });
    } else {
      // Create default user if none exists
      const defaultUser: User = {
        id: generateId(),
        name: "Pledge User",
        email: "",
        totalPledged: 0,
        totalCharged: 0,
        activeHabits: 0,
        joinedAt: new Date(),
        lastAppOpen: new Date(),
      };
      await StorageService.saveUser(defaultUser);
      setUser(defaultUser);
      setProfileForm({
        name: defaultUser.name,
        email: defaultUser.email,
      });
    }
  };

  const updateUserStats = async () => {
    if (!user) return;

    const activeHabits = habits.filter((h) => h.isActive).length;
    const totalPledged = getTotalPledgedAmount();

    const updatedUser: User = {
      ...user,
      activeHabits,
      totalPledged,
      totalCharged: totalPledged, // For simplicity, assuming all pledged amounts are charged
    };

    await StorageService.saveUser(updatedUser);
    setUser(updatedUser);
  };

  const handleUpdateProfile = async () => {
    if (!user) return;

    if (!profileForm.name.trim()) {
      Alert.alert("Error", "Please enter your name");
      return;
    }

    const updatedUser: User = {
      ...user,
      name: profileForm.name.trim(),
      email: profileForm.email.trim(),
    };

    await StorageService.saveUser(updatedUser);
    setUser(updatedUser);
    setShowProfileModal(false);
    Alert.alert("Success", "Profile updated successfully");
  };

  const handleClearAllData = () => {
    Alert.alert(
      "Clear All Data",
      "This will permanently delete all your habits, progress, and settings. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear Everything",
          style: "destructive",
          onPress: async () => {
            try {
              await StorageService.clearAllData();
              Alert.alert("Success", "All data has been cleared");
              // Reload the app state
              loadUser();
            } catch (error) {
              Alert.alert("Error", "Failed to clear data");
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    updateUserStats();
  }, [habits]);

  const SettingItem = ({
    icon,
    title,
    subtitle,
    onPress,
    rightElement,
    iconBgColor = "bg-navy-500",
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    rightElement?: React.ReactNode;
    iconBgColor?: string;
  }) => (
    <TouchableOpacity
      className="bg-white rounded-xl p-4 flex-row items-center justify-between border border-navy-100 mb-3"
      onPress={onPress}
      disabled={!onPress}
    >
      <View className="flex-row items-center flex-1">
        <View
          className={`w-10 h-10 rounded-full ${iconBgColor} items-center justify-center mr-3`}
        >
          <Ionicons name={icon} size={20} color="white" />
        </View>
        <View className="flex-1">
          <Text className="text-navy-900 text-base font-medium">{title}</Text>
          {subtitle && (
            <Text className="text-navy-600 text-sm mt-1">{subtitle}</Text>
          )}
        </View>
      </View>
      {rightElement ||
        (onPress && (
          <Ionicons
            name="chevron-forward"
            size={20}
            className="text-navy-400"
          />
        ))}
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-navy-50">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View className="bg-navy-800 pt-12 pb-8 px-6">
          <View className="items-center">
            <View className="w-20 h-20 bg-white rounded-full items-center justify-center mb-4">
              <Text className="text-navy-800 text-2xl font-bold">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </Text>
            </View>
            <Text className="text-white text-xl font-bold mb-1">
              {user?.name || "Pledge User"}
            </Text>
            <Text className="text-navy-200 text-base mb-1">
              {user?.email || "No email set"}
            </Text>
            <Text className="text-navy-300 text-sm">
              Member since {user ? formatDate(user.joinedAt) : "Unknown"}
            </Text>
          </View>
        </View>

        {/* Stats Overview */}
        <View className="bg-white mx-4 mt-4 rounded-2xl p-4 border border-navy-100">
          <View className="flex-row justify-around">
            <View className="items-center">
              <Text className="text-navy-900 text-2xl font-bold">
                {user?.activeHabits || 0}
              </Text>
              <Text className="text-navy-600 text-sm">Active Habits</Text>
            </View>
            <View className="items-center">
              <Text className="text-navy-900 text-2xl font-bold">
                {formatCurrency(user?.totalCharged || 0)}
              </Text>
              <Text className="text-navy-600 text-sm">Total Charged</Text>
            </View>
            <View className="items-center">
              <Text className="text-navy-900 text-2xl font-bold">
                {habits.reduce((sum, h) => sum + h.streak, 0)}
              </Text>
              <Text className="text-navy-600 text-sm">Total Streaks</Text>
            </View>
          </View>
        </View>

        {/* Settings Sections */}
        <View className="px-4 mt-6">
          {/* Account Section */}
          <Text className="text-navy-900 text-lg font-bold mb-3">Account</Text>

          <SettingItem
            icon="person"
            title="Edit Profile"
            subtitle="Update your name and email"
            onPress={() => setShowProfileModal(true)}
            iconBgColor="bg-blue-500"
          />

          <SettingItem
            icon="notifications"
            title="Notifications"
            subtitle="Manage your notification preferences"
            onPress={() =>
              Alert.alert(
                "Coming Soon",
                "Notification settings will be available in a future update"
              )
            }
            iconBgColor="bg-green-500"
          />

          {/* Data Section */}
          <Text className="text-navy-900 text-lg font-bold mb-3 mt-6">
            Data & Privacy
          </Text>

          <SettingItem
            icon="download"
            title="Export Data"
            subtitle="Download your habit data"
            onPress={() =>
              Alert.alert(
                "Coming Soon",
                "Data export will be available in a future update"
              )
            }
            iconBgColor="bg-purple-500"
          />

          <SettingItem
            icon="trash"
            title="Clear All Data"
            subtitle="Permanently delete all your data"
            onPress={handleClearAllData}
            iconBgColor="bg-red-500"
          />

          {/* Support Section */}
          <Text className="text-navy-900 text-lg font-bold mb-3 mt-6">
            Support
          </Text>

          <SettingItem
            icon="help-circle"
            title="Help & FAQ"
            subtitle="Get help with using Pledge"
            onPress={() =>
              Alert.alert(
                "Coming Soon",
                "Help section will be available in a future update"
              )
            }
            iconBgColor="bg-orange-500"
          />

          <SettingItem
            icon="mail"
            title="Contact Support"
            subtitle="Get in touch with our team"
            onPress={() =>
              Alert.alert(
                "Coming Soon",
                "Contact support will be available in a future update"
              )
            }
            iconBgColor="bg-teal-500"
          />

          {/* About Section */}
          <Text className="text-navy-900 text-lg font-bold mb-3 mt-6">
            About
          </Text>

          <SettingItem
            icon="information-circle"
            title="App Version"
            subtitle="1.0.0"
            iconBgColor="bg-gray-500"
          />

          <SettingItem
            icon="heart"
            title="Rate Pledge"
            subtitle="Help us improve by leaving a review"
            onPress={() =>
              Alert.alert(
                "Thank You!",
                "Rating feature will be available when published to app stores"
              )
            }
            iconBgColor="bg-pink-500"
          />
        </View>

        <View className="h-20" />
      </ScrollView>

      {/* Profile Edit Modal */}
      <Modal
        visible={showProfileModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View className="flex-1 bg-navy-50">
          {/* Modal Header */}
          <View className="bg-white border-b border-navy-100 px-6 py-4 pt-12">
            <View className="flex-row justify-between items-center">
              <TouchableOpacity onPress={() => setShowProfileModal(false)}>
                <Text className="text-navy-600 text-base font-medium">
                  Cancel
                </Text>
              </TouchableOpacity>
              <Text className="text-navy-900 text-lg font-bold">
                Edit Profile
              </Text>
              <TouchableOpacity onPress={handleUpdateProfile}>
                <Text className="text-navy-600 text-base font-semibold">
                  Save
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView className="flex-1 p-6">
            {/* Name Field */}
            <View className="mb-6">
              <Text className="text-navy-900 text-base font-semibold mb-2">
                Name *
              </Text>
              <TextInput
                className="bg-white border border-navy-200 rounded-xl px-4 py-3 text-navy-900 text-base"
                placeholder="Enter your name"
                placeholderTextColor="#9fb3c8"
                value={profileForm.name}
                onChangeText={(text) =>
                  setProfileForm({ ...profileForm, name: text })
                }
              />
            </View>

            {/* Email Field */}
            <View className="mb-6">
              <Text className="text-navy-900 text-base font-semibold mb-2">
                Email (Optional)
              </Text>
              <TextInput
                className="bg-white border border-navy-200 rounded-xl px-4 py-3 text-navy-900 text-base"
                placeholder="Enter your email"
                placeholderTextColor="#9fb3c8"
                value={profileForm.email}
                onChangeText={(text) =>
                  setProfileForm({ ...profileForm, email: text })
                }
                keyboardType="email-address"
                autoCapitalize="none"
              />
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
                    Privacy Note
                  </Text>
                  <Text className="text-blue-700 text-sm leading-5">
                    Your information is stored locally on your device and is
                    never shared with third parties.
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

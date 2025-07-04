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
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const SettingsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { habits, getTotalPledged } = useHabits();
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
    const totalPledged = getTotalPledged();

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
    iconBgColor = "bg-gray-500",
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    rightElement?: React.ReactNode;
    iconBgColor?: string;
  }) => (
    <TouchableOpacity
      className="bg-white rounded-xl p-4 flex-row items-center justify-between border border-gray-200 mb-3"
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
          <Text className="text-gray-900 text-base font-medium">{title}</Text>
          {subtitle && (
            <Text className="text-gray-600 text-sm mt-1">{subtitle}</Text>
          )}
        </View>
      </View>
      {rightElement ||
        (onPress && (
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        ))}
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View className="pt-12 pb-8 px-6">
          <View className="items-center">
            <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
              <Text className="text-gray-700 text-2xl font-bold">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </Text>
            </View>
            <Text className="text-gray-900 text-2xl font-bold mb-1">
              {user?.name || "Pledge User"}
            </Text>
            <Text className="text-gray-600 text-base mb-1">
              {user?.email || "No email set"}
            </Text>
            <Text className="text-gray-500 text-sm">
              Member since {user ? formatDate(user.joinedAt) : "Unknown"}
            </Text>
          </View>
        </View>

        {/* Stats Overview */}
        <View className="bg-gray-50 mx-6 rounded-2xl p-4 border border-gray-200 mb-6">
          <View className="flex-row justify-around">
            <View className="items-center">
              <Text className="text-gray-900 text-2xl font-bold">
                {user?.activeHabits || 0}
              </Text>
              <Text className="text-gray-600 text-sm">Active Habits</Text>
            </View>
            <View className="items-center">
              <Text className="text-gray-900 text-2xl font-bold">
                {formatCurrency(user?.totalPledged || 0)}
              </Text>
              <Text className="text-gray-600 text-sm">Total Pledged</Text>
            </View>
            <View className="items-center">
              <Text className="text-gray-900 text-2xl font-bold">
                {formatCurrency(user?.totalCharged || 0)}
              </Text>
              <Text className="text-gray-600 text-sm">Total Charged</Text>
            </View>
          </View>
        </View>

        {/* Profile Section */}
        <View className="px-6">
          <Text className="text-gray-900 text-xl font-bold mb-4">Profile</Text>
          <SettingItem
            icon="person"
            title="Edit Profile"
            subtitle="Update your name and email"
            onPress={() => setShowProfileModal(true)}
            iconBgColor="bg-blue-500"
          />
        </View>

        {/* App Section */}
        <View className="px-6 mt-6">
          <Text className="text-gray-900 text-xl font-bold mb-4">App</Text>
          <SettingItem
            icon="notifications"
            title="Notifications"
            subtitle="Manage your reminder preferences"
            iconBgColor="bg-green-500"
          />
          <SettingItem
            icon="shield-checkmark"
            title="Privacy"
            subtitle="Data and privacy settings"
            iconBgColor="bg-purple-500"
          />
          <SettingItem
            icon="help-circle"
            title="Help & Support"
            subtitle="Get help and contact support"
            iconBgColor="bg-orange-500"
          />
        </View>

        {/* Data Section */}
        <View className="px-6 mt-6">
          <Text className="text-gray-900 text-xl font-bold mb-4">Data</Text>
          <SettingItem
            icon="download"
            title="Export Data"
            subtitle="Download your habit data"
            iconBgColor="bg-indigo-500"
          />
          <SettingItem
            icon="trash"
            title="Clear All Data"
            subtitle="Permanently delete all your data"
            onPress={handleClearAllData}
            iconBgColor="bg-red-500"
          />
        </View>

        {/* App Info */}
        <View className="px-6 mt-8 mb-12">
          <Text className="text-gray-500 text-sm text-center">
            Pledge Habit Accountability
          </Text>
          <Text className="text-gray-500 text-sm text-center">
            Version 1.0.0
          </Text>
        </View>
      </ScrollView>

      {/* Profile Modal */}
      <Modal
        visible={showProfileModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View className="flex-1 bg-white">
          {/* Modal Header */}
          <View className="bg-white px-6 py-4 pt-12 border-b border-gray-200">
            <View className="flex-row justify-between items-center">
              <TouchableOpacity onPress={() => setShowProfileModal(false)}>
                <Text className="text-gray-600 text-lg font-medium">
                  Cancel
                </Text>
              </TouchableOpacity>
              <Text className="text-gray-900 text-xl font-bold">
                Edit Profile
              </Text>
              <TouchableOpacity onPress={handleUpdateProfile}>
                <Text className="text-gray-900 text-lg font-semibold">
                  Save
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView className="flex-1 p-6">
            {/* Name Field */}
            <View className="mb-6">
              <Text className="text-gray-900 text-lg font-semibold mb-3">
                Name
              </Text>
              <View className="bg-gray-50 border border-gray-200 rounded-xl h-14 justify-center">
                <TextInput
                  className="px-4 text-gray-900 text-lg"
                  placeholder="Enter your name"
                  placeholderTextColor="#6b7280"
                  value={profileForm.name}
                  onChangeText={(text) =>
                    setProfileForm({ ...profileForm, name: text })
                  }
                  style={{ height: 56, fontSize: 18 }}
                />
              </View>
            </View>

            {/* Email Field */}
            <View className="mb-6">
              <Text className="text-gray-900 text-lg font-semibold mb-3">
                Email
              </Text>
              <View className="bg-gray-50 border border-gray-200 rounded-xl h-14 justify-center">
                <TextInput
                  className="px-4 text-gray-900 text-lg"
                  placeholder="Enter your email"
                  placeholderTextColor="#6b7280"
                  value={profileForm.email}
                  onChangeText={(text) =>
                    setProfileForm({ ...profileForm, email: text })
                  }
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={{ height: 56, fontSize: 18 }}
                />
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

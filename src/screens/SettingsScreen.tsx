import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
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
    color = "#6B7280",
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    rightElement?: React.ReactNode;
    color?: string;
  }) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingLeft}>
        <View style={[styles.settingIcon, { backgroundColor: color }]}>
          <Ionicons name={icon} size={20} color="white" />
        </View>
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {rightElement ||
        (onPress && (
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        ))}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <LinearGradient
          colors={["#4F46E5", "#7C3AED"]}
          style={styles.profileHeader}
        >
          <View style={styles.profileInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </Text>
            </View>
            <Text style={styles.profileName}>
              {user?.name || "Pledge User"}
            </Text>
            <Text style={styles.profileEmail}>
              {user?.email || "No email set"}
            </Text>
            <Text style={styles.profileJoined}>
              Member since {user ? formatDate(user.joinedAt) : "Unknown"}
            </Text>
          </View>
        </LinearGradient>

        {/* Stats Overview */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user?.activeHabits || 0}</Text>
            <Text style={styles.statLabel}>Active Habits</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {formatCurrency(user?.totalCharged || 0)}
            </Text>
            <Text style={styles.statLabel}>Total Charged</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {habits.reduce((sum, h) => sum + h.completedDates.length, 0)}
            </Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
        </View>

        {/* Profile Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile</Text>
          <View style={styles.settingsGroup}>
            <SettingItem
              icon="person"
              title="Edit Profile"
              subtitle="Update your name and email"
              onPress={() => setShowProfileModal(true)}
              color="#4F46E5"
            />
          </View>
        </View>

        {/* App Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Settings</Text>
          <View style={styles.settingsGroup}>
            <SettingItem
              icon="notifications"
              title="Notifications"
              subtitle="Manage habit reminders"
              rightElement={<Text style={styles.comingSoon}>Coming Soon</Text>}
              color="#F59E0B"
            />

            <SettingItem
              icon="card"
              title="Payment Methods"
              subtitle="Manage your payment settings"
              rightElement={<Text style={styles.comingSoon}>Coming Soon</Text>}
              color="#10B981"
            />

            <SettingItem
              icon="shield-checkmark"
              title="Privacy & Security"
              subtitle="Manage your data and privacy"
              rightElement={<Text style={styles.comingSoon}>Coming Soon</Text>}
              color="#8B5CF6"
            />
          </View>
        </View>

        {/* Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.settingsGroup}>
            <SettingItem
              icon="help-circle"
              title="Help & FAQ"
              subtitle="Get help with using Pledge"
              rightElement={<Text style={styles.comingSoon}>Coming Soon</Text>}
              color="#3B82F6"
            />

            <SettingItem
              icon="mail"
              title="Contact Support"
              subtitle="Get in touch with our team"
              rightElement={<Text style={styles.comingSoon}>Coming Soon</Text>}
              color="#06B6D4"
            />
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Danger Zone</Text>
          <View style={styles.settingsGroup}>
            <SettingItem
              icon="trash"
              title="Clear All Data"
              subtitle="Permanently delete all your data"
              onPress={handleClearAllData}
              color="#EF4444"
            />
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Profile Edit Modal */}
      <Modal
        visible={showProfileModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setShowProfileModal(false)}
              style={styles.modalCloseButton}
            >
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <TouchableOpacity
              onPress={handleUpdateProfile}
              style={styles.modalSaveButton}
            >
              <Text style={styles.modalSaveText}>Save</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Name</Text>
              <TextInput
                style={styles.textInput}
                value={profileForm.name}
                onChangeText={(text) =>
                  setProfileForm({ ...profileForm, name: text })
                }
                placeholder="Enter your name"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email (Optional)</Text>
              <TextInput
                style={styles.textInput}
                value={profileForm.email}
                onChangeText={(text) =>
                  setProfileForm({ ...profileForm, email: text })
                }
                placeholder="Enter your email"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>
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
  profileHeader: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  profileInfo: {
    alignItems: "center",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "700",
    color: "white",
  },
  profileName: {
    fontSize: 24,
    fontWeight: "700",
    color: "white",
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 8,
  },
  profileJoined: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: "white",
    marginTop: -20,
    marginHorizontal: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
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
  settingsGroup: {
    backgroundColor: "white",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
  comingSoon: {
    fontSize: 12,
    color: "#9CA3AF",
    fontStyle: "italic",
  },
  bottomSpacing: {
    height: 40,
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
});

import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { TabParamList } from "../types";

// Import screens (we'll create these next)
import { HomeScreen } from "../screens/HomeScreen";
import { HabitsScreen } from "../screens/HabitsScreen";
import { AnalyticsScreen } from "../screens/AnalyticsScreen";
import { SettingsScreen } from "../screens/SettingsScreen";

const Tab = createBottomTabNavigator<TabParamList>();

export const TabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case "Home":
              iconName = focused ? "home" : "home-outline";
              break;
            case "Habits":
              iconName = focused ? "list" : "list-outline";
              break;
            case "Analytics":
              iconName = focused ? "bar-chart" : "bar-chart-outline";
              break;
            case "Settings":
              iconName = focused ? "settings" : "settings-outline";
              break;
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#4F46E5",
        tabBarInactiveTintColor: "#9CA3AF",
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopColor: "#E5E7EB",
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 88,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
        headerStyle: {
          backgroundColor: "#4F46E5",
          shadowColor: "transparent",
          elevation: 0,
        },
        headerTintColor: "#FFFFFF",
        headerTitleStyle: {
          fontWeight: "700",
          fontSize: 18,
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: "Today",
          headerTitle: "Pledge - Today's Habits",
        }}
      />
      <Tab.Screen
        name="Habits"
        component={HabitsScreen}
        options={{
          title: "Habits",
          headerTitle: "My Habits",
        }}
      />
      <Tab.Screen
        name="Analytics"
        component={AnalyticsScreen}
        options={{
          title: "Analytics",
          headerTitle: "Analytics",
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: "Settings",
          headerTitle: "Settings",
        }}
      />
    </Tab.Navigator>
  );
};

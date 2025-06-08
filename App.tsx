import "./global.css";
import React from "react";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { AppNavigator } from "./src/navigation/AppNavigator";

export default function App() {
  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="auto" />
      <AppNavigator />
    </View>
  );
}

import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { TabNavigator } from "./TabNavigator";
import { RootStackParamList } from "../types";
import { useHabits } from "../hooks/useHabits";
import { PendingReasonsScreen } from "../screens/PendingReasonsScreen";
import { theme } from "../utils/theme";

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  const { pendingReasons } = useHabits();

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Tabs"
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen name="Tabs" component={TabNavigator} />
        <Stack.Screen
          name="PendingReasons"
          component={PendingReasonsScreen}
          options={{
            headerShown: true,
            title: "💭 Share What Happened",
            headerStyle: {
              backgroundColor: theme.colors.primary.main,
            },
            headerTintColor: theme.colors.text.inverse,
            headerTitleStyle: {
              fontWeight: theme.typography.weight.bold as any,
            },
            presentation: "modal",
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

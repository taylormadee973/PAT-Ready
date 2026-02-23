import { Tabs } from "expo-router";
import React from "react";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,

     
        tabBarIcon: () => null,

        tabBarShowLabel: true,

        tabBarActiveTintColor: "#0B3A53",
        tabBarInactiveTintColor: "#999",

        tabBarLabelStyle: {
          fontSize: 13,
          fontWeight: "600",
        },

      
        tabBarStyle: {
          height: 90,
          paddingTop: 10,
          paddingBottom: 25,
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Dashboard",
        }}
      />

      <Tabs.Screen
        name="plan"
        options={{
          title: "Plan",
        }}
      />

      <Tabs.Screen
        name="progress"
        options={{
          title: "Progress",
        }}
      />
    </Tabs>
  );
}
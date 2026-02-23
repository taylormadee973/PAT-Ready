import { Stack } from "expo-router";
import React from "react";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="welcome" />
      <Stack.Screen name="baseline" />
      <Stack.Screen name="testdate" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
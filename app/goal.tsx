import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import React, { useCallback, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { getAppData, updateAppData } from "./lib/storage";

export default function Goal() {
  const [goalMileTime, setGoalMileTime] = useState("");
  const [goalPushUps, setGoalPushUps] = useState("");
  const [goalSitUps, setGoalSitUps] = useState("");

  // Load previously saved goals when entering this screen
  useFocusEffect(
    useCallback(() => {
      let alive = true;
      (async () => {
        const data = await getAppData();
        if (!alive) return;

        setGoalMileTime(data.goals?.mileTime ?? "");
        setGoalPushUps(data.goals?.pushUps ?? "");
        setGoalSitUps(data.goals?.sitUps ?? "");
      })();

      return () => {
        alive = false;
      };
    }, [])
  );

  const canContinue =
    goalMileTime.trim() !== "" || goalPushUps.trim() !== "" || goalSitUps.trim() !== "";

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Goal</Text>
      <Text style={styles.subtitle}>Set your target standards for test day.</Text>

      <Text style={styles.label}>Goal 1.5 Mile Time</Text>
      <TextInput
        style={styles.input}
        placeholder="mm:ss"
        placeholderTextColor="#6B7280"
        value={goalMileTime}
        onChangeText={setGoalMileTime}
        keyboardType="numbers-and-punctuation"
      />

      <Text style={styles.label}>Goal Push-ups</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter reps"
        placeholderTextColor="#6B7280"
        value={goalPushUps}
        onChangeText={setGoalPushUps}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Goal Sit-ups</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter reps"
        placeholderTextColor="#6B7280"
        value={goalSitUps}
        onChangeText={setGoalSitUps}
        keyboardType="numeric"
      />

      <Pressable
        style={[styles.button, !canContinue && { opacity: 0.4 }]}
        disabled={!canContinue}
        onPress={async () => {
          await updateAppData({
            goals: {
              mileTime: goalMileTime,
              pushUps: goalPushUps,
              sitUps: goalSitUps,
            },
          });
          router.push("/testdate");
        }}
      >
        <Text style={styles.buttonText}>Continue</Text>
      </Pressable>

      <Pressable onPress={() => router.back()}>
        <Text style={styles.back}>Back</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white", padding: 24 },
  title: { marginTop: 70, fontSize: 32, fontWeight: "700" },
  subtitle: { marginTop: 10, fontSize: 16, color: "#444" },
  label: { marginTop: 20, fontSize: 14, fontWeight: "600" },
  input: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#E6E6E6",
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: "#111",
  },
  button: {
    marginTop: 40,
    backgroundColor: "#0B3A53",
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: "center",
  },
  buttonText: { color: "white", fontSize: 18, fontWeight: "700" },
  back: {
    marginTop: 20,
    textAlign: "center",
    color: "#0B3A53",
    fontWeight: "600",
  },
});
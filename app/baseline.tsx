import { router } from "expo-router";
import React, { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { updateAppData } from "./lib/storage";

export default function Baseline() {
  const [mileTime, setMileTime] = useState("");
  const [pushUps, setPushUps] = useState("");
  const [sitUps, setSitUps] = useState("");

  const canContinue =
    mileTime.trim() !== "" || pushUps.trim() !== "" || sitUps.trim() !== "";

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Baseline</Text>

      <Text style={styles.label}>1.5 Mile Time</Text>
      <TextInput
        style={styles.input}
        placeholder="10:45"
        placeholderTextColor="#6B7280"
        value={mileTime}
        onChangeText={setMileTime}
        keyboardType="numbers-and-punctuation"
      />

      <Text style={styles.label}>Push-ups</Text>
      <TextInput
        style={styles.input}
        placeholder="25"
        placeholderTextColor="#6B7280"
        value={pushUps}
        onChangeText={setPushUps}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Sit-ups</Text>
      <TextInput
        style={styles.input}
        placeholder="30"
        placeholderTextColor="#6B7280"
        value={sitUps}
        onChangeText={setSitUps}
        keyboardType="numeric"
      />

      <Pressable
        style={[styles.button, !canContinue && { opacity: 0.4 }]}
        disabled={!canContinue}
        onPress={async () => {
          await updateAppData({
            baseline: { mileTime, pushUps, sitUps },
          });
          router.push("/goal");
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
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { updateAppData } from "./lib/storage";

function parseMMDDYYYY(input: string): Date | null {
  const m = input.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return null;

  const month = Number(m[1]);
  const day = Number(m[2]);
  const year = Number(m[3]);

  const d = new Date(year, month - 1, day);

  // Prevent rollover like 02/31 -> Mar 2
  if (
    d.getFullYear() !== year ||
    d.getMonth() !== month - 1 ||
    d.getDate() !== day
  ) {
    return null;
  }

  return d;
}

function daysUntil(target: Date) {
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const end = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  const diffMs = end.getTime() - start.getTime();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

export default function TestDate() {
  const [dateText, setDateText] = useState("");

  const parsed = useMemo(() => parseMMDDYYYY(dateText), [dateText]);
  const canContinue = !!parsed;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Your Test Date</Text>

      <Text style={styles.label}>MM/DD/YYYY</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter Date"
        placeholderTextColor="#6B7280"
        value={dateText}
        onChangeText={setDateText}
        keyboardType="numbers-and-punctuation"
      />

      {parsed && (
        <Text style={styles.countdown}>
          {daysUntil(parsed)} Days Until Test
        </Text>
      )}

      <Pressable
        style={[styles.button, !canContinue && { opacity: 0.4 }]}
        disabled={!canContinue}
        onPress={async () => {
          await updateAppData({
            testDateISO: parsed!.toISOString(),
          });

          router.replace("/(tabs)/dashboard");
        }}
      >
        <Text style={styles.buttonText}>Continue to Dashboard</Text>
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
  countdown: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: "700",
    color: "#2ECC71",
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
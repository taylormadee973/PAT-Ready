import { router } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function Workout() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Workout Details</Text>

      <View style={styles.card}>
        <Text style={styles.workoutTitle}>Interval Run</Text>
        <Text style={styles.sub}>Duration: 20 minutes</Text>
        <Text style={styles.sub}>Focus: Speed and endurance</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Warm-Up</Text>
        <Text style={styles.item}>• 5 minute light jog</Text>
        <Text style={styles.item}>• Dynamic leg stretches</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Main Workout</Text>
        <Text style={styles.item}>• 4 x 400 meter intervals</Text>
        <Text style={styles.item}>• 90 seconds rest between each interval</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cool Down</Text>
        <Text style={styles.item}>• 5 minute walk</Text>
        <Text style={styles.item}>• Light stretching</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Training Tip</Text>
        <Text style={styles.item}>
          Maintain a steady pace and focus on recovery during rest periods.
        </Text>
      </View>

      <Pressable style={styles.button} onPress={() => router.back()}>
        <Text style={styles.buttonText}>Back</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    padding: 24,
  },
  title: {
    marginTop: 70,
    fontSize: 32,
    fontWeight: "700",
  },
  card: {
    marginTop: 24,
    borderWidth: 1,
    borderColor: "#E6E6E6",
    borderRadius: 14,
    padding: 18,
    backgroundColor: "white",
  },
  workoutTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111",
  },
  sub: {
    marginTop: 6,
    fontSize: 15,
    color: "#444",
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0B3A53",
    marginBottom: 8,
  },
  item: {
    fontSize: 15,
    color: "#111",
    marginTop: 4,
    lineHeight: 22,
  },
  button: {
    marginTop: 36,
    backgroundColor: "#0B3A53",
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
  },
});
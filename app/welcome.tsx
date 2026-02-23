import { router } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function Welcome() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>PAT READY</Text>

      <Text style={styles.subtitle}>
        Prepare for your Physical Ability Test with structured training and readiness tracking.
      </Text>

      <Pressable
        style={styles.button}
        onPress={() => router.push("/baseline")}
      >
        <Text style={styles.buttonText}>Get Started</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    alignItems: "center",
    padding: 24,
  },
  title: {
    marginTop: 120,
    fontSize: 34,
    fontWeight: "700",
  },
  subtitle: {
    marginTop: 22,
    fontSize: 16,
    textAlign: "center",
    maxWidth: 320,
  },
  button: {
    marginTop: "auto",
    marginBottom: 60,
    backgroundColor: "#0B3A53",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 20,
    minWidth: 240,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 22,
    fontWeight: "700",
  },
});
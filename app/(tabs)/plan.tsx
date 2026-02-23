import React from "react";
import { StyleSheet, Text, View } from "react-native";

function Row({ day, text }: { day: string; text: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.day}>{day}</Text>
      <Text style={styles.item}>{text}</Text>
    </View>
  );
}

export default function Plan() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Training Plan</Text>

      <View style={styles.list}>
        <Row day="Mon" text="Interval Run" />
        <Row day="Tue" text="Push-ups + Sit-ups" />
        <Row day="Wed" text="Easy Run" />
        <Row day="Thu" text="Rest" />
        <Row day="Fri" text="Tempo Run" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white", padding: 24 },
  header: { marginTop: 70, fontSize: 32, fontWeight: "700", textAlign: "center" },

  list: { marginTop: 40, gap: 26 },

  row: { flexDirection: "row", alignItems: "center" },
  day: { width: 55, fontSize: 16, fontWeight: "700", color: "#111" },
  item: { fontSize: 16, color: "#333" },
});
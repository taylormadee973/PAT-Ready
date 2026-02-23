import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { getAppData } from "../lib/storage";

function ProgressRow({ label, current, goal }: { label: string; current: string; goal: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>
        {current} → <Text style={styles.goal}>Goal: {goal}</Text>
      </Text>
    </View>
  );
}

export default function Progress() {
  const [mileTime, setMileTime] = useState("—");
  const [pushUps, setPushUps] = useState("—");
  const [sitUps, setSitUps] = useState("—");

  const [goalMileTime, setGoalMileTime] = useState("—");
  const [goalPushUps, setGoalPushUps] = useState("—");
  const [goalSitUps, setGoalSitUps] = useState("—");

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      (async () => {
        const data = await getAppData();
        if (!alive) return;

        setMileTime(data.baseline?.mileTime || "—");
        setPushUps(data.baseline?.pushUps || "—");
        setSitUps(data.baseline?.sitUps || "—");

        setGoalMileTime(data.goals?.mileTime || "—");
        setGoalPushUps(data.goals?.pushUps || "—");
        setGoalSitUps(data.goals?.sitUps || "—");
      })();

      return () => { alive = false; };
    }, [])
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Progress</Text>

      <View style={styles.section}>
        <ProgressRow label="Run Time" current={mileTime} goal={goalMileTime} />
        <ProgressRow label="Push-ups" current={pushUps} goal={goalPushUps} />
        <ProgressRow label="Sit-ups" current={sitUps} goal={goalSitUps} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white", padding: 24 },
  header: { marginTop: 70, fontSize: 32, fontWeight: "700", textAlign: "center" },
  section: { marginTop: 50, gap: 28 },
  row: {},
  label: { fontSize: 14, color: "#666", fontWeight: "600" },
  value: { marginTop: 6, fontSize: 20, fontWeight: "800", color: "#111" },
  goal: { fontSize: 20, fontWeight: "800", color: "#111" },
});
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { getAppData } from "../lib/storage";

function parseTimeToSeconds(input: string) {
  const s = input.trim();
  if (!s || s === "—") return null;

  const parts = s.split(":").map((p) => p.trim());
  if (parts.some((p) => p === "" || Number.isNaN(Number(p)))) return null;

  if (parts.length === 2) {
    const mm = Number(parts[0]);
    const ss = Number(parts[1]);
    if (!Number.isFinite(mm) || !Number.isFinite(ss) || ss < 0 || ss >= 60 || mm < 0) return null;
    return mm * 60 + ss;
  }

  if (parts.length === 3) {
    const hh = Number(parts[0]);
    const mm = Number(parts[1]);
    const ss = Number(parts[2]);
    if (
      !Number.isFinite(hh) ||
      !Number.isFinite(mm) ||
      !Number.isFinite(ss) ||
      ss < 0 ||
      ss >= 60 ||
      mm < 0 ||
      mm >= 60 ||
      hh < 0
    ) return null;
    return hh * 3600 + mm * 60 + ss;
  }

  return null;
}

function formatSeconds(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

function toIntOrNull(input: string) {
  const n = Number(String(input).trim());
  if (!Number.isFinite(n)) return null;
  return Math.trunc(n);
}

function ProgressCard({
  label,
  current,
  goal,
  feedback,
}: {
  label: string;
  current: string;
  goal: string;
  feedback: string;
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>
        {current} → <Text style={styles.goal}>Goal: {goal}</Text>
      </Text>
      <Text style={styles.feedback}>{feedback}</Text>
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

      return () => {
        alive = false;
      };
    }, [])
  );

  const runFeedback = useMemo(() => {
    const current = parseTimeToSeconds(mileTime);
    const goal = parseTimeToSeconds(goalMileTime);

    if (current === null || goal === null) return "Enter both current and goal run times.";

    if (current <= goal) return "You are meeting your run goal.";

    const diff = current - goal;
    return `Reduce run time by ${formatSeconds(diff)}.`;
  }, [mileTime, goalMileTime]);

  const pushFeedback = useMemo(() => {
    const current = toIntOrNull(pushUps);
    const goal = toIntOrNull(goalPushUps);

    if (current === null || goal === null) return "Enter both current and goal push-up values.";

    if (current >= goal) return "You are meeting your push-up goal.";

    return `Need ${goal - current} more push-ups to reach your goal.`;
  }, [pushUps, goalPushUps]);

  const sitFeedback = useMemo(() => {
    const current = toIntOrNull(sitUps);
    const goal = toIntOrNull(goalSitUps);

    if (current === null || goal === null) return "Enter both current and goal sit-up values.";

    if (current >= goal) return "You are meeting your sit-up goal.";

    return `Need ${goal - current} more sit-ups to reach your goal.`;
  }, [sitUps, goalSitUps]);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Progress</Text>

      <View style={styles.section}>
        <ProgressCard
          label="Run Time"
          current={mileTime}
          goal={goalMileTime}
          feedback={runFeedback}
        />

        <ProgressCard
          label="Push-ups"
          current={pushUps}
          goal={goalPushUps}
          feedback={pushFeedback}
        />

        <ProgressCard
          label="Sit-ups"
          current={sitUps}
          goal={goalSitUps}
          feedback={sitFeedback}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white", padding: 24 },
  header: { marginTop: 70, fontSize: 32, fontWeight: "700", textAlign: "center" },
  section: { marginTop: 40, gap: 20 },
  card: {
    borderWidth: 1,
    borderColor: "#E6E6E6",
    borderRadius: 14,
    padding: 18,
    backgroundColor: "white",
  },
  label: { fontSize: 14, color: "#666", fontWeight: "600" },
  value: { marginTop: 6, fontSize: 20, fontWeight: "800", color: "#111" },
  goal: { fontSize: 20, fontWeight: "800", color: "#111" },
  feedback: { marginTop: 10, fontSize: 15, fontWeight: "600", color: "#0B3A53" },
});
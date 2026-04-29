import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useMemo, useState } from "react";
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

function toIntOrNull(input: string) {
  const n = Number(String(input).trim());
  if (!Number.isFinite(n)) return null;
  return Math.trunc(n);
}

type PlanDay = {
  day: string;
  workout: string;
};

function PlanRow({ day, workout }: PlanDay) {
  return (
    <View style={styles.card}>
      <Text style={styles.day}>{day}</Text>
      <Text style={styles.item}>{workout}</Text>
    </View>
  );
}

function getWeeklyPlan(unmetGoals: string[]) {
  if (unmetGoals.length === 0) {
    return {
      focus: "Maintenance / Recovery Week",
      summary: "You are meeting your goals, so this plan focuses on maintaining performance and recovering well.",
      days: [
        { day: "Mon", workout: "Easy Run + Mobility" },
        { day: "Tue", workout: "Light Push-ups + Sit-ups" },
        { day: "Wed", workout: "Recovery Walk" },
        { day: "Thu", workout: "Tempo Run" },
        { day: "Fri", workout: "Stretching + Mobility" },
      ],
    };
  }

  if (unmetGoals.includes("run") && unmetGoals.includes("push") && unmetGoals.includes("sit")) {
    return {
      focus: "Full PAT Improvement Week",
      summary: "This week targets all major PAT areas because run time, push-ups, and sit-ups are all below goal.",
      days: [
        { day: "Mon", workout: "Interval Run + Push-ups" },
        { day: "Tue", workout: "Sit-ups + Core Circuit" },
        { day: "Wed", workout: "Easy Run" },
        { day: "Thu", workout: "Push-ups + Sit-ups" },
        { day: "Fri", workout: "Tempo Run + Recovery Stretching" },
      ],
    };
  }

  if (unmetGoals.includes("run") && unmetGoals.includes("push")) {
    return {
      focus: "Run + Push-up Focus Week",
      summary: "This plan emphasizes speed work and upper body endurance because those are the two areas still below target.",
      days: [
        { day: "Mon", workout: "Interval Run" },
        { day: "Tue", workout: "Push-up Sets + Shoulder Mobility" },
        { day: "Wed", workout: "Easy Run" },
        { day: "Thu", workout: "Push-up Ladder Workout" },
        { day: "Fri", workout: "Tempo Run" },
      ],
    };
  }

  if (unmetGoals.includes("run") && unmetGoals.includes("sit")) {
    return {
      focus: "Run + Core Focus Week",
      summary: "This week builds running endurance and abdominal strength to address both unmet goals.",
      days: [
        { day: "Mon", workout: "Interval Run" },
        { day: "Tue", workout: "Sit-ups + Planks" },
        { day: "Wed", workout: "Easy Run" },
        { day: "Thu", workout: "Core Circuit" },
        { day: "Fri", workout: "Tempo Run" },
      ],
    };
  }

  if (unmetGoals.includes("push") && unmetGoals.includes("sit")) {
    return {
      focus: "Strength + Core Focus Week",
      summary: "This plan targets upper body and core endurance because those are the current weak areas.",
      days: [
        { day: "Mon", workout: "Push-up Sets" },
        { day: "Tue", workout: "Sit-ups + Core Circuit" },
        { day: "Wed", workout: "Recovery Walk" },
        { day: "Thu", workout: "Push-ups + Sit-ups" },
        { day: "Fri", workout: "Mobility + Stretching" },
      ],
    };
  }

  if (unmetGoals.includes("run")) {
    return {
      focus: "Run Focus Week",
      summary: "This week prioritizes speed and endurance because run time is still above the goal.",
      days: [
        { day: "Mon", workout: "Interval Run" },
        { day: "Tue", workout: "Recovery Walk + Mobility" },
        { day: "Wed", workout: "Easy Run" },
        { day: "Thu", workout: "Rest" },
        { day: "Fri", workout: "Tempo Run" },
      ],
    };
  }

  if (unmetGoals.includes("push")) {
    return {
      focus: "Push-up Focus Week",
      summary: "This plan emphasizes upper body endurance because push-ups are still below goal.",
      days: [
        { day: "Mon", workout: "Push-up Sets" },
        { day: "Tue", workout: "Shoulder Mobility + Recovery" },
        { day: "Wed", workout: "Push-up Ladder" },
        { day: "Thu", workout: "Rest" },
        { day: "Fri", workout: "Push-up Endurance Test" },
      ],
    };
  }

  return {
    focus: "Sit-up Focus Week",
    summary: "This week emphasizes core endurance because sit-ups are still below goal.",
    days: [
      { day: "Mon", workout: "Sit-ups + Planks" },
      { day: "Tue", workout: "Recovery Walk" },
      { day: "Wed", workout: "Core Circuit" },
      { day: "Thu", workout: "Rest" },
      { day: "Fri", workout: "Sit-up Endurance Sets" },
    ],
  };
}

export default function Plan() {
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

  const weeklyPlan = useMemo(() => {
    const unmetGoals: string[] = [];

    const currentRun = parseTimeToSeconds(mileTime);
    const targetRun = parseTimeToSeconds(goalMileTime);

    const currentPush = toIntOrNull(pushUps);
    const targetPush = toIntOrNull(goalPushUps);

    const currentSit = toIntOrNull(sitUps);
    const targetSit = toIntOrNull(goalSitUps);

    if (currentRun !== null && targetRun !== null && currentRun > targetRun) {
      unmetGoals.push("run");
    }

    if (currentPush !== null && targetPush !== null && currentPush < targetPush) {
      unmetGoals.push("push");
    }

    if (currentSit !== null && targetSit !== null && currentSit < targetSit) {
      unmetGoals.push("sit");
    }

    return getWeeklyPlan(unmetGoals);
  }, [mileTime, pushUps, sitUps, goalMileTime, goalPushUps, goalSitUps]);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Training Plan</Text>

      <View style={styles.focusCard}>
        <Text style={styles.focusTitle}>{weeklyPlan.focus}</Text>
        <Text style={styles.focusSummary}>{weeklyPlan.summary}</Text>
      </View>

      <View style={styles.list}>
        {weeklyPlan.days.map((dayPlan) => (
          <PlanRow key={dayPlan.day} day={dayPlan.day} workout={dayPlan.workout} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white", padding: 24 },
  header: { marginTop: 70, fontSize: 32, fontWeight: "700", textAlign: "center" },

  focusCard: {
    marginTop: 28,
    borderWidth: 1,
    borderColor: "#E6E6E6",
    borderRadius: 14,
    padding: 18,
    backgroundColor: "white",
  },
  focusTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111",
  },
  focusSummary: {
    marginTop: 8,
    fontSize: 15,
    lineHeight: 22,
    color: "#0B3A53",
    fontWeight: "600",
  },

  list: { marginTop: 22, gap: 16 },

  card: {
    borderWidth: 1,
    borderColor: "#E6E6E6",
    borderRadius: 14,
    padding: 16,
    backgroundColor: "white",
  },
  day: { fontSize: 16, fontWeight: "700", color: "#111" },
  item: { marginTop: 6, fontSize: 16, color: "#333" },
});
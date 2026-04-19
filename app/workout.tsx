import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { getAppData } from "./lib/storage";

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

type WorkoutPlan = {
  focusTitle: string;
  duration: string;
  focusSubtitle: string;
  warmup: string[];
  main: string[];
  cooldown: string[];
  tip: string;
};

function getWorkoutPlan(unmetGoals: string[]): WorkoutPlan {
  if (unmetGoals.length === 0) {
    return {
      focusTitle: "Maintenance / Recovery",
      duration: "20 minutes",
      focusSubtitle: "Maintain conditioning and recover",
      warmup: ["5 minute brisk walk", "Dynamic stretching"],
      main: ["10 minute easy jog", "2 light sets of push-ups and sit-ups"],
      cooldown: ["5 minute walk", "Full body stretching"],
      tip: "You are meeting your goals, so today’s workout focuses on maintenance and recovery.",
    };
  }

  if (unmetGoals.includes("run") && unmetGoals.includes("push") && unmetGoals.includes("sit")) {
    return {
      focusTitle: "Full PAT Prep",
      duration: "30 minutes",
      focusSubtitle: "Run, upper body endurance, and core",
      warmup: ["5 minute light jog", "Dynamic leg and arm stretches"],
      main: [
        "3 x 400 meter intervals",
        "3 sets of 12 push-ups",
        "3 sets of 15 sit-ups",
        "60 to 90 seconds rest between rounds",
      ],
      cooldown: ["5 minute walk", "Light stretching"],
      tip: "This workout targets all major PAT areas because all three goals still need improvement.",
    };
  }

  if (unmetGoals.includes("run") && unmetGoals.includes("push")) {
    return {
      focusTitle: "Run + Push-up Focus",
      duration: "25 minutes",
      focusSubtitle: "Speed and upper body endurance",
      warmup: ["5 minute light jog", "Dynamic stretches"],
      main: [
        "4 x 400 meter intervals",
        "3 sets of 10 to 15 push-ups",
        "60 to 90 seconds rest between rounds",
      ],
      cooldown: ["5 minute walk", "Upper body stretching"],
      tip: "This workout combines running and push-up work because both goals are still below target.",
    };
  }

  if (unmetGoals.includes("run") && unmetGoals.includes("sit")) {
    return {
      focusTitle: "Run + Core Focus",
      duration: "25 minutes",
      focusSubtitle: "Speed and abdominal endurance",
      warmup: ["5 minute light jog", "Dynamic hip and leg stretches"],
      main: [
        "4 x 400 meter intervals",
        "3 sets of 15 sit-ups",
        "2 sets of 30 second planks",
      ],
      cooldown: ["5 minute walk", "Core and hamstring stretching"],
      tip: "This workout focuses on running and core strength to improve both unmet goals.",
    };
  }

  if (unmetGoals.includes("push") && unmetGoals.includes("sit")) {
    return {
      focusTitle: "Strength + Core Focus",
      duration: "20 minutes",
      focusSubtitle: "Upper body and abdominal endurance",
      warmup: ["Arm circles", "Dynamic stretching"],
      main: [
        "4 sets of 12 push-ups",
        "4 sets of 15 sit-ups",
        "2 sets of shoulder taps",
      ],
      cooldown: ["Light stretching", "Deep breathing recovery"],
      tip: "This workout targets upper body and core endurance because those are the current weak areas.",
    };
  }

  if (unmetGoals.includes("run")) {
    return {
      focusTitle: "Run Focus",
      duration: "20 minutes",
      focusSubtitle: "Speed and endurance",
      warmup: ["5 minute light jog", "Dynamic leg stretches"],
      main: ["4 x 400 meter intervals", "90 seconds rest between each interval"],
      cooldown: ["5 minute walk", "Light stretching"],
      tip: "Focus on pacing and controlled breathing during each interval.",
    };
  }

  if (unmetGoals.includes("push")) {
    return {
      focusTitle: "Push-up Focus",
      duration: "15 minutes",
      focusSubtitle: "Upper body endurance",
      warmup: ["Arm circles", "Shoulder mobility drills"],
      main: ["4 sets of 12 push-ups", "2 sets of incline push-ups", "60 seconds rest between sets"],
      cooldown: ["Chest and shoulder stretching", "Slow breathing recovery"],
      tip: "Maintain good form on every rep rather than rushing through the set.",
    };
  }

  return {
    focusTitle: "Sit-up Focus",
    duration: "15 minutes",
    focusSubtitle: "Core endurance",
    warmup: ["Torso twists", "Hip mobility drills"],
    main: ["4 sets of 15 sit-ups", "2 sets of 30 second planks", "45 seconds rest between sets"],
    cooldown: ["Lower back stretching", "Hamstring stretching"],
    tip: "Control the movement and focus on consistent breathing to build core endurance.",
  };
}

export default function Workout() {
  const [mileTime, setMileTime] = useState("—");
  const [pushUps, setPushUps] = useState("—");
  const [sitUps, setSitUps] = useState("—");

  const [goalMileTime, setGoalMileTime] = useState("—");
  const [goalPushUps, setGoalPushUps] = useState("—");
  const [goalSitUps, setGoalSitUps] = useState("—");

  useEffect(() => {
    const loadData = async () => {
      const data = await getAppData();

      setMileTime(data.baseline?.mileTime || "—");
      setPushUps(data.baseline?.pushUps || "—");
      setSitUps(data.baseline?.sitUps || "—");

      setGoalMileTime(data.goals?.mileTime || "—");
      setGoalPushUps(data.goals?.pushUps || "—");
      setGoalSitUps(data.goals?.sitUps || "—");
    };

    loadData();
  }, []);

  const workoutPlan = useMemo(() => {
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

    return getWorkoutPlan(unmetGoals);
  }, [mileTime, pushUps, sitUps, goalMileTime, goalPushUps, goalSitUps]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Workout Details</Text>

      <View style={styles.card}>
        <Text style={styles.workoutTitle}>{workoutPlan.focusTitle}</Text>
        <Text style={styles.sub}>Duration: {workoutPlan.duration}</Text>
        <Text style={styles.sub}>Focus: {workoutPlan.focusSubtitle}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Warm-Up</Text>
        {workoutPlan.warmup.map((item, index) => (
          <Text key={index} style={styles.item}>• {item}</Text>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Main Workout</Text>
        {workoutPlan.main.map((item, index) => (
          <Text key={index} style={styles.item}>• {item}</Text>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cool Down</Text>
        {workoutPlan.cooldown.map((item, index) => (
          <Text key={index} style={styles.item}>• {item}</Text>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Training Tip</Text>
        <Text style={styles.item}>{workoutPlan.tip}</Text>
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
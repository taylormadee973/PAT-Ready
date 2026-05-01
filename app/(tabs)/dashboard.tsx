import { useFocusEffect } from "@react-navigation/native";
import * as Location from "expo-location";
import { router } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { getAppData, resetAppData } from "../lib/storage";

function daysUntilISO(iso?: string) {
  if (!iso) return null;

  const target = new Date(iso);
  const now = new Date();

  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(target.getFullYear(), target.getMonth(), target.getDate());

  const diffMs = end.getTime() - start.getTime();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

function parseTimeToSeconds(input: string) {
  const s = input.trim();
  if (!s) return null;

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
    )
      return null;
    return hh * 3600 + mm * 60 + ss;
  }

  return null;
}

function toIntOrNull(input: string) {
  const n = Number(String(input).trim());
  if (!Number.isFinite(n)) return null;
  return Math.trunc(n);
}

function weatherCodeToText(code: number | null | undefined) {
  if (code === null || code === undefined) return "—";
  if (code === 0) return "Clear";
  if ([1, 2, 3].includes(code)) return "Partly cloudy";
  if ([45, 48].includes(code)) return "Fog";
  if ([51, 53, 55, 56, 57].includes(code)) return "Drizzle";
  if ([61, 63, 65, 66, 67].includes(code)) return "Rain";
  if ([71, 73, 75, 77].includes(code)) return "Snow";
  if ([80, 81, 82].includes(code)) return "Rain showers";
  if ([95, 96, 99].includes(code)) return "Thunderstorm";
  return `Code ${code}`;
}

function Card({
  title,
  value,
  sub,
  valueColor,
}: {
  title: string;
  value: string;
  sub?: string;
  valueColor?: string;
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={[styles.cardValue, valueColor ? { color: valueColor } : null]}>
        {value}
      </Text>
      {sub ? <Text style={styles.cardSub}>{sub}</Text> : null}
    </View>
  );
}

type WeatherState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "denied" }
  | { status: "error"; message: string }
  | { status: "ready"; tempF: number; windMph: number; code: number };

export default function Dashboard() {
  const [mileTime, setMileTime] = useState<string>("");
  const [pushUps, setPushUps] = useState<string>("");
  const [sitUps, setSitUps] = useState<string>("");

  const [goalMileTime, setGoalMileTime] = useState<string>("");
  const [goalPushUps, setGoalPushUps] = useState<string>("");
  const [goalSitUps, setGoalSitUps] = useState<string>("");

  const [testDateISO, setTestDateISO] = useState<string | undefined>(undefined);

  const [weather, setWeather] = useState<WeatherState>({ status: "idle" });

  const handleResetAppData = async () => {
    await resetAppData();

    setMileTime("");
    setPushUps("");
    setSitUps("");

    setGoalMileTime("");
    setGoalPushUps("");
    setGoalSitUps("");

    setTestDateISO(undefined);

    router.replace("/baseline");
  };

  useFocusEffect(
    useCallback(() => {
      let alive = true;

      (async () => {
        const data = await getAppData();
        if (!alive) return;

        setMileTime(data.baseline?.mileTime ?? "");
        setPushUps(data.baseline?.pushUps ?? "");
        setSitUps(data.baseline?.sitUps ?? "");

        setGoalMileTime(data.goals?.mileTime ?? "");
        setGoalPushUps(data.goals?.pushUps ?? "");
        setGoalSitUps(data.goals?.sitUps ?? "");

        setTestDateISO(data.testDateISO);

        try {
          setWeather({ status: "loading" });

          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== "granted") {
            setWeather({ status: "denied" });
            return;
          }

          const last = await Location.getLastKnownPositionAsync({});
          const pos =
            last ??
            (await Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.Balanced,
            }));

          const { latitude, longitude } = pos.coords;

          const url =
            `https://api.open-meteo.com/v1/forecast` +
            `?latitude=${latitude}&longitude=${longitude}` +
            `&current_weather=true&temperature_unit=fahrenheit&windspeed_unit=mph`;

          const res = await fetch(url);
          if (!res.ok) throw new Error(`Weather fetch failed (${res.status})`);

          const json = await res.json();

          const cw = json?.current_weather;
          const tempF = Number(cw?.temperature);
          const windMph = Number(cw?.windspeed);
          const code = Number(cw?.weathercode);

          if (!Number.isFinite(tempF) || !Number.isFinite(windMph) || !Number.isFinite(code)) {
            throw new Error("Weather data missing/invalid");
          }

          setWeather({ status: "ready", tempF, windMph, code });
        } catch (e: any) {
          setWeather({ status: "error", message: e?.message ?? "Unknown error" });
        }
      })();

      return () => {
        alive = false;
      };
    }, [])
  );

  const countdown = useMemo(() => daysUntilISO(testDateISO), [testDateISO]);

  const readiness = useMemo(() => {
    if (!testDateISO || countdown === null) {
      return { label: "Set Up Needed", color: "#6B7280", sub: "Add a test date." };
    }

    const baseRun = parseTimeToSeconds(mileTime);
    const goalRun = parseTimeToSeconds(goalMileTime);

    const basePush = toIntOrNull(pushUps);
    const goalPush = toIntOrNull(goalPushUps);

    const baseSit = toIntOrNull(sitUps);
    const goalSit = toIntOrNull(goalSitUps);

    const missingPieces =
      baseRun === null ||
      goalRun === null ||
      basePush === null ||
      goalPush === null ||
      baseSit === null ||
      goalSit === null;

    if (missingPieces) {
      return { label: "Set Up Needed", color: "#6B7280", sub: "Enter baseline + goals." };
    }

    const meetsRun = baseRun <= goalRun;
    const meetsPush = basePush >= goalPush;
    const meetsSit = baseSit >= goalSit;

    if (meetsRun && meetsPush && meetsSit) {
      return { label: "On Track", color: "#2ECC71", sub: "Baseline meets all goals." };
    }

    const timeIsClose = countdown <= 21;

    const deficits: string[] = [];
    if (!meetsRun) {
      const diff = baseRun - goalRun;
      deficits.push(`Run: +${Math.max(0, diff)}s`);
    }
    if (!meetsPush) deficits.push(`Push-ups: -${Math.max(0, goalPush - basePush)}`);
    if (!meetsSit) deficits.push(`Sit-ups: -${Math.max(0, goalSit - baseSit)}`);

    const sub = deficits.length ? `Gap: ${deficits.join(" • ")}` : "Progress needed.";

    if (timeIsClose) {
      return { label: "At Risk", color: "#B00020", sub: `${sub} • Test soon (${countdown}d).` };
    }

    return { label: "Needs Improvement", color: "#F59E0B", sub: `${sub} • Time left: ${countdown}d.` };
  }, [mileTime, pushUps, sitUps, goalMileTime, goalPushUps, goalSitUps, testDateISO, countdown]);

  const workoutInfo = useMemo(() => {
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

    if (unmetGoals.length === 0) {
      return { title: "Maintenance / Recovery", sub: "Tap to View Workout" };
    }

    if (unmetGoals.includes("run") && unmetGoals.includes("push") && unmetGoals.includes("sit")) {
      return { title: "Full PAT Prep - 30 min", sub: "Tap to View Workout" };
    }

    if (unmetGoals.includes("run") && unmetGoals.includes("push")) {
      return { title: "Run + Push-up Focus - 25 min", sub: "Tap to View Workout" };
    }

    if (unmetGoals.includes("run") && unmetGoals.includes("sit")) {
      return { title: "Run + Core Focus - 25 min", sub: "Tap to View Workout" };
    }

    if (unmetGoals.includes("push") && unmetGoals.includes("sit")) {
      return { title: "Strength + Core Focus - 20 min", sub: "Tap to View Workout" };
    }

    if (unmetGoals.includes("run")) {
      return { title: "Run Focus - 20 min", sub: "Tap to View Workout" };
    }

    if (unmetGoals.includes("push")) {
      return { title: "Push-up Focus - 15 min", sub: "Tap to View Workout" };
    }

    return { title: "Sit-up Focus - 15 min", sub: "Tap to View Workout" };
  }, [mileTime, pushUps, sitUps, goalMileTime, goalPushUps, goalSitUps]);

  const weatherLine = useMemo(() => {
    if (weather.status === "loading") return "Loading weather…";
    if (weather.status === "denied") return "Location denied";
    if (weather.status === "error") return "Weather unavailable";
    if (weather.status === "ready") {
      const desc = weatherCodeToText(weather.code);
      return `${Math.round(weather.tempF)}°F • ${desc}`;
    }
    return "—";
  }, [weather]);

  const weatherSub = useMemo(() => {
    if (weather.status === "ready") return `Wind: ${Math.round(weather.windMph)} mph`;
    if (weather.status === "error") return weather.message;
    return undefined;
  }, [weather]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={true}
    >
      <Text style={styles.header}>Dashboard</Text>

      <View style={styles.cards}>
        <Card title="Readiness Status" value={readiness.label} valueColor={readiness.color} sub={readiness.sub} />

        <Card title="Test Countdown" value={countdown === null ? "No date set" : `${countdown} Days Remaining`} />

        <Card title="Weather (Training)" value={weatherLine} sub={weatherSub} />

        <Card
          title="Baseline Snapshot"
          value={
            mileTime || pushUps || sitUps
              ? `Run: ${mileTime || "—"}  •  Push-ups: ${pushUps || "—"}  •  Sit-ups: ${sitUps || "—"}`
              : "No baseline saved"
          }
        />

        <Pressable style={styles.editButton} onPress={() => router.push("/baseline?mode=edit")}>
          <Text style={styles.editButtonText}>Edit Baseline</Text>
        </Pressable>

        <Pressable onPress={() => router.push("/workout")}>
          <Card title="Today’s Workout" value={workoutInfo.title} sub={workoutInfo.sub} />
        </Pressable>

        <Pressable style={styles.resetButton} onPress={handleResetAppData}>
          <Text style={styles.resetButtonText}>Reset Progress</Text>
        </Pressable>

        {weather.status === "loading" ? (
          <View style={{ alignItems: "center", marginTop: 6 }}>
            <ActivityIndicator />
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },

  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 24,
    paddingBottom: 180,
  },

  header: {
    marginTop: 20,
    fontSize: 30,
    fontWeight: "700",
    textAlign: "center",
  },

  cards: {
    marginTop: 22,
    gap: 14,
  },

  card: {
    borderWidth: 1,
    borderColor: "#E6E6E6",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: "center",
    backgroundColor: "white",
  },

  cardTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
  },

  cardValue: {
    marginTop: 6,
    fontSize: 18,
    fontWeight: "800",
    color: "#111",
    textAlign: "center",
  },

  cardSub: {
    marginTop: 5,
    fontSize: 13,
    color: "#0B3A53",
    fontWeight: "600",
    textAlign: "center",
  },

  editButton: {
    marginTop: 0,
    backgroundColor: "#0B3A53",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },

  editButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },

  resetButton: {
    marginTop: 0,
    backgroundColor: "#B00020",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },

  resetButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
});
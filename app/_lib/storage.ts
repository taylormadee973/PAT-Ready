import AsyncStorage from "@react-native-async-storage/async-storage";

export type BaselineData = {
  mileTime: string;
  pushUps: string;
  sitUps: string;
};

export type GoalData = {
  mileTime: string;
  pushUps: string;
  sitUps: string;
};

export type AppData = {
  baseline?: BaselineData;
  goals?: GoalData;
  testDateISO?: string;
};

const KEY = "PAT_READY_APP_DATA_v1";

export async function getAppData(): Promise<AppData> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as AppData;
  } catch {
    return {};
  }
}

export async function updateAppData(patch: Partial<AppData>): Promise<void> {
  const current = await getAppData();
  const merged: AppData = { ...current, ...patch };
  await AsyncStorage.setItem(KEY, JSON.stringify(merged));
}

export async function resetAppData(): Promise<void> {
  await AsyncStorage.removeItem(KEY);
}
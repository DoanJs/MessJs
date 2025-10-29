import AsyncStorage from '@react-native-async-storage/async-storage';

export const storage = {
  async setItem(key: string, value: any) {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  },
  async getItem<T>(key: string): Promise<T | null> {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  },
  async removeItem(key: string) {
    await AsyncStorage.removeItem(key);
  },
};

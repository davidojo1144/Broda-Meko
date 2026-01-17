import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

export async function saveAuthTokens(accessToken: string, refreshToken: string) {
  try {
    await AsyncStorage.multiSet([
      [TOKEN_KEY, accessToken],
      [REFRESH_TOKEN_KEY, refreshToken],
    ]);
  } catch (e) {
    console.error('Failed to save auth tokens', e);
  }
}

export async function getAccessToken() {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch (e) {
    console.error('Failed to get access token', e);
    return null;
  }
}

export async function getRefreshToken() {
  try {
    return await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
  } catch (e) {
    console.error('Failed to get refresh token', e);
    return null;
  }
}

export async function clearAuthTokens() {
  try {
    await AsyncStorage.multiRemove([TOKEN_KEY, REFRESH_TOKEN_KEY]);
  } catch (e) {
    console.error('Failed to clear auth tokens', e);
  }
}

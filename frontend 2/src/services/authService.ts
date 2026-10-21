import { httpClient, storeToken, clearToken, storeUser, getStoredUser } from "./httpClient";

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: "Trainee" | "Admin";
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

/** IDD UI-01 control #5: "Log in to the system; the server returns a JWT token". */
export async function login(email: string, password: string): Promise<AuthUser> {
  const { data } = await httpClient.post<LoginResponse>("/auth/login", { email, password });
  storeToken(data.token);
  storeUser(data.user);
  return data.user;
}

/** IDD UI-02 control #5: "Create the new account". */
export async function signUp(fullName: string, email: string, password: string): Promise<AuthUser> {
  const { data } = await httpClient.post<LoginResponse>("/auth/register", { fullName, email, password });
  storeToken(data.token);
  storeUser(data.user);
  return data.user;
}

export function logout(): void {
  clearToken();
  window.location.assign("/login");
}

/** Cached profile for the signed-in user (no network call). */
export function getCurrentUser(): AuthUser | null {
  return getStoredUser<AuthUser>();
}

/** IDD UI-08 control #4: "Save the changed personal information". */
export async function updateProfile(fullName: string): Promise<AuthUser> {
  const { data } = await httpClient.patch<AuthUser>("/auth/profile", { fullName });
  storeUser(data);
  return data;
}

/** IDD UI-08 control #8: "Update the password". */
export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  await httpClient.post("/auth/change-password", { currentPassword, newPassword });
}

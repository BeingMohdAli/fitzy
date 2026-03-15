import keycloak from "../keycloak";

const BASE = "/api/activities";

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${keycloak.token}`,
});

export const trackActivity = async (data) => {
  await keycloak.updateToken(30);
  const res = await fetch(BASE, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to track activity");
  return res.json();
};

export const getUserActivities = async () => {
  await keycloak.updateToken(30);
  const res = await fetch(BASE, {
    method: "GET",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch activities");
  return res.json();
};

export const getActivityById = async (id) => {
  await keycloak.updateToken(30);
  const res = await fetch(`${BASE}/${id}`, {
    method: "GET",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch activity");
  return res.json();
};

export const ACTIVITY_TYPES = [
  "RUNNING", "WALKING", "CYCLING", "SWIMMING",
  "WEIGHT_TRAINING", "YOGA", "HIIT", "PILATES", "OTHER",
];

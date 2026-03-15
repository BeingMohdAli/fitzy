import keycloak from "../keycloak";

const BASE = "/api/recommendations";

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${keycloak.token}`,
});

export const getUserRecommendations = async (userId) => {
  await keycloak.updateToken(30);
  const res = await fetch(`${BASE}/user/${userId}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch recommendations");
  return res.json();
};

export const getActivityRecommendation = async (activityId) => {
  await keycloak.updateToken(30);
  const res = await fetch(`${BASE}/activity/${activityId}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch recommendation");
  return res.json();
};

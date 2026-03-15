import keycloak from "../keycloak";

const BASE = "/api/users";

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${keycloak.token}`,
});

export const getUserProfile = async (userId) => {
  await keycloak.updateToken(30);
  const res = await fetch(`${BASE}/${userId}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch user profile");
  return res.json();
};

export const syncUser = async (data) => {
  await keycloak.updateToken(30);
  const res = await fetch(`${BASE}/sync`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to sync user");
  return res.json();
};

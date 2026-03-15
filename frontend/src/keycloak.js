import Keycloak from "keycloak-js";

const keycloak = new Keycloak({
  url: import.meta.env.VITE_KEYCLOAK_URL || "http://localhost:9090",
  realm: "fitzy",
  clientId: "fitzy-app",
});

export default keycloak;

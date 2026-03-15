FROM quay.io/keycloak/keycloak:24.0.3

ENV KC_HTTP_ENABLED=true
ENV KC_HOSTNAME_STRICT=false
ENV KC_HTTP_PORT=8080

COPY fitzy-realm.json /opt/keycloak/data/import/fitzy-realm.json

EXPOSE 8080

ENTRYPOINT ["/opt/keycloak/bin/kc.sh"]
CMD ["start", "--http-port=8080", "--hostname-strict=false", "--import-realm", "--bootstrap-admin-username=admin", "--bootstrap-admin-password=admin"]
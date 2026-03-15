FROM quay.io/keycloak/keycloak:24.0.3

ENV BUILD_VERSION=4
ENV KEYCLOAK_ADMIN=admin
ENV KEYCLOAK_ADMIN_PASSWORD=admin
ENV KC_HTTP_ENABLED=true
ENV KC_HOSTNAME_STRICT=false
ENV KC_PROXY=edge
ENV KC_CACHE=local
ENV JAVA_OPTS_APPEND="-Xms64m -Xmx128m"

COPY fitzy-realm.json /opt/keycloak/data/import/fitzy-realm.json

EXPOSE 8080

ENTRYPOINT ["/opt/keycloak/bin/kc.sh"]
CMD ["start-dev", "--http-port=8080", "--import-realm"]
#!/usr/bin/env bash

# Run it:
# chmod +x setup_openwebui_https.sh
# sudo ./setup_openwebui_https.sh

set -euo pipefail

# -----------------------
# Configuration - EDIT ME
# -----------------------
SERVER_NAME="your.server.example.com"   # <-- change to your domain or public IP
CERT_DAYS=365
SSL_DIR="/etc/nginx/ssl"
NGINX_CONF_DIR="/etc/nginx/conf.d"
NGINX_CONF_FILE="${NGINX_CONF_DIR}/openwebui.conf"
PROXY_LISTEN_PORT=443
BACKUP_SUFFIX="$(date +%Y%m%d%H%M%S)"
# -----------------------

echo "==> Starting Open WebUI HTTPS setup"

# Detect package manager
if command -v yum >/dev/null 2>&1 || command -v dnf >/dev/null 2>&1; then
  PKG_MGR="yum"
  if command -v dnf >/dev/null 2>&1; then
    PKG_MGR="dnf"
  fi
elif command -v apt-get >/dev/null 2>&1; then
  PKG_MGR="apt"
else
  echo "Unsupported package manager. Please install nginx, curl and openssl manually."
  exit 1
fi

# If SERVER_NAME left as placeholder, try to detect public IP using checkip.amazonaws.com
if [ "${SERVER_NAME}" = "your.server.example.com" ]; then
  echo "NOTICE: SERVER_NAME is the default placeholder. Attempting to detect public IP via http://checkip.amazonaws.com ..."
  # Ensure curl is installed
  if ! command -v curl >/dev/null 2>&1; then
    echo "curl not found — installing curl"
    if [ "$PKG_MGR" = "apt" ]; then
      apt-get update
      DEBIAN_FRONTEND=noninteractive apt-get install -y curl || { echo "Failed to install curl via apt-get"; }
    else
      $PKG_MGR install -y curl || { echo "Failed to install curl via $PKG_MGR"; }
    fi
  fi

  if command -v curl >/dev/null 2>&1; then
    # fetch IP and trim whitespace/newlines
    DETECTED_IP="$(curl -s http://checkip.amazonaws.com || true)"
    # Remove whitespace
    DETECTED_IP="$(echo "${DETECTED_IP}" | tr -d '[:space:]')"
    if [ -n "${DETECTED_IP}" ]; then
      echo "Detected public IP: ${DETECTED_IP}. Setting SERVER_NAME to this IP."
      SERVER_NAME="${DETECTED_IP}"
    else
      echo "WARNING: Could not detect public IP from checkip.amazonaws.com. Please set SERVER_NAME manually."
    fi
  else
    echo "WARNING: curl is not available and could not be installed. Please set SERVER_NAME manually."
  fi
fi

if [ "$SERVER_NAME" = "your.server.example.com" ]; then
  echo "WARNING: You still have SERVER_NAME at the default placeholder. Edit the script and set SERVER_NAME to your domain or IP if you want a specific value."
fi

install_nginx() {
  echo "==> Installing nginx (if missing)"
  if ! command -v nginx >/dev/null 2>&1; then
    if [ "$PKG_MGR" = "apt" ]; then
      apt-get update
      DEBIAN_FRONTEND=noninteractive apt-get install -y nginx openssl || { echo "apt install failed"; exit 1; }
    else
      $PKG_MGR install -y nginx openssl || { echo "$PKG_MGR install failed"; exit 1; }
    fi
  else
    echo "nginx already installed"
    # ensure openssl present
    if ! command -v openssl >/dev/null 2>&1; then
      if [ "$PKG_MGR" = "apt" ]; then
        apt-get update
        DEBIAN_FRONTEND=noninteractive apt-get install -y openssl
      else
        $PKG_MGR install -y openssl
      fi
    fi
  fi
}

create_ssl() {
  echo "==> Creating SSL directory: ${SSL_DIR}"
  mkdir -p "${SSL_DIR}"
  chmod 700 "${SSL_DIR}"

  KEY_FILE="${SSL_DIR}/openwebui.${SERVER_NAME}.key"
  CRT_FILE="${SSL_DIR}/openwebui.${SERVER_NAME}.crt"

  if [ -f "${KEY_FILE}" ] || [ -f "${CRT_FILE}" ]; then
    echo "Existing cert/key found. Backing up with suffix ${BACKUP_SUFFIX}"
    [ -f "${KEY_FILE}" ] && mv "${KEY_FILE}" "${KEY_FILE}.${BACKUP_SUFFIX}"
    [ -f "${CRT_FILE}" ] && mv "${CRT_FILE}" "${CRT_FILE}.${BACKUP_SUFFIX}"
  fi

  # Create a non-interactive self-signed cert. Uses CN=SERVER_NAME
  echo "==> Generating self-signed certificate for ${SERVER_NAME} (days=${CERT_DAYS})"
  openssl req -x509 -nodes -newkey rsa:2048 \
    -keyout "${KEY_FILE}" \
    -out "${CRT_FILE}" \
    -days "${CERT_DAYS}" \
    -subj "/C=US/ST=State/L=City/O=Org/OU=OrgUnit/CN=${SERVER_NAME}"

  chmod 600 "${KEY_FILE}"
  chmod 644 "${CRT_FILE}"

  echo "Created:"
  echo "  key: ${KEY_FILE}"
  echo "  crt: ${CRT_FILE}"
}

write_nginx_conf() {
  echo "==> Writing nginx config to ${NGINX_CONF_FILE}"
  # backup existing config if present
  if [ -f "${NGINX_CONF_FILE}" ]; then
    echo "Backing up existing ${NGINX_CONF_FILE} -> ${NGINX_CONF_FILE}.${BACKUP_SUFFIX}"
    mv "${NGINX_CONF_FILE}" "${NGINX_CONF_FILE}.${BACKUP_SUFFIX}"
  fi

  cat > "${NGINX_CONF_FILE}" <<EOF
# openwebui reverse proxy (auto-generated)
server {
    listen ${PROXY_LISTEN_PORT} ssl;
    server_name ${SERVER_NAME};

    ssl_certificate     ${SSL_DIR}/openwebui.${SERVER_NAME}.crt;
    ssl_certificate_key ${SSL_DIR}/openwebui.${SERVER_NAME}.key;

    # TLS settings (minimal)
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Proxy to local Open WebUI running on port 3000
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}

server {
    listen 80;
    server_name ${SERVER_NAME};
    # Optional: redirect plain HTTP to HTTPS
    return 301 https://\$host\$request_uri;
}
EOF

  echo "Nginx config written."
}

enable_and_restart_nginx() {
  echo "==> Enabling and starting nginx"
  if command -v systemctl >/dev/null 2>&1; then
    systemctl enable nginx || true
    systemctl restart nginx
  else
    service nginx restart || true
  fi

  echo "Testing nginx configuration"
  nginx -t
}

post_notes() {
  echo
  echo "==> Done!"
  echo "Access https://${SERVER_NAME} in your browser (you will see a security warning for a self-signed cert)."
  echo
  echo "IMPORTANT: Open port 443 in your EC2 Security Group (and 80 if you want HTTP->HTTPS redirect)."
  echo " - To allow external traffic, update the Security Group attached to your instance in the AWS Console."
  echo
  echo "If you prefer a trusted cert with automatic renewal, consider using certbot/Let's Encrypt instead."
  echo
  echo "If nginx fails to proxy: ensure Open WebUI is running on host port 3000 and listening on 127.0.0.1:3000 or 0.0.0.0:3000."
}

# --------------------------
# Run tasks
# --------------------------
install_nginx
create_ssl
write_nginx_conf
enable_and_restart_nginx
post_notes
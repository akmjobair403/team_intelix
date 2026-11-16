#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
read -r -p "Choose admin username: " ADMIN_USERNAME
while true; do
  read -r -s -p "Choose admin password (at least 14 characters): " ADMIN_PASSWORD; echo
  if [ "${#ADMIN_PASSWORD}" -ge 14 ]; then break; fi
  echo "Password is too short. Please use at least 14 characters."
done
SESSION_SECRET="$(node -e "process.stdout.write(require('node:crypto').randomBytes(48).toString('hex'))")"
cat > .env <<EOF
ADMIN_USERNAME=${ADMIN_USERNAME}
ADMIN_PASSWORD=${ADMIN_PASSWORD}
SESSION_SECRET=${SESSION_SECRET}
NODE_ENV=development
PORT=8000
EOF
chmod 600 .env
echo "Admin credentials saved privately in .env (not in browser code)."
echo "Start the site with: npm start"

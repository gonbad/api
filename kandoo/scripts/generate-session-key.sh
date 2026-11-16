#!/usr/bin/env bash
set -euo pipefail

# Generate a new (session_id, api_key) pair on the remote server
# and record it in the project's gitignored local credentials file.

WORKSPACE_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
PROJECT_ID="${1:-001-eitaa}"
SESSION_NAME="${2:-session-$(date +%s)}"

SERVER_HOST="82.39.165.56"
SERVER_USER="root"
SSH_KEY="$WORKSPACE_ROOT/docs/kandoo/secrets/id_ed25519"
LOCAL_CREDENTIALS="$WORKSPACE_ROOT/docs/projects/$PROJECT_ID/secrets/credentials.md"

if [ ! -f "$SSH_KEY" ]; then
  echo "Error: SSH private key not found at $SSH_KEY" >&2
  exit 1
fi

mkdir -p "$(dirname "$LOCAL_CREDENTIALS")"
chmod 700 "$(dirname "$LOCAL_CREDENTIALS")"

echo "Generating credentials for $PROJECT_ID ($SESSION_NAME)..."

# Generate API key locally using openssl
API_KEY=$(openssl rand -hex 24)

# Ensure remote secrets directory exists and record on server
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=accept-new -o IdentitiesOnly=yes \
  "$SERVER_USER@$SERVER_HOST" \
  "mkdir -p /opt/kandoo/projects/$PROJECT_ID/secrets && \
   chmod 700 /opt/kandoo/projects/$PROJECT_ID/secrets && \
   echo '$SESSION_NAME:$API_KEY' >> /opt/kandoo/projects/$PROJECT_ID/secrets/allowed_keys.txt && \
   chmod 600 /opt/kandoo/projects/$PROJECT_ID/secrets/allowed_keys.txt"

# Append to local gitignored credentials file
if [ ! -f "$LOCAL_CREDENTIALS" ]; then
  cat << EOF > "$LOCAL_CREDENTIALS"
# $PROJECT_ID Credentials

This file is gitignored and contains private session keys and tokens.
Never commit this file or paste its contents into public documentation.

## Provisioned Sessions

| Session Name | API Key | Created At |
| --- | --- | --- |
EOF
  chmod 600 "$LOCAL_CREDENTIALS"
fi

CREATED_AT=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
echo "| $SESSION_NAME | $API_KEY | $CREATED_AT |" >> "$LOCAL_CREDENTIALS"

echo "Success! Provisioned session '$SESSION_NAME' with API key on server and saved to:"
echo "  $LOCAL_CREDENTIALS"

#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   bash scripts/deploy-azure-containerapps.sh
#
# Requires .env/.env.local to contain runtime secrets.

SCRIPT_DIR="$(dirname "$0")"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

if [[ -f "$ROOT_DIR/.env" ]]; then
  # shellcheck disable=SC1091
  source "$ROOT_DIR/.env"
fi

if [[ -f "$ROOT_DIR/.env.local" ]]; then
  # shellcheck disable=SC1091
  source "$ROOT_DIR/.env.local"
fi

required_vars=(
  DATABASE_URL
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  CLERK_SECRET_KEY
  CRON_SECRET
  PII_ACTIVE_KEY_ID
  PII_KEYRING_JSON
  PII_HASH_KEY
)

for var in "${required_vars[@]}"; do
  if [[ -z "${!var:-}" ]]; then
    echo "Missing required environment variable: $var" >&2
    exit 1
  fi
done

if [[ -z "${AZURE_STORAGE_CONNECTION_STRING:-}" && -z "${AZURE_STORAGE_ACCOUNT_NAME:-}" && -z "${AZURE_STORAGE_BLOB_ENDPOINT:-}" ]]; then
  echo "Missing Azure Storage configuration. Set AZURE_STORAGE_ACCOUNT_NAME, AZURE_STORAGE_BLOB_ENDPOINT, or AZURE_STORAGE_CONNECTION_STRING." >&2
  exit 1
fi

RG="angeltouch"
ENV_NAME="angeltouch-env"
APP_NAME="ca-angeltouch-web"
JOB_NAME="caj-shift-reminders"
ACR_NAME="acrangeltouch7698"
IDENTITY_NAME="uai-angeltouch-workload"
IMAGE_REPO="angeltouch-web"
IMAGE_TAG="$(date +%Y%m%d%H%M%S)"
IMAGE="$ACR_NAME.azurecr.io/$IMAGE_REPO:$IMAGE_TAG"

echo "Building image: $IMAGE"
az acr build \
  --registry "$ACR_NAME" \
  --image "$IMAGE_REPO:$IMAGE_TAG" \
  --file "$ROOT_DIR/Dockerfile" \
  --build-arg NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" \
  --build-arg CLERK_SECRET_KEY="$CLERK_SECRET_KEY" \
  --build-arg NEXT_PUBLIC_CLERK_SIGN_IN_URL="${NEXT_PUBLIC_CLERK_SIGN_IN_URL:-/sign-in}" \
  --build-arg NEXT_PUBLIC_CLERK_SIGN_UP_URL="${NEXT_PUBLIC_CLERK_SIGN_UP_URL:-/sign-up}" \
  --build-arg NEXT_PUBLIC_SITE_URL="${NEXT_PUBLIC_SITE_URL:-https://angeltouch.services}" \
  --build-arg NEXT_PUBLIC_DEMO_MODE="${NEXT_PUBLIC_DEMO_MODE:-false}" \
  --build-arg DATABASE_URL="$DATABASE_URL" \
  "$ROOT_DIR"

echo "Ensuring managed identity exists"
if ! az identity show --resource-group "$RG" --name "$IDENTITY_NAME" >/dev/null 2>&1; then
  az identity create --resource-group "$RG" --name "$IDENTITY_NAME" --location "eastus" >/dev/null
fi

IDENTITY_ID="$(az identity show --resource-group "$RG" --name "$IDENTITY_NAME" --query id -o tsv)"
IDENTITY_PRINCIPAL_ID="$(az identity show --resource-group "$RG" --name "$IDENTITY_NAME" --query principalId -o tsv)"
IDENTITY_CLIENT_ID="$(az identity show --resource-group "$RG" --name "$IDENTITY_NAME" --query clientId -o tsv)"
ACR_ID="$(az acr show --name "$ACR_NAME" --resource-group "rg-angeltouch-eus" --query id -o tsv)"

echo "Assigning AcrPull role"
az role assignment create \
  --assignee-object-id "$IDENTITY_PRINCIPAL_ID" \
  --assignee-principal-type ServicePrincipal \
  --scope "$ACR_ID" \
  --role AcrPull >/dev/null 2>&1 || true

echo "Deploying container app"
if az containerapp show --name "$APP_NAME" --resource-group "$RG" >/dev/null 2>&1; then
  az containerapp identity assign \
    --name "$APP_NAME" \
    --resource-group "$RG" \
    --user-assigned "$IDENTITY_ID" >/dev/null

  az containerapp registry set \
    --name "$APP_NAME" \
    --resource-group "$RG" \
    --server "$ACR_NAME.azurecr.io" \
    --identity "$IDENTITY_ID" >/dev/null

  az containerapp update \
    --name "$APP_NAME" \
    --resource-group "$RG" \
    --image "$IMAGE" >/dev/null
else
  az containerapp create \
    --name "$APP_NAME" \
    --resource-group "$RG" \
    --environment "$ENV_NAME" \
    --image "$IMAGE" \
    --target-port 3000 \
    --ingress external \
    --min-replicas 1 \
    --max-replicas 2 \
    --cpu 0.5 \
    --memory 1Gi \
    --user-assigned "$IDENTITY_ID" \
    --registry-server "$ACR_NAME.azurecr.io" \
    --registry-identity "$IDENTITY_ID" >/dev/null
fi

APP_FQDN="$(az containerapp show --name "$APP_NAME" --resource-group "$RG" --query properties.configuration.ingress.fqdn -o tsv)"
APP_BASE_URL="https://$APP_FQDN"

app_secrets=(
  "database-url=$DATABASE_URL"
  "clerk-secret-key=$CLERK_SECRET_KEY"
  "cron-secret=$CRON_SECRET"
  "pii-active-key-id=$PII_ACTIVE_KEY_ID"
  "pii-keyring-json=$PII_KEYRING_JSON"
  "pii-hash-key=$PII_HASH_KEY"
)

if [[ -n "${RESEND_API_KEY:-}" ]]; then
  app_secrets+=("resend-api-key=$RESEND_API_KEY")
fi

if [[ -n "${AZURE_STORAGE_CONNECTION_STRING:-}" ]]; then
  app_secrets+=("azure-storage-connection-string=$AZURE_STORAGE_CONNECTION_STRING")
fi

if [[ -n "${TWILIO_ACCOUNT_SID:-}" ]]; then
  app_secrets+=("twilio-account-sid=$TWILIO_ACCOUNT_SID")
fi

if [[ -n "${TWILIO_AUTH_TOKEN:-}" ]]; then
  app_secrets+=("twilio-auth-token=$TWILIO_AUTH_TOKEN")
fi

if [[ -n "${TWILIO_PHONE_NUMBER:-}" ]]; then
  app_secrets+=("twilio-phone-number=$TWILIO_PHONE_NUMBER")
fi

az containerapp secret set \
  --name "$APP_NAME" \
  --resource-group "$RG" \
  --secrets "${app_secrets[@]}" >/dev/null

app_env_vars=(
  "NODE_ENV=production"
  "PORT=3000"
  "NEXT_PUBLIC_APP_URL=$APP_BASE_URL"
  "NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL:-$APP_BASE_URL}"
  "NEXT_PUBLIC_DEMO_MODE=${NEXT_PUBLIC_DEMO_MODE:-false}"
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"
  "NEXT_PUBLIC_CLERK_SIGN_IN_URL=${NEXT_PUBLIC_CLERK_SIGN_IN_URL:-/sign-in}"
  "NEXT_PUBLIC_CLERK_SIGN_UP_URL=${NEXT_PUBLIC_CLERK_SIGN_UP_URL:-/sign-up}"
  "ADMIN_EMAIL=${ADMIN_EMAIL:-admin@angeltouch.services}"
  "FROM_EMAIL=${FROM_EMAIL:-Angel Touch Homecare <noreply@angeltouch.services>}"
  "AZURE_CLIENT_ID=$IDENTITY_CLIENT_ID"
  "AZURE_STORAGE_ACCOUNT_NAME=${AZURE_STORAGE_ACCOUNT_NAME:-}"
  "AZURE_STORAGE_BLOB_ENDPOINT=${AZURE_STORAGE_BLOB_ENDPOINT:-}"
  "AZURE_STORAGE_CONTAINER=${AZURE_STORAGE_CONTAINER:-uploads}"
  "AZURE_STORAGE_UPLOADS_CONTAINER=${AZURE_STORAGE_UPLOADS_CONTAINER:-${AZURE_STORAGE_CONTAINER:-uploads}}"
  "AZURE_STORAGE_MARKETING_CONTAINER=${AZURE_STORAGE_MARKETING_CONTAINER:-${AZURE_STORAGE_CONTAINER:-uploads}}"
  "AZURE_STORAGE_COMPLIANCE_CONTAINER=${AZURE_STORAGE_COMPLIANCE_CONTAINER:-${AZURE_STORAGE_CONTAINER:-uploads}}"
  "DATABASE_URL=secretref:database-url"
  "CLERK_SECRET_KEY=secretref:clerk-secret-key"
  "CRON_SECRET=secretref:cron-secret"
  "PII_ACTIVE_KEY_ID=secretref:pii-active-key-id"
  "PII_KEYRING_JSON=secretref:pii-keyring-json"
  "PII_HASH_KEY=secretref:pii-hash-key"
)

if [[ -n "${RESEND_API_KEY:-}" ]]; then
  app_env_vars+=("RESEND_API_KEY=secretref:resend-api-key")
fi

if [[ -n "${AZURE_STORAGE_CONNECTION_STRING:-}" ]]; then
  app_env_vars+=("AZURE_STORAGE_CONNECTION_STRING=secretref:azure-storage-connection-string")
fi

if [[ -n "${TWILIO_ACCOUNT_SID:-}" ]]; then
  app_env_vars+=("TWILIO_ACCOUNT_SID=secretref:twilio-account-sid")
fi

if [[ -n "${TWILIO_AUTH_TOKEN:-}" ]]; then
  app_env_vars+=("TWILIO_AUTH_TOKEN=secretref:twilio-auth-token")
fi

if [[ -n "${TWILIO_PHONE_NUMBER:-}" ]]; then
  app_env_vars+=("TWILIO_PHONE_NUMBER=secretref:twilio-phone-number")
fi

az containerapp update \
  --name "$APP_NAME" \
  --resource-group "$RG" \
  --set-env-vars "${app_env_vars[@]}" >/dev/null

echo "Deploying shift reminder job"
if az containerapp job show --name "$JOB_NAME" --resource-group "$RG" >/dev/null 2>&1; then
  az containerapp job identity assign \
    --name "$JOB_NAME" \
    --resource-group "$RG" \
    --user-assigned "$IDENTITY_ID" >/dev/null

  az containerapp job registry set \
    --name "$JOB_NAME" \
    --resource-group "$RG" \
    --server "$ACR_NAME.azurecr.io" \
    --identity "$IDENTITY_ID" >/dev/null

  az containerapp job update \
    --name "$JOB_NAME" \
    --resource-group "$RG" \
    --image "$IMAGE" \
    --cron-expression "0 * * * *" \
    --cpu 0.25 \
    --memory 0.5Gi \
    --command node \
    --args scripts/run-shift-reminders-cron.mjs \
    >/dev/null
else
  az containerapp job create \
    --name "$JOB_NAME" \
    --resource-group "$RG" \
    --environment "$ENV_NAME" \
    --trigger-type Schedule \
    --cron-expression "0 * * * *" \
    --replica-timeout 1800 \
    --replica-retry-limit 1 \
    --replica-completion-count 1 \
    --parallelism 1 \
    --image "$IMAGE" \
    --cpu 0.25 \
    --memory 0.5Gi \
    --command node \
    --args scripts/run-shift-reminders-cron.mjs \
    --mi-user-assigned "$IDENTITY_ID" \
    --registry-server "$ACR_NAME.azurecr.io" \
    --registry-identity "$IDENTITY_ID" >/dev/null
fi

az containerapp job secret set \
  --name "$JOB_NAME" \
  --resource-group "$RG" \
  --secrets \
  app-base-url="$APP_BASE_URL" \
  cron-secret="$CRON_SECRET" >/dev/null

az containerapp job update \
  --name "$JOB_NAME" \
  --resource-group "$RG" \
  --set-env-vars \
  APP_BASE_URL=secretref:app-base-url \
  CRON_SECRET=secretref:cron-secret \
  DAY_BEFORE_UTC_HOUR=18 >/dev/null

echo "Deployment complete"
echo "App URL: $APP_BASE_URL"
echo "Job: $JOB_NAME (hourly; runs day-before reminders at 18:00 UTC)"

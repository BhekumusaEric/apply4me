#!/usr/bin/env bash
# Sync all production environment variables to Vercel via REST API
# Project: apply4me (prj_sAnPBvyJnRafFiI9ZuRz0okiDoxK)
# Usage: VERCEL_TOKEN=<your_token> bash scripts/sync-vercel-env.sh

set -e

TOKEN="${VERCEL_TOKEN:?Please set VERCEL_TOKEN environment variable}"
PROJECT_ID="prj_sAnPBvyJnRafFiI9ZuRz0okiDoxK"
TEAM_ID="bhekumusa-eric-ntshwenyas-projects"

echo "============================================"
echo " Apply4Me — Vercel Environment Sync"
echo "============================================"

# Helper: get existing env var IDs
get_env_ids() {
  curl -s "https://api.vercel.com/v9/projects/$PROJECT_ID/env?teamId=$TEAM_ID" \
    -H "Authorization: Bearer $TOKEN" | \
    python3 -c "import sys,json; data=json.load(sys.stdin); [print(e['id']+'='+e['key']) for e in data.get('envs', [])]"
}

# Helper: delete a var by ID
delete_env() {
  local ID=$1
  local KEY=$2
  echo "  🗑  Deleting $KEY ($ID)"
  curl -s -X DELETE "https://api.vercel.com/v9/projects/$PROJECT_ID/env/$ID?teamId=$TEAM_ID" \
    -H "Authorization: Bearer $TOKEN" > /dev/null
}

# Helper: upsert a variable (add + overwrite if exists)
upsert_env() {
  local KEY=$1
  local VALUE=$2
  local TYPE=${3:-"plain"}

  echo "  ✅ Setting $KEY"
  curl -s -X POST "https://api.vercel.com/v10/projects/$PROJECT_ID/env?teamId=$TEAM_ID&upsert=true" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"key\":\"$KEY\",\"value\":$(echo $VALUE | python3 -c 'import sys,json; print(json.dumps(sys.stdin.read().strip()))'),\"type\":\"$TYPE\",\"target\":[\"production\",\"preview\"]}" > /dev/null
}

echo ""
echo "🔍 Fetching existing env variables..."
ALL_ENVS=$(curl -s "https://api.vercel.com/v9/projects/$PROJECT_ID/env?teamId=$TEAM_ID" \
  -H "Authorization: Bearer $TOKEN")

echo ""
echo "🗑  Removing legacy POSTGRES_ and SUPABASE_ (non-NEXT_PUBLIC) variables..."
echo "$ALL_ENVS" | python3 -c "
import sys, json
data = json.load(sys.stdin)
for e in data.get('envs', []):
    key = e['key']
    if key.startswith('POSTGRES_') or key in ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'SUPABASE_JWT_SECRET']:
        print(e['id'] + '=' + key)
" | while IFS='=' read -r ID KEY; do
  delete_env "$ID" "$KEY"
done

echo ""
echo "✅ Adding/Updating production environment variables..."

# Core Supabase
upsert_env "NEXT_PUBLIC_SUPABASE_URL" "https://upuviiaolpbqhmjwxbtq.supabase.co"
upsert_env "NEXT_PUBLIC_SUPABASE_ANON_KEY" "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwdXZpaWFvbHBicWhtand4YnRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1OTAyMTUsImV4cCI6MjA4ODE2NjIxNX0.UgvptOFZkbo-IYgviRiLM7eukBd9eExBE8WImgO8vTM" "sensitive"
upsert_env "SUPABASE_SERVICE_ROLE_KEY" "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwdXZpaWFvbHBicWhtand4YnRxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjU5MDIxNSwiZXhwIjoyMDg4MTY2MjE1fQ.OmDNfK73ixLI3W0rAy99th0SdMwJ3dNAfSyZnrv51j4" "sensitive"

# App URLs
upsert_env "NEXT_PUBLIC_APP_URL" "https://apply4me-eta.vercel.app"
upsert_env "NEXT_PUBLIC_APP_NAME" "Apply4Me"
upsert_env "NEXTAUTH_URL" "https://apply4me-eta.vercel.app"
upsert_env "NEXTAUTH_SECRET" "apply4me-nextauth-secret-prod-2024" "sensitive"
upsert_env "NODE_ENV" "production"

# Email
upsert_env "RESEND_API_KEY" "re_HSTh6Pqp_FzFJSyE1hgwL1mT4sJ1bBfxf" "sensitive"
upsert_env "EMAIL_FROM" "Apply4Me <notifications@apply4me.co.za>"

# PayFast
upsert_env "PAYFAST_MERCHANT_ID" "30341633"
upsert_env "PAYFAST_MERCHANT_KEY" "e9o4leaxbcyhk" "sensitive"
upsert_env "PAYFAST_PASSPHRASE" "jt7NOE43FZPn" "sensitive"

# Cron
upsert_env "CRON_SECRET" "apply4me-prod-cron-2024" "sensitive"

echo ""
echo "🚀 Triggering Vercel redeployment..."
REDEPLOY=$(curl -s -X POST "https://api.vercel.com/v13/deployments?teamId=$TEAM_ID&forceNew=1" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"apply4me\",
    \"gitSource\": {
      \"type\": \"github\",
      \"repoId\": \"$(curl -s "https://api.vercel.com/v9/projects/$PROJECT_ID?teamId=$TEAM_ID" -H "Authorization: Bearer $TOKEN" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('link',{}).get('repoId',''))")\"
    }
  }")
echo "$REDEPLOY" | python3 -c "import sys,json; d=json.load(sys.stdin); print('Deployment ID:', d.get('id','error'), '| URL:', d.get('url','N/A'))" 2>/dev/null || echo "$REDEPLOY" | head -100

echo ""
echo "============================================"
echo " ✅ Sync complete!"
echo "============================================"

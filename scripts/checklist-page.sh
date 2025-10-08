#!/usr/bin/env bash
set -euo pipefail

# Page Checklist Runner
# Usage:
#   scripts/checklist-page.sh --route "/admin/users" \
#     --api "/api/users,/api/users/{id}" \
#     --files "src/app/(dashboard)/admin/users/page.tsx,src/components/admin/users/UsersTable.tsx" \
#     --health "/api/health"

ROUTE=""
APIS=""
FILES=""
HEALTH="/api/health"
HOST="http://localhost:8080"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --route)
      ROUTE="$2"; shift 2 ;;
    --api)
      APIS="$2"; shift 2 ;;
    --files)
      FILES="$2"; shift 2 ;;
    --health)
      HEALTH="$2"; shift 2 ;;
    --host)
      HOST="$2"; shift 2 ;;
    *) echo "Unknown arg: $1"; exit 1 ;;
  esac
done

echo "== Page Checklist =="
echo "Route:   ${ROUTE:-'(not specified)'}"
echo "APIs:    ${APIS:-'(none)'}"
echo "Files:   ${FILES:-'(none)'}"
echo "Host:    ${HOST}"
echo "Health:  ${HEALTH}"

ok() { echo "✓ $1"; }
warn() { echo "⚠ $1"; }
err() { echo "✗ $1"; }

step() { echo; echo "== $1 =="; }

step "Healthcheck"
if curl -fsS "${HOST}${HEALTH}" >/dev/null; then ok "Health OK"; else err "Health failed: ${HOST}${HEALTH}"; fi

step "Frontend Route & Files"
if [[ -n "$ROUTE" ]]; then
  # best-effort check: presence of a page file matching route
  # admin/users -> src/app/(dashboard)/admin/users/page.tsx
  CANDIDATE="src/app/(dashboard)${ROUTE%/}/page.tsx"
  if [[ -f "$CANDIDATE" ]]; then ok "Route page exists: $CANDIDATE"; else warn "Route page not found (checked: $CANDIDATE)"; fi
fi

IFS=',' read -r -a FILE_ARR <<<"${FILES}"
for f in "${FILE_ARR[@]}"; do
  [[ -z "$f" ]] && continue
  if [[ -f "$f" ]]; then ok "File exists: $f"; else err "Missing file: $f"; fi
done

step "Typecheck & Lint"
if npm run -s typecheck >/dev/null; then ok "Typecheck passed"; else warn "Typecheck issues"; fi
if npm run -s lint >/dev/null; then ok "Lint passed"; else warn "Lint issues"; fi

step "API Endpoints"
IFS=',' read -r -a API_ARR <<<"${APIS}"
for api in "${API_ARR[@]}"; do
  [[ -z "$api" ]] && continue
  URL="${HOST}${api//\{id\}/_sample_}"
  # Probe with GET only as a safe check
  if curl -fsS -o /dev/null -w "%{http_code}" "$URL" | grep -qE '2..|3..'; then
    ok "GET $api reachable"
  else
    warn "GET $api not reachable"
  fi
done

step "Prisma Schema & DB"
if npx -y prisma generate >/dev/null 2>&1; then ok "Prisma generate"; else warn "Prisma generate failed"; fi

step "Summary"
echo "Done. Review warnings above."



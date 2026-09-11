#!/usr/bin/env bash
#
# MCITY.UZ — kodni yangilash.
#
# GitHub'ga yangi o'zgarish qo'yganingizdan keyin serverda shuni ishga
# tushiring:
#
#   sudo /opt/mcity/app/deploy/update.sh
#
# Build muvaffaqiyatsiz bo'lsa — ESKI VERSIYA ishlashda davom etadi,
# sayt o'chib qolmaydi.

set -euo pipefail

APP_DIR="/opt/mcity/app"
APP_USER="mcity"
BRANCH="${MCITY_BRANCH:-main}"

blue()  { printf '\033[1;34m==> %s\033[0m\n' "$*"; }
green() { printf '\033[1;32m✓   %s\033[0m\n' "$*"; }
die()   { printf '\033[1;31mXATO: %s\033[0m\n' "$*" >&2; exit 1; }

[[ $EUID -eq 0 ]] || die "sudo bilan ishga tushiring: sudo $0"
[[ -d "$APP_DIR/.git" ]] || die "$APP_DIR topilmadi — avval setup-server.sh ni ishga tushiring"

blue "GitHub'dan yangi kod olinmoqda"
sudo -u "$APP_USER" git -C "$APP_DIR" fetch origin "$BRANCH"
OLD=$(sudo -u "$APP_USER" git -C "$APP_DIR" rev-parse HEAD)
sudo -u "$APP_USER" git -C "$APP_DIR" reset --hard "origin/$BRANCH"
NEW=$(sudo -u "$APP_USER" git -C "$APP_DIR" rev-parse HEAD)

if [[ "$OLD" == "$NEW" ]]; then
  green "Yangilik yo'q — kod allaqachon eng so'nggi holatda"
fi

blue "Yig'ilmoqda (build)"
# Avval vaqtinchalik papkaga yig'amiz: build yiqilsa, ishlab turgan
# versiyaga zarar yetmaydi.
if ! sudo -u "$APP_USER" bash -lc "cd '$APP_DIR' && set -a && . ./.env.production && set +a && npm ci --no-audit --no-fund && npm run build"; then
  die "Build yiqildi — eski versiya ishlashda davom etmoqda. Loglarga qarang."
fi
[[ -f "$APP_DIR/.output/server/index.mjs" ]] || die "Build natijasi topilmadi"
green "Build tayyor"

blue "Xizmat qayta ishga tushirilmoqda"
systemctl restart mcity
sleep 3
systemctl is-active --quiet mcity || {
  journalctl -u mcity -n 40 --no-pager
  die "Xizmat ko'tarilmadi"
}

# Haqiqatan javob berayotganini tekshiramiz
for i in 1 2 3 4 5; do
  if curl -fsS -o /dev/null http://127.0.0.1:3000/uz; then
    green "Sayt javob bermoqda"
    exit 0
  fi
  sleep 2
done

journalctl -u mcity -n 40 --no-pager
die "Sayt javob bermayapti"

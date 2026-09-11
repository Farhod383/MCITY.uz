#!/usr/bin/env bash
#
# MCITY.UZ — Oracle Cloud (Always Free) serverini bir marta sozlash skripti.
#
# Ubuntu 22.04 / 24.04 uchun. ARM (Ampere A1) va x86 (E2.1.Micro) —
# ikkalasida ham ishlaydi.
#
# ISHLATISH (serverga ssh bilan kirib):
#
#   curl -fsSL https://raw.githubusercontent.com/Farhod383/Mcity_siyt/main/deploy/setup-server.sh -o setup-server.sh
#   chmod +x setup-server.sh
#   sudo ./setup-server.sh
#
# Skript nima qiladi:
#   1. Tizimni yangilaydi, kerakli paketlarni o'rnatadi
#   2. Node.js 22 ni o'rnatadi
#   3. 2 GB swap yaratadi (kam xotirali VM'da build yiqilmasligi uchun)
#   4. `mcity` foydalanuvchisini yaratadi va kodni /opt/mcity/app ga klonlaydi
#   5. .env.production faylini so'raydi va yozadi
#   6. Loyihani yig'adi (build)
#   7. systemd xizmatini o'rnatadi va yoqadi  -> sayt uxlab qolmaydi
#   8. nginx'ni sozlaydi
#   9. 80/443 portlarni ochadi (iptables)
#
# HTTPS sertifikat OXIRIDA alohida olinadi — DNS mcity.uz ni shu serverga
# ko'rsatgandan KEYIN:
#   sudo certbot --nginx -d mcity.uz -d www.mcity.uz

set -euo pipefail

REPO="${MCITY_REPO:-https://github.com/Farhod383/Mcity_siyt.git}"
BRANCH="${MCITY_BRANCH:-main}"
APP_DIR="/opt/mcity/app"
APP_USER="mcity"
DOMAIN="${MCITY_DOMAIN:-mcity.uz}"

blue()  { printf '\033[1;34m==> %s\033[0m\n' "$*"; }
green() { printf '\033[1;32m✓   %s\033[0m\n' "$*"; }
warn()  { printf '\033[1;33m!   %s\033[0m\n' "$*"; }
die()   { printf '\033[1;31mXATO: %s\033[0m\n' "$*" >&2; exit 1; }

[[ $EUID -eq 0 ]] || die "Skriptni sudo bilan ishga tushiring: sudo ./setup-server.sh"

# ---------------------------------------------------------------- 1. paketlar
blue "Tizim yangilanmoqda va paketlar o'rnatilmoqda"
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y -qq curl git nginx ufw ca-certificates gnupg >/dev/null
green "Paketlar o'rnatildi"

# ------------------------------------------------------------------- 2. Node
if ! command -v node >/dev/null || [[ "$(node -v | cut -c2-3)" -lt 22 ]]; then
  blue "Node.js 22 o'rnatilmoqda"
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash - >/dev/null 2>&1
  apt-get install -y -qq nodejs >/dev/null
fi
green "Node $(node -v) tayyor"

# ------------------------------------------------------------------- 3. swap
if [[ ! -f /swapfile ]]; then
  blue "2 GB swap yaratilmoqda (kam xotirali VM'da build yiqilmasligi uchun)"
  fallocate -l 2G /swapfile || dd if=/dev/zero of=/swapfile bs=1M count=2048 status=none
  chmod 600 /swapfile
  mkswap /swapfile >/dev/null
  swapon /swapfile
  grep -q '/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
  green "Swap yoqildi"
else
  green "Swap allaqachon bor"
fi

# ------------------------------------------------------- 4. foydalanuvchi/kod
id -u "$APP_USER" >/dev/null 2>&1 || {
  blue "'$APP_USER' foydalanuvchisi yaratilmoqda"
  useradd --system --create-home --home-dir /opt/mcity --shell /usr/sbin/nologin "$APP_USER"
}
mkdir -p /opt/mcity
chown -R "$APP_USER:$APP_USER" /opt/mcity

if [[ -d "$APP_DIR/.git" ]]; then
  blue "Kod allaqachon bor — yangilanmoqda"
  sudo -u "$APP_USER" git -C "$APP_DIR" fetch --depth 1 origin "$BRANCH"
  sudo -u "$APP_USER" git -C "$APP_DIR" reset --hard "origin/$BRANCH"
else
  blue "Kod klonlanmoqda: $REPO"
  sudo -u "$APP_USER" git clone --depth 1 --branch "$BRANCH" "$REPO" "$APP_DIR"
fi
green "Kod joyida: $APP_DIR"

# ------------------------------------------------------------------ 5. .env
ENV_FILE="$APP_DIR/.env.production"
if [[ ! -f "$ENV_FILE" ]]; then
  blue "Muhit o'zgaruvchilari (.env.production) yaratilmoqda"
  echo
  echo "  Supabase qiymatlarini kiriting."
  echo "  Ular Supabase panelida: Project Settings -> API"
  echo "  DIQQAT: faqat ANON / PUBLISHABLE kalitni kiriting."
  echo "          SERVICE_ROLE kalitni HECH QACHON bu yerga yozmang."
  echo
  read -rp "  VITE_SUPABASE_URL      : " SB_URL
  read -rp "  VITE_SUPABASE_ANON_KEY : " SB_KEY

  cat > "$ENV_FILE" <<EOF
# MCITY — production muhit o'zgaruvchilari
# Bu fayl git'ga tushmaydi (.gitignore'da).

VITE_SITE_URL=https://$DOMAIN
CANONICAL_HOST=$DOMAIN

VITE_SUPABASE_URL=$SB_URL
VITE_SUPABASE_ANON_KEY=$SB_KEY
EOF
  chown "$APP_USER:$APP_USER" "$ENV_FILE"
  chmod 600 "$ENV_FILE"
  green ".env.production yozildi"
else
  green ".env.production allaqachon bor — tegilmadi"
fi

# ------------------------------------------------------------------ 6. build
blue "Loyiha yig'ilmoqda (bu 3-8 daqiqa olishi mumkin)"
sudo -u "$APP_USER" bash -lc "cd '$APP_DIR' && set -a && . ./.env.production && set +a && npm ci --no-audit --no-fund && npm run build"
[[ -f "$APP_DIR/.output/server/index.mjs" ]] || die "Build natijasi topilmadi (.output/server/index.mjs)"
green "Build tayyor"

# ---------------------------------------------------------------- 7. systemd
blue "systemd xizmati o'rnatilmoqda"
install -m 644 "$APP_DIR/deploy/mcity.service" /etc/systemd/system/mcity.service
systemctl daemon-reload
systemctl enable mcity >/dev/null
systemctl restart mcity
sleep 3
systemctl is-active --quiet mcity || {
  journalctl -u mcity -n 40 --no-pager
  die "Xizmat ishga tushmadi — yuqoridagi loglarga qarang"
}
green "Xizmat ishlayapti (Restart=always — uxlab qolmaydi)"

# ------------------------------------------------------------------ 8. nginx
blue "nginx sozlanmoqda"
install -m 644 "$APP_DIR/deploy/nginx-mcity.conf" /etc/nginx/sites-available/mcity
ln -sf /etc/nginx/sites-available/mcity /etc/nginx/sites-enabled/mcity
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx
green "nginx tayyor"

# --------------------------------------------------------------- 9. portlar
blue "80/443 portlar ochilmoqda"
# Oracle Ubuntu obrazlarida iptables qoidalari oldindan yopiq turadi
if command -v netfilter-persistent >/dev/null 2>&1; then
  iptables -C INPUT -p tcp --dport 80  -j ACCEPT 2>/dev/null || iptables -I INPUT 6 -p tcp --dport 80  -j ACCEPT
  iptables -C INPUT -p tcp --dport 443 -j ACCEPT 2>/dev/null || iptables -I INPUT 6 -p tcp --dport 443 -j ACCEPT
  netfilter-persistent save >/dev/null 2>&1 || true
fi
green "Portlar ochildi (serverda)"

echo
green "TAYYOR."
echo
cat <<EOF
Sayt hozir shu serverda ishlayapti. Tekshirish:

    curl -I http://127.0.0.1:3000/uz        # 200 bo'lishi kerak
    sudo systemctl status mcity
    sudo journalctl -u mcity -f

QOLGAN 3 QADAM (qo'lda):

 1) Oracle panelida portlarni oching:
    Networking -> Virtual Cloud Networks -> <VCN> -> Security Lists ->
    Default Security List -> Add Ingress Rules
      Source: 0.0.0.0/0   Protocol: TCP   Destination Port: 80
      Source: 0.0.0.0/0   Protocol: TCP   Destination Port: 443

 2) Cloudflare DNS'da mcity.uz ni shu serverga qarating:
      A      @      <serveringizning public IP>    (Proxy: DNS only)
      A      www    <serveringizning public IP>    (Proxy: DNS only)
    Eski A/AAAA yozuvlarini o'chiring. MX/TXT larga TEGMANG.

 3) DNS tarqalgach (5-30 daqiqa) HTTPS sertifikat oling:
      sudo apt install -y certbot python3-certbot-nginx
      sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN
    Certbot sertifikatni o'zi yangilab turadi.

Keyinchalik kodni yangilash uchun:
      sudo /opt/mcity/app/deploy/update.sh
EOF

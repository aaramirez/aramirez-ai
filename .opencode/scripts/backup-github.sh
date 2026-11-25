#!/usr/bin/env bash
# Respaldo de todos los repos de una cuenta u organización de GitHub: mirror + bundle por repo.
#
# Uso:   bash .opencode/scripts/backup-github.sh <owner> [carpeta-destino]
#   owner            usuario u organización de GitHub (ej. aaramirez, GrupoConex)
#   carpeta-destino  opcional; por defecto D:\Respaldos\<owner> en Windows (si existe D:)
#                    o ~/Respaldos/<owner> en macOS/Linux. También vía BACKUP_ROOT.
#   BACKUP_JOBS      repos en paralelo (default 3)
# Requiere: gh (autenticado con acceso al owner), git, node.
# Salida en <carpeta-destino>/:
#   mirrors/<repo>.git                 git clone --mirror (incremental en corridas siguientes)
#   bundles-YYYY-MM-DD/<repo>.bundle   un archivo por repo, verificado
#   repos-YYYY-MM-DD.json              inventario de repos
#   backup-YYYY-MM-DD.log              OK / EMPTY / FAIL por repo
# Restaurar: git clone <repo>.bundle <carpeta>
set -u

OWNER=${1:-}
if [ -z "$OWNER" ]; then
  echo "Uso: bash $0 <owner> [carpeta-destino]" >&2
  exit 1
fi

if [ -n "${2:-}" ]; then
  ROOT=$2
elif [ -n "${BACKUP_ROOT:-}" ]; then
  ROOT=$BACKUP_ROOT
elif [ -d /d ]; then
  ROOT=/d/Respaldos/$OWNER
else
  ROOT=$HOME/Respaldos/$OWNER
fi
JOBS=${BACKUP_JOBS:-3}

for cmd in gh git node; do
  command -v "$cmd" >/dev/null 2>&1 || { echo "Falta '$cmd' en PATH" >&2; exit 1; }
done

# Discos sin dueños de archivo (ej. D: en Windows) hacen que git rechace los mirrors ("dubious ownership")
export GIT_CONFIG_COUNT=1 GIT_CONFIG_KEY_0=safe.directory GIT_CONFIG_VALUE_0='*'
DATE=$(date +%F)
MIRRORS=$ROOT/mirrors
BUNDLES=$ROOT/bundles-$DATE
LOG=$ROOT/backup-$DATE.log
INV=$ROOT/repos-$DATE.json
mkdir -p "$MIRRORS" "$BUNDLES"
: > "$LOG"; : > "$LOG.err"

echo "Respaldando $OWNER en $ROOT ($JOBS en paralelo)"
gh repo list "$OWNER" --limit 1000 \
  --json name,sshUrl,isPrivate,isArchived,isEmpty,diskUsage,defaultBranchRef,pushedAt \
  > "$INV" || { echo "No se pudo listar los repos de $OWNER" >&2; exit 1; }

backup_one() {
  name=$1; url=$2
  m="$MIRRORS/$name.git"
  if [ -d "$m" ]; then
    git -C "$m" remote update --prune >/dev/null 2>>"$LOG.err" || { echo "FAIL update $name" >> "$LOG"; return; }
  else
    git clone --mirror --quiet "$url" "$m" 2>>"$LOG.err" || { echo "FAIL clone $name" >> "$LOG"; return; }
  fi
  if [ -z "$(git -C "$m" for-each-ref --count=1)" ]; then
    echo "EMPTY $name" >> "$LOG"; return
  fi
  git -C "$m" bundle create "$BUNDLES/$name.bundle" --all >/dev/null 2>>"$LOG.err" \
    && git bundle verify "$BUNDLES/$name.bundle" >/dev/null 2>&1 \
    && echo "OK $name" >> "$LOG" \
    || echo "FAIL bundle $name" >> "$LOG"
}
export -f backup_one
export MIRRORS BUNDLES LOG

node -e "for (const r of require(process.argv[1])) console.log(r.name + ' ' + r.sshUrl)" "$INV" \
  | xargs -P "$JOBS" -n 2 bash -c 'backup_one "$0" "$1"'

echo "---"
echo "Total:  $(node -p "require(process.argv[1]).length" "$INV")"
echo "OK:     $(grep -c '^OK' "$LOG")"
echo "EMPTY:  $(grep -c '^EMPTY' "$LOG")"
echo "FAIL:   $(grep -c '^FAIL' "$LOG")"
grep '^FAIL' "$LOG"
du -sh "$MIRRORS" "$BUNDLES"

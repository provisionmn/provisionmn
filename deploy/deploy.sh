#!/usr/bin/env bash
#
# provision.mn stack-ийг шинэ image рүү шилжүүлэх скрипт.
#
# Энэ файл нь хостын /opt/provision/provisionmn/deploy.sh-ийн эх хувь юм —
# docker-compose.yml-тэй адилхан: засвар хийвэл хост руу хуулж тавина.
# (GitHub Actions-ийн deploy job үүнийг өөрөө шинэчилдэггүй — санаатай.
# Хостын скриптийг зөвхөн хүн солино, ингэснээр repo-д нэвтэрсэн хүн
# forced command-ийн агуулгыг чимээгүй солих боломжгүй.)
#
# authorized_keys дотор forced command болж дуудагддаг:
#
#   restrict,command="/opt/provision/provisionmn/deploy.sh" ssh-ed25519 AAAA... github-actions-deploy
#
# Тиймээс энэ түлхүүрээр холбогдсон хэн ч дурын команд ажиллуулж чадахгүй,
# зөвхөн доорх хоёр үйлдлийг SSH_ORIGINAL_COMMAND-оор дамжуулж хүснэ:
#
#   check            — stack-ийн төлвийг хэвлэнэ, юу ч өөрчлөхгүй
#   deploy [<tag>]   — өгсөн тэгийг татаж (default: latest) up -d хийнэ
#
set -euo pipefail

STACK_DIR=/opt/provision/provisionmn
IMAGE=ghcr.io/provisionmn/provisionmn
CONTAINER=provisionmn-web
HEALTH_TRIES=45   # 45 × 2s = 90 секунд

cd "$STACK_DIR"

# Forced command тул бодит хүсэлт SSH_ORIGINAL_COMMAND дотор ирнэ.
# Интерактив дуудалт (SSH_ORIGINAL_COMMAND хоосон) бол аргументыг нь авна.
request=${SSH_ORIGINAL_COMMAND:-$*}
read -r action tag extra <<<"${request:-deploy}"
action=${action:-deploy}

if [ -n "${extra:-}" ]; then
  echo "deploy.sh: илүү аргумент: $extra" >&2
  exit 2
fi

log() { printf '%s  %s\n' "$(date -Is)" "$*"; }

case "$action" in
  check)
    log "stack төлөв (${STACK_DIR})"
    docker compose ps
    ;;

  deploy)
    if [ -n "${tag:-}" ]; then
      # Зөвхөн энэ registry-ийн жирийн тэг. Ямар ч цэг, зураас, тоо, үсэг
      # зөвшөөрөгдөнө; зай, ташуу зураас, ";" зэрэг тарилга хийх тэмдэг үгүй.
      if ! printf '%s' "$tag" | grep -Eq '^[A-Za-z0-9][A-Za-z0-9._-]{0,126}$'; then
        echo "deploy.sh: буруу тэг: $tag" >&2
        exit 2
      fi
      export IMAGE_TAG="$IMAGE:$tag"
    fi

    log "deploy ${IMAGE_TAG:-$IMAGE:latest}"
    docker compose pull
    docker compose up -d

    # Dockerfile дотор HEALTHCHECK байгаа тул healthy болтол нь хүлээнэ.
    # Ингэснээр Actions-ийн ногоон дүн "контейнер асч, / хариулсан" гэсэн
    # утгатай болно — зүгээр л "up -d алдаагүй буцлаа" биш.
    for _ in $(seq "$HEALTH_TRIES"); do
      state=$(docker inspect -f '{{.State.Health.Status}}' "$CONTAINER" 2>/dev/null || echo missing)
      case "$state" in
        healthy) break ;;
        unhealthy) log "контейнер unhealthy"; docker compose logs --tail 50 web; exit 1 ;;
      esac
      sleep 2
    done

    if [ "${state:-missing}" != healthy ]; then
      log "healthy болсонгүй (сүүлийн төлөв: ${state:-missing})"
      docker compose logs --tail 50 web
      exit 1
    fi

    log "healthy"
    docker compose ps
    # Хуучин давхаргууд дискийг дүүргэхээс сэргийлнэ; 7 хоногийн дотор
    # хэрэглэгдээгүй, ямар ч контейнерт холбогдоогүй image-ууд л устана.
    docker image prune -f --filter 'until=168h' >/dev/null || true
    ;;

  *)
    echo "deploy.sh: тодорхойгүй команд: $action (check | deploy [<tag>])" >&2
    exit 2
    ;;
esac

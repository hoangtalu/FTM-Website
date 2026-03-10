#!/bin/sh

SCRIPT_DIR="$(CDPATH= cd -- "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR" || exit 1

set -a
. "$SCRIPT_DIR/.env.local"
set +a

npm start

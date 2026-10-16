#!/usr/bin/env bash
# Checks the build program and the code sample, then builds the page from the fixtures.
set -euo pipefail
cd "$(dirname "$0")/.."
SSPUR="${SSPUR:-sspur}"
"$SSPUR" check build.ssp
"$SSPUR" test build.ssp
"$SSPUR" check sample/cart.ssp
"$SSPUR" test sample/cart.ssp
out="$(mktemp -d)"
"$SSPUR" run build.ssp offline "$out"
for f in index.html 404.html assets/site.css assets/site.js assets/sspur.svg assets/display.woff2; do
  [ -s "$out/$f" ] || { echo "test: missing $f" >&2; exit 1; }
done
grep -q 'total: 22' "$out/index.html" || { echo "test: the sample's output is missing" >&2; exit 1; }
grep -q 'sspur add pagination' "$out/index.html" || { echo "test: no featured packages" >&2; exit 1; }
if grep -n $'—' "$out/index.html" "$out/404.html" build.ssp template/* assets/site.js assets/site.css; then
  echo "test: an emdash slipped in" >&2; exit 1
fi
if grep -nE '@[A-Z_]+@' "$out/index.html" "$out/404.html"; then echo "test: unfilled placeholder" >&2; exit 1; fi
echo "test: ok ($(du -sk "$out" | cut -f1) KB in $out)"

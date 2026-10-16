#!/usr/bin/env bash
# Installs the latest sspur release (or the version in $1, like 0.13.0) for the workflow,
# verifying the archive against the release's SHA256SUMS, and puts it on the PATH of later steps.
set -euo pipefail
repo="https://github.com/sspurlang/sspur"
v="${1:-}"
if [ -z "$v" ]; then
  # releases/latest redirects to releases/tag/vX.Y.Z; no API call, so no rate limit.
  url="$(curl -fsSLI --retry 3 -o /dev/null -w '%{url_effective}' "$repo/releases/latest")"
  v="${url##*/v}"
fi
case "$v" in *[!0-9.]*|"") echo "install-sspur: odd version '$v'" >&2; exit 1 ;; esac
target="x86_64-unknown-linux-gnu"
name="sspur-v$v-$target"
dir="${RUNNER_TEMP:-/tmp}/sspur-$v"
base="$repo/releases/download/v$v"
mkdir -p "$dir"
curl -fsSL --retry 3 -o "$dir/$name.tar.gz" "$base/$name.tar.gz"
curl -fsSL --retry 3 -o "$dir/SHA256SUMS" "$base/SHA256SUMS"
(cd "$dir" && grep " $name.tar.gz\$" SHA256SUMS | sha256sum -c -)
tar -xzf "$dir/$name.tar.gz" -C "$dir"
"$dir/$name/sspur" --version
if [ -n "${GITHUB_PATH:-}" ]; then echo "$dir/$name" >> "$GITHUB_PATH"; fi

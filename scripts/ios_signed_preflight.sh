#!/usr/bin/env bash
set -u

echo "== PPP iOS Signed Install Preflight =="

echo "\n[1/6] Xcode app"
if [ -d /Applications/Xcode.app ]; then
  echo "OK: /Applications/Xcode.app found"
else
  echo "MISSING: /Applications/Xcode.app (install from App Store)"
fi

echo "\n[2/6] xcodebuild"
if command -v xcodebuild >/dev/null 2>&1; then
  if xcodebuild -version >/tmp/ppp_xcodebuild_version.txt 2>/tmp/ppp_xcodebuild_err.txt; then
    sed 's/^/  /' /tmp/ppp_xcodebuild_version.txt
  else
    echo "MISSING: xcodebuild not usable"
    sed 's/^/  /' /tmp/ppp_xcodebuild_err.txt
  fi
else
  echo "MISSING: xcodebuild not found"
fi

echo "\n[3/6] xcode-select path"
xcode-select -p 2>/dev/null | sed 's/^/  /' || echo "  unavailable"

echo "\n[4/6] Code signing identities"
IDS=$(security find-identity -v -p codesigning 2>/dev/null | awk '/valid identities found/{print $1}')
if [ "${IDS:-0}" -gt 0 ]; then
  security find-identity -v -p codesigning | sed 's/^/  /'
else
  echo "MISSING: no valid iOS/macOS code signing identities"
fi

echo "\n[5/6] APPLE_DEVELOPMENT_TEAM"
if [ -n "${APPLE_DEVELOPMENT_TEAM:-}" ]; then
  echo "OK: APPLE_DEVELOPMENT_TEAM=${APPLE_DEVELOPMENT_TEAM}"
else
  echo "MISSING: APPLE_DEVELOPMENT_TEAM env var not set"
fi

echo "\n[6/6] iOS simulator list"
if xcrun simctl list --json devices available >/dev/null 2>/tmp/ppp_simctl_err.txt; then
  echo "OK: simctl available"
else
  echo "MISSING: simctl unavailable (usually means full Xcode not installed)"
  sed 's/^/  /' /tmp/ppp_simctl_err.txt
fi

echo "\nDone."

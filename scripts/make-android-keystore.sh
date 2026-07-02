#!/usr/bin/env bash
# Generate the Android upload keystore for One Job and print the GitHub
# secrets needed by the android-release workflow.
#
# Run this ONCE on a trusted machine (needs a JDK for keytool):
#   bash scripts/make-android-keystore.sh
#
# GUARD THE OUTPUT: the keystore + passwords are the only way to update the
# app on Google Play. Store them in a password manager as well as GitHub
# secrets. Google Play's "Play App Signing" (default) keeps the final
# signing key on their side, so a lost *upload* key is recoverable via
# support — but treat it as precious anyway.

set -euo pipefail

# macOS ships a Java stub that errors at runtime, so probe keytool for real
if ! keytool -help >/dev/null 2>&1; then
  echo "keytool needs a Java runtime and none is installed." >&2
  echo "On macOS: brew install --cask temurin   (then rerun this script)" >&2
  exit 1
fi

KEYSTORE="onejob-upload.keystore"
ALIAS="onejob-upload"

if [ -f "$KEYSTORE" ]; then
  echo "Refusing to overwrite existing $KEYSTORE" >&2
  exit 1
fi

read -r -s -p "Choose a keystore password: " STOREPASS; echo

keytool -genkeypair \
  -keystore "$KEYSTORE" \
  -alias "$ALIAS" \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -storepass "$STOREPASS" \
  -dname "CN=One Job, O=Design in Product, C=US"

echo
echo "Created $KEYSTORE (DO NOT COMMIT — it is gitignored)."
echo
echo "Now add these GitHub repository secrets"
echo "(Settings → Secrets and variables → Actions → New repository secret):"
echo
echo "  ANDROID_KEYSTORE_BASE64   = (output of the base64 command below)"
echo "  ANDROID_KEYSTORE_PASSWORD = the password you just chose"
echo "  ANDROID_KEY_ALIAS         = $ALIAS"
echo
echo "  base64 -i $KEYSTORE | pbcopy    # macOS: copies to clipboard"

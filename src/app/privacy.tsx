/**
 * Privacy screen — thin wrapper that routes to the HTML viewer with type=privacy.
 */

import { Redirect } from 'expo-router';

export default function PrivacyScreen() {
  return <Redirect href="/html-viewer?type=privacy" />;
}

/**
 * Terms screen — thin wrapper that routes to the HTML viewer with type=terms.
 */

import { Redirect } from 'expo-router';

export default function TermsScreen() {
  return <Redirect href="/html-viewer?type=terms" />;
}

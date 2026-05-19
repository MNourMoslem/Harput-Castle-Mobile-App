import { Redirect } from "expo-router";

// Redirect root "/" to the tabs group so (tabs)/index.tsx is the entry point.
export default function Index() {
  return <Redirect href="/(tabs)" />;
}

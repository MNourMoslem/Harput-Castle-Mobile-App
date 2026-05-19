import { Stack } from "expo-router";
import { QuizProvider } from "@/contexts/QuizContext";
import { UserPrefsProvider } from "@/contexts/UserPrefsContext";
import { LocaleProvider, useLocale } from "@/services/i18n";

export const unstable_settings = {
  // Ensure the (tabs) group is the initial layout
  anchor: "(tabs)",
};

function RootNavigator() {
  const { t, locale } = useLocale();

  return (
    <Stack key={locale}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="lens"
        options={{
              title: `${t("common", "appName")} ${t("common", "navLens")}`,
          headerShown: true,
          headerBackTitle: t("common", "back"),
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <LocaleProvider>
      <UserPrefsProvider>
        <QuizProvider>
          <RootNavigator />
        </QuizProvider>
      </UserPrefsProvider>
    </LocaleProvider>
  );
}

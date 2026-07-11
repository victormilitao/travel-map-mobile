import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useTranslation } from '../hooks/useTranslation';

export default function RootLayout() {
  const { t } = useTranslation();

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack>
        <Stack.Screen 
          name="index" 
          options={{ 
            title: t('home.title'), 
            headerTitleStyle: { fontWeight: 'bold' } 
          }} 
        />
      </Stack>
    </SafeAreaProvider>
  );
}

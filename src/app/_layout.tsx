import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from '../hooks/useTranslation';

export default function RootLayout() {
  const { t } = useTranslation();

  return (
    <>
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
    </>
  );
}

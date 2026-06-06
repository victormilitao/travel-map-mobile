import { I18n } from 'i18n-js';
import * as Localization from 'expo-localization';

import ptBR from './locales/pt-BR.json';
import en from './locales/en.json';

const i18n = new I18n({
  'pt-BR': ptBR,
  pt: ptBR,
  en,
});

// Detecta o locale do dispositivo automaticamente
const deviceLocale = Localization.getLocales()?.[0]?.languageTag ?? 'pt-BR';
i18n.locale = deviceLocale;

// Fallback para pt-BR se o locale não for suportado
i18n.enableFallback = true;
i18n.defaultLocale = 'pt-BR';

export default i18n;

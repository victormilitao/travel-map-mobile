import i18n from '../i18n';

/**
 * Hook para acessar traduções na app mobile.
 * Retorna a função `t` do i18n-js.
 *
 * Uso:
 *   const { t } = useTranslation();
 *   t('home.title') // → "Minhas Viagens" ou "My Trips"
 */
export function useTranslation() {
  const t = (key: string, options?: Record<string, unknown>) =>
    i18n.t(key, options);

  return { t, locale: i18n.locale };
}

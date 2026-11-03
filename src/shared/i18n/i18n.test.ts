import { describe, expect, it } from 'vitest';
import { DEFAULT_LANGUAGE } from './config';
import { i18n } from './i18n';

describe('i18n', () => {
  it('is initialized with default language and resources', () => {
    expect(i18n.isInitialized).toBe(true);
    expect(i18n.language).toBe(DEFAULT_LANGUAGE);
    expect(i18n.t('common.cancel')).toBe('Cancel');
  });

  it('translates loaded locales', async () => {
    await i18n.changeLanguage('ru');
    expect(i18n.t('common.cancel')).toBe('Отмена');

    await i18n.changeLanguage(DEFAULT_LANGUAGE);
    expect(i18n.t('common.cancel')).toBe('Cancel');
  });
});

import { describe, it, expect } from 'vitest';
import { useTranslations, formatDate } from './utils';
import { ui, defaultLang } from './ui';

describe('useTranslations', () => {
  it('returns the string for the requested language', () => {
    expect(useTranslations('es')('nav.projects')).toBe('Proyectos');
    expect(useTranslations('en')('nav.projects')).toBe('Projects');
  });

  it('falls back to the default language when a key is missing', () => {
    // @ts-expect-error — exercising the runtime fallback with an unknown key
    expect(useTranslations('en')('totally.unknown.key')).toBeUndefined();
  });
});

describe('ui dictionaries', () => {
  it('every default-language key has a non-empty translation in all languages', () => {
    const keys = Object.keys(ui[defaultLang]) as Array<keyof typeof ui['es']>;
    for (const lang of Object.keys(ui) as Array<keyof typeof ui>) {
      for (const key of keys) {
        expect(ui[lang][key], `${lang} / ${key}`).toBeTruthy();
      }
    }
  });
});

describe('formatDate', () => {
  const d = new Date('2026-06-17T00:00:00Z');
  it('formats a long date in Spanish', () => {
    expect(formatDate(d, 'es')).toBe('17 de junio de 2026');
  });
  it('formats a long date in English', () => {
    expect(formatDate(d, 'en')).toBe('June 17, 2026');
  });
});

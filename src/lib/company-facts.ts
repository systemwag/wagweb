/**
 * Статичные факты о компании, подтверждённые документами
 * (сканы: public/licenses/). Аудит 2026-07-16.
 *
 * Динамические цифры (объекты, работы) сюда НЕ выносить —
 * они считаются из реестра (см. data.ts, паттерн length || fallback).
 */

/** Год основания — дата первичной выдачи лицензий (28.04.2010 ПД, 13.07.2010 СМР). */
export const FOUNDED_YEAR = 2010;

export const BIN = '100340009758';

export const LEGAL_NAME = 'ТОО «West Arlan Group»';

export const ADDRESS = 'г. Актобе, ул. Казангапа, дом 57В, офис 34';

export const PHONE = '+7 (7132) 538-288';

export const PHONE_HREF = 'tel:+77132538288';

export const EMAIL = 'west_arlan-group@mail.ru';

/** Лицензии — реквизиты дословно со сканов. */
export const LICENSES = {
  smr: { number: '25008103', category: 'I категория', issued: '14.03.2025', firstIssued: '13.07.2010' },
  pd:  { number: '25031072', category: 'I категория', issued: '05.09.2025', firstIssued: '28.04.2010' },
  eco: { number: '02962Р',   category: 'класс 1',     issued: '22.09.2025', firstIssued: null },
} as const;

/** Свидетельства об аккредитации — действуют до этой даты. */
export const ACCREDITATIONS_VALID_UNTIL = '26.06.2028';

/** Полных лет на рынке, считается от года основания. */
export function yearsOnMarket(): number {
  return new Date().getFullYear() - FOUNDED_YEAR;
}

import { describe, it, expect } from 'vitest';
import { resolvePlace, PLACES, HUBS, PLACE_BY_ID } from '@/lib/geo/places';

/**
 * Реальные строки `location` из прода (снято 2026-07-26).
 * Тест — страховка от «тихой» потери объекта на карте: если кто-то заведёт
 * новый адрес в непривычном формате, падает здесь, а не молча исчезает.
 */
const PROJECT_LOCATIONS: Array<[string, string]> = [
  ['Актобе, ст. Жинишке',                     'zhinishke'],
  ['Уральск, ЗКО',                            'uralsk'],
  ['Актобе, Индустриальная зона',             'ind-zone'],
  ['Актобе',                                  'aktobe-city'],
  ['Коктау, Хромтауский район',               'koktau'],
  ['Новотроицк, Оренбургская обл.',           'novotroitsk'],
  ['Атырау, ст. Тендык',                      'tendyk'],
  ['г. Актобе, р-н Астана · ст. Кызгалдакты', 'kyzgaldakty'],
  ['Актобе, 41-разъезд',                      'razezd41'],
  ['Нур-Султан (Астана)',                     'astana'],
  ['ст. Шубаркудук, Актюбинская обл.',        'shubarkuduk'],
  ['Тасқалинский район, ЗКО',                 'taskala'],
  ['ст. Кардон, ЗКО',                         'kardon'],
  ['Иргизский район, Актюбинская обл.',       'irgiz'],
  ['Бакты, Абайская область.',                'bakty'],
  ['Айтекебийский район, Актюбинская обл.',   'aitekebi'],
  ['Байганинский район, Актюбинская обл.',    'koltaban'],
  ['Бейнеуский район, Мангистауская обл.',    'beyneu'],
  ['Шымкент, ЮКО',                            'shymkent'],
  ['ст. Никельтау, Актюбинская обл.',         'nikeltau'],
  ['Карабулакский с.о., Актюбинская обл.',    'karabulak'],
  ['Исатай, Атырауская обл.',                 'isatay'],
];

const MAINTENANCE_LOCATIONS: Array<[string, string]> = [
  ['Актобе, ст. Жинишке',            'zhinishke'],
  ['Уральск, ЗКО',                   'uralsk'],
  ['Коктау, Хромтауский район',      'koktau'],
  ['ст. Бирыштр, Актюбинская обл.',  'birshogyr'],
  ['Актобе, ст. Актобе-1',           'aktobe-1'],
  ['ст. Жем, Актюбинская обл.',      'zhem'],
  ['Актобе',                         'aktobe-city'],
];

const DESIGN_LOCATIONS: Array<[string, string]> = [
  ['Атырауская обл., г. Атырау, аул Новокирпичный · ст. Тендык',            'tendyk'],
  ['Атырауская обл., село Исатай · ст. Исатай',                             'isatay'],
  ['Актюбинская обл., Байганинский р-н, с.о. Кольтабанский',                'koltaban'],
  ['Актюбинская обл., Байганинский р-н, с.о. Кольтабанский · ст. Кенжалы',  'kenzhaly'],
  ['Актюбинская обл., Байганинский р-н, Кольтабанский с.о. · ст. Кенжалы',  'kenzhaly'],
  ['г. Актобе, индустриальная зона · ст. Жинишке',                          'zhinishke'],
  ['г. Актобе, район Алматы, 41-разъезд',                                   'razezd41'],
  ['г. Новотроицк, Оренбургская обл., Российская Федерация',                'novotroitsk'],
  ['СЭЗ «Хоргос — Восточные ворота», Алматинская обл.',                     'khorgos'],
  ['с. Коктау, Хромтауский р-н, Актюбинская обл. · ст. Кызыл-Каин — Рудная', 'kyzylkain'],
  ['ЗКО, г. Уральск, с. Кардон · ст. Кардон',                               'kardon'],
  ['г. Актобе · территория завода АРБЗ',                                    'arbz'],
  ['Актюбинская обл. · пос. Коктау — м-е Лиманное',                         'limannoe'],
  ['Алматинская обл. · с. Коспан — производственная площадка',              'kospan'],
  ['Актюбинская обл., г. Актобе · район Илекского водозабора',              'ilek'],
];

describe('resolvePlace', () => {
  it.each([...PROJECT_LOCATIONS, ...MAINTENANCE_LOCATIONS, ...DESIGN_LOCATIONS])(
    '%s → %s',
    (location, expected) => {
      expect(resolvePlace(location)?.id).toBe(expected);
    },
  );

  it('пустая строка и null не ломают разбор', () => {
    expect(resolvePlace(null)).toBeNull();
    expect(resolvePlace('')).toBeNull();
    expect(resolvePlace('Марс, кратер Гусева')).toBeNull();
  });
});

describe('целостность газеттира', () => {
  it('id мест уникальны', () => {
    expect(new Set(PLACES.map(p => p.id)).size).toBe(PLACES.length);
  });

  it('каждое место ссылается на существующий хаб', () => {
    const hubIds = new Set(HUBS.map(h => h.id));
    for (const p of PLACES) expect(hubIds.has(p.hub), `${p.id} → ${p.hub}`).toBe(true);
  });

  it('якорь каждого хаба существует и принадлежит этому же хабу', () => {
    for (const h of HUBS) {
      const anchor = PLACE_BY_ID.get(h.anchor);
      expect(anchor, `${h.id}: якорь ${h.anchor} не найден`).toBeDefined();
      expect(anchor!.hub).toBe(h.id);
    }
  });

  it('координаты лежат в разумных пределах региона', () => {
    for (const p of PLACES) {
      expect(p.lat, p.id).toBeGreaterThan(40);
      expect(p.lat, p.id).toBeLessThan(56);
      expect(p.lon, p.id).toBeGreaterThan(45);
      expect(p.lon, p.id).toBeLessThan(88);
    }
  });
});

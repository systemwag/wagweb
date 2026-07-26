import { KZ_REGIONS } from './kz-geo.generated';

/** Код региона → человеческое название. Зарубежье в генератор не попадает. */
export const REGION_NAME: Record<string, string> = {
  ...Object.fromEntries(KZ_REGIONS.map(r => [r.code, r.name])),
  'RU-ORE': 'Оренбургская обл., РФ',
  OUT: 'за пределами Казахстана',
};

export const REGION_SHORT: Record<string, string> = {
  ...Object.fromEntries(KZ_REGIONS.map(r => [r.code, r.short])),
  'RU-ORE': 'Оренбургская',
  OUT: 'вне РК',
};

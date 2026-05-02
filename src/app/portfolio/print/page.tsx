import { getProjects, getDesignProjects } from '@/lib/data';
import QRCode from 'qrcode';
import styles from './print.module.css';
import PrintButtons from './PrintButtons';

/* ── WAG triangle path (from Hero.tsx) ────────────────────────── */
const WAG_PATH = 'M613.8,437.27c-62.3-103.58-132.83-240.95-201.5-355.51L367.22,0h-16.51c-5.26,19.77-26.22,45.86-33.35,61.03-12.21,25.99-1.91,26.43,18.72,64.07l206.32,360.76,30.4,59.77-106.51.95c-9.82-18.63-13.04-29.8-27.52-49.02l-155.86-274.97c-10.29-18.78-10.26-28.99-25.78-40.4-19.27,12.94-14.27,13.44-25.87,34.79-8.93,16.45-15.27,26.27-23.65,42.54l-143.13,248.42c-77.1,142.82-94.44,127.54-.02,127,86.18-.49,172.52-.02,258.72-.02-2-24.09-9.24-28.93-19.64-46.55-33.15-56.19-11.28-41.79-156.49-41.79,3.5-13.11,16.34-33.82,24.36-47.34l91.22-145.89c4.18,18,25.71,50.9,36.21,68.58,8.16,13.76,11.9,23.61,19.08,36.06,7.25,12.59,11.91,19.4,19.91,35.23l78.91,141.69h302.74c-2.68-32.14-85.4-163.93-105.69-197.65Z';

const KZ_MAIN = 'M5567 8003 c-4 -3 -7 -15 -7 -25 0 -22 -18 -23 -42 -1 -17 15 -18 15 -18 -5 0 -11 -5 -24 -10 -27 -6 -4 -8 -15 -5 -25 4 -14 -2 -19 -32 -26 -21 -4 -44 -6 -52 -5 -10 2 -12 -6 -7 -32 4 -23 2 -38 -5 -42 -8 -6 -8 -10 2 -15 24 -15 -10 -40 -53 -40 -28 0 -45 -6 -57 -21 -9 -12 -29 -23 -43 -24 -14 -2 -35 -8 -46 -14 -11 -6 -29 -11 -40 -11 -11 0 -52 -13 -92 -30 -40 -16 -84 -30 -98 -30 -14 0 -40 -11 -59 -26 -31 -24 -33 -24 -33 -5 0 30 -16 34 -39 10 -16 -17 -28 -21 -54 -16 -30 5 -39 1 -66 -27 -21 -22 -31 -42 -31 -64 0 -30 -1 -31 -25 -20 -19 9 -29 7 -50 -6 -18 -12 -47 -18 -93 -18 -74 0 -112 -16 -112 -48 0 -22 -20 -26 -37 -9 -9 9 -20 9 -44 0 -17 -6 -47 -11 -64 -11 -18 0 -38 -7 -45 -15 -7 -8 -24 -15 -39 -15 -14 0 -45 -9 -68 -20 -34 -15 -42 -24 -40 -42 1 -14 -4 -23 -15 -26 -14 -3 -18 3 -18 27 0 30 -2 31 -42 31 -25 0 -49 -7 -60 -17 -17 -15 -19 -15 -32 3 -12 15 -19 17 -42 9 -25 -9 -32 -7 -49 12 -28 32 -67 22 -63 -16 3 -23 0 -26 -24 -23 -33 3 -39 -23 -8 -33 26 -8 25 -25 -1 -70 -26 -44 -19 -54 42 -62 50 -6 80 -28 72 -50 -4 -11 -17 -14 -44 -11 -34 3 -39 1 -39 -17 0 -11 4 -26 8 -33 16 -24 76 -62 101 -63 37 -1 109 -83 91 -104 -9 -11 -16 -11 -29 -3 -12 7 -23 8 -36 1 -13 -8 -30 -5 -63 10 -44 19 -47 19 -79 2 -18 -10 -33 -24 -33 -31 0 -14 -66 -74 -81 -74 -14 0 0 -43 17 -53 8 -4 14 -16 14 -26 0 -10 11 -28 25 -41 36 -34 32 -69 -13 -113 -26 -25 -47 -37 -67 -37 -18 -1 -44 -13 -65 -30 -19 -17 -45 -30 -57 -30 -13 0 -23 -6 -23 -13 0 -18 21 -37 41 -37 9 0 19 -9 22 -19 3 -11 17 -22 36 -26 31 -7 31 -7 15 -36 -20 -40 -4 -63 38 -54 24 6 37 -1 85 -41 38 -33 64 -48 82 -47 18 1 34 -9 54 -33 16 -19 24 -34 19 -34 -6 0 -20 -42 -33 -94 l-22 -94 -71 -29 c-65 -27 -75 -28 -123 -18 -52 10 -93 37 -93 61 0 7 -9 18 -20 24 -17 9 -23 4 -51 -45 -17 -30 -34 -55 -37 -55 -4 0 -16 7 -26 15 -11 8 -30 15 -43 15 -30 0 -140 53 -175 84 -15 13 -31 42 -37 63 -8 29 -19 43 -44 55 -22 10 -39 13 -49 7 -10 -6 -26 -4 -44 6 -42 22 -63 19 -70 -10 -8 -34 -43 -33 -84 2 -25 20 -49 29 -98 35 -43 5 -68 4 -72 -3 -4 -6 -18 -7 -33 -3 -21 5 -27 2 -27 -9 0 -11 -12 -17 -37 -19 -36 -3 -38 -5 -46 -48 -7 -36 -15 -50 -42 -68 -45 -29 -61 -28 -96 7 -16 17 -37 32 -47 35 -22 7 -52 57 -52 85 0 16 -8 23 -29 27 -16 3 -39 19 -51 36 -12 16 -29 28 -38 26 -14 -3 -17 -17 -17 -88 0 -82 -1 -85 -24 -88 -21 -3 -23 -1 -16 25 14 55 8 80 -28 125 -22 26 -37 56 -39 78 -3 30 -8 36 -45 50 -57 21 -80 45 -88 90 -8 50 -22 68 -71 89 -27 12 -47 15 -62 10 -14 -5 -30 -4 -41 3 -13 8 -27 8 -48 0 -29 -9 -31 -8 -49 26 -10 21 -21 51 -24 67 -4 26 -9 30 -35 27 -16 -1 -41 -3 -55 -3 -46 0 -70 -19 -70 -56 0 -38 -9 -41 -35 -13 -10 11 -31 20 -46 20 -34 0 -48 19 -26 34 26 20 -10 56 -61 63 -28 4 -46 13 -53 25 -14 26 -29 13 -29 -24 0 -30 -1 -31 -19 -14 -24 22 -41 13 -41 -19 0 -30 -77 -95 -112 -95 -14 0 -42 -13 -63 -30 -43 -34 -39 -33 -82 -21 -44 13 -61 -7 -43 -49 7 -17 11 -32 9 -33 -2 -1 -25 -12 -51 -25 -27 -12 -48 -27 -48 -33 0 -12 -58 -8 -94 7 -15 6 -17 4 -12 -14 4 -11 11 -58 16 -104 5 -45 12 -99 16 -118 7 -43 -13 -65 -67 -75 -33 -6 -39 -4 -72 35 -24 29 -40 61 -48 97 -15 66 -58 135 -95 152 -20 9 -35 9 -60 1 -32 -11 -34 -14 -34 -58 0 -30 -8 -61 -23 -87 -20 -35 -27 -40 -54 -37 -38 4 -51 -15 -71 -98 -7 -30 -15 -65 -19 -78 -4 -16 3 -34 23 -60 42 -54 36 -95 -17 -122 -30 -16 -39 -26 -39 -47 0 -15 -14 -44 -33 -67 -54 -66 -61 -83 -43 -111 9 -13 37 -30 65 -40 56 -18 65 -27 75 -70 4 -16 17 -38 29 -48 l22 -19 -27 6 c-31 7 -33 2 -13 -34 8 -14 14 -37 15 -51 0 -17 9 -33 25 -43 23 -15 25 -15 25 -1 0 18 30 13 65 -11 11 -8 38 -14 61 -14 l41 0 38 -87 c22 -47 49 -98 60 -112 33 -40 146 -261 140 -271 -9 -14 -31 -12 -63 4 -31 15 -72 5 -72 -18 0 -20 19 -25 134 -38 56 -6 105 -15 110 -19 15 -13 -45 -23 -65 -10 -25 15 -44 14 -58 -2 -14 -18 16 -46 84 -79 72 -36 118 -41 168 -18 23 10 58 22 78 25 20 3 46 16 59 30 l23 25 -40 0 c-22 0 -43 3 -46 7 -12 11 13 31 33 26 12 -3 20 0 20 7 0 7 7 10 15 7 8 -4 17 -2 20 3 4 7 13 6 25 0 13 -7 21 -6 30 5 6 7 17 12 24 9 7 -3 20 6 29 20 12 17 29 27 60 31 58 9 104 -11 161 -71 37 -38 47 -44 52 -31 5 14 10 11 28 -16 23 -34 56 -48 56 -24 0 7 11 19 25 25 14 6 25 16 25 21 0 5 21 1 48 -9 26 -11 60 -22 76 -25 l28 -6 -6 -80 c-6 -68 -5 -79 8 -79 38 0 8 -119 -40 -155 -38 -29 -51 -60 -34 -80 10 -13 7 -15 -19 -15 -17 0 -31 -4 -31 -10 0 -13 -115 -13 -163 1 -32 9 -43 7 -65 -8 -15 -9 -32 -16 -38 -15 -15 3 -50 -38 -61 -73 -6 -19 -17 -31 -31 -33 -28 -4 -29 -32 -2 -55 11 -9 20 -25 20 -36 0 -36 12 -51 40 -51 16 0 32 -5 35 -10 4 -7 -9 -10 -37 -10 -24 1 -51 0 -60 0 -9 -1 -30 9 -47 21 -23 17 -38 20 -66 16 -21 -4 -45 -1 -56 6 -15 9 -22 8 -39 -10 -28 -30 -25 -54 9 -87 22 -21 36 -27 54 -23 28 8 67 -17 67 -41 0 -10 6 -26 14 -37 7 -11 16 -36 20 -55 3 -19 20 -55 37 -80 24 -36 30 -54 28 -90 -1 -25 -1 -51 0 -57 1 -15 66 -57 102 -66 18 -5 33 -21 50 -56 l24 -50 51 -1 c36 0 54 -4 58 -15 4 -10 14 -13 36 -9 28 6 31 3 49 -38 l20 -44 -30 -89 c-32 -94 -32 -103 -8 -226 l12 -66 46 26 c81 46 177 71 271 71 l86 0 67 -56 c37 -30 67 -62 67 -70 0 -8 34 -64 76 -124 l76 -110 62 0 63 0 7 98 c3 53 9 330 12 614 l7 518 31 6 c17 3 168 33 336 67 l304 62 11 42 c14 57 23 64 91 67 33 1 65 5 72 10 11 6 10 1 -1 -21 -29 -55 22 -81 58 -30 8 12 15 16 15 9 0 -7 5 -10 10 -7 11 7 7 108 -5 158 -7 26 -5 28 16 25 21 -3 24 -9 27 -55 2 -32 9 -56 19 -65 13 -10 17 -10 20 0 6 17 38 15 53 -3 7 -8 10 -25 6 -39 -4 -15 -1 -28 6 -32 17 -11 -17 -22 -67 -23 -53 -2 -64 -10 -58 -45 5 -26 8 -28 42 -22 95 17 141 19 145 5 2 -8 16 -67 31 -131 23 -101 25 -121 15 -153 -11 -34 -10 -39 13 -63 13 -15 85 -108 160 -208 l135 -180 173 22 174 22 162 -26 162 -26 51 24 52 24 20 -24 c11 -14 25 -32 32 -41 6 -9 24 -20 41 -26 23 -7 40 -28 79 -102 33 -60 54 -90 63 -86 7 3 20 8 28 11 13 5 15 -13 15 -134 0 -157 -3 -152 81 -152 l35 0 12 -75 c14 -90 51 -170 84 -179 13 -3 73 -6 134 -6 73 0 126 -5 156 -16 l46 -15 -9 -37 c-6 -29 -4 -41 9 -55 28 -31 51 -39 93 -32 l39 7 0 48 c0 46 2 48 38 63 42 18 92 61 92 81 0 18 66 76 85 76 8 0 26 18 41 39 14 22 37 42 50 45 17 5 26 16 31 36 3 16 12 35 19 41 8 6 14 18 14 26 0 20 25 26 49 13 18 -9 25 -6 52 25 17 19 37 35 44 35 24 0 73 50 85 85 12 35 58 77 100 90 14 4 33 15 43 24 31 26 206 17 276 -15 44 -20 63 -23 102 -18 36 5 55 2 73 -10 28 -18 63 -21 86 -6 12 8 13 13 2 27 -24 34 -25 45 -8 73 9 16 16 41 16 57 0 18 9 38 23 50 32 29 110 53 152 46 28 -4 35 -2 35 11 0 23 20 20 97 -13 116 -49 214 -71 312 -71 81 0 90 2 96 20 7 22 13 23 135 25 56 1 88 7 125 24 43 21 58 23 115 16 75 -9 75 -9 235 5 166 14 161 14 248 12 75 -2 79 -3 121 -42 41 -38 47 -40 107 -40 46 0 78 -7 114 -23 l50 -24 0 95 c0 61 4 97 11 99 6 2 20 10 30 18 17 12 17 17 6 35 -7 12 -12 23 -10 23 45 22 64 36 66 51 7 34 -8 82 -43 136 -19 30 -35 62 -35 71 0 9 -7 22 -15 29 -8 7 -15 26 -15 42 0 16 -7 45 -16 66 -9 22 -14 57 -12 87 l3 50 -53 0 c-97 0 -83 53 23 85 22 6 72 20 110 30 39 10 104 34 144 54 l75 36 21 -20 c17 -16 38 -21 94 -23 81 -4 91 4 91 67 0 34 -2 36 -31 36 l-31 0 7 58 c4 31 6 82 6 112 -1 38 11 98 39 192 22 75 40 147 40 161 0 45 19 48 106 21 71 -23 89 -25 177 -20 53 3 97 3 97 -1 0 -5 4 -14 8 -21 6 -9 25 -4 76 23 37 19 74 35 82 35 7 0 16 12 20 28 3 15 7 33 9 39 2 7 -2 34 -11 60 -24 80 -34 181 -22 242 12 64 36 91 80 91 36 0 88 26 88 44 0 7 6 19 14 25 9 7 13 33 14 76 0 71 12 95 47 95 37 0 35 10 -11 59 -61 65 -77 96 -61 122 10 16 9 21 -3 29 -22 14 -26 13 -38 -15 -6 -13 -25 -31 -41 -40 -17 -8 -33 -26 -37 -40 -5 -19 -10 -23 -23 -16 -37 19 -82 21 -108 4 -25 -16 -26 -16 -47 9 -45 56 -84 114 -90 133 -6 22 -84 75 -109 75 -21 0 -47 38 -47 70 0 20 -21 47 -83 107 l-82 81 -69 7 c-58 6 -70 5 -78 -9 -5 -9 -22 -16 -38 -16 -19 0 -30 -5 -30 -14 0 -32 -122 -52 -177 -29 -22 9 -49 12 -70 8 -33 -6 -33 -5 -33 31 l0 37 -37 -6 c-21 -4 -48 -4 -61 -1 -21 6 -22 10 -16 55 6 42 4 49 -10 49 -9 0 -35 9 -58 21 -37 19 -42 19 -50 5 -5 -9 -17 -16 -27 -16 -25 0 -36 -41 -15 -57 13 -10 11 -16 -20 -46 -21 -21 -37 -31 -40 -24 -2 7 -5 2 -5 -10 -1 -34 -15 -28 -41 20 -95 169 -355 596 -472 776 l-142 216 -193 189 c-106 103 -193 192 -193 197 0 5 11 9 23 9 27 0 51 41 42 70 -3 11 0 20 10 24 8 3 15 10 15 16 0 17 -30 11 -57 -10 -31 -24 -56 -25 -93 -4 -26 16 -28 16 -49 -5 -14 -14 -34 -21 -57 -21 -20 0 -51 -9 -68 -19 -22 -14 -36 -17 -46 -11 -23 14 -30 12 -30 -10 0 -25 -84 -84 -125 -87 -87 -7 -135 -17 -136 -27 -1 -6 0 -28 1 -48 1 -30 -2 -37 -14 -32 -8 3 -16 15 -18 27 -2 15 -11 23 -28 26 -14 1 -28 7 -31 12 -9 15 -68 29 -75 17 -4 -5 -20 -8 -38 -5 -22 3 -37 -1 -53 -15 l-21 -20 -36 28 c-39 31 -43 47 -24 91 21 46 35 56 73 49 l35 -7 0 46 c0 41 -2 45 -24 45 -13 0 -29 -7 -36 -15 -8 -10 -30 -15 -62 -15 -45 0 -54 4 -86 37 -32 32 -107 73 -136 73 -4 0 -5 -11 -2 -25 5 -19 3 -23 -9 -19 -8 4 -22 1 -30 -6 -21 -17 -29 -7 -16 19 7 13 8 22 1 26 -5 3 -10 14 -10 24 0 17 -29 51 -43 51 -4 0 -7 -31 -7 -68 0 -64 -2 -70 -25 -80 -17 -8 -25 -20 -25 -36 0 -27 -27 -39 -54 -24 -11 6 -28 6 -48 -1 -17 -6 -32 -10 -33 -9 -1 2 -9 14 -18 28 -26 37 -22 60 9 60 24 0 26 3 19 28 -5 15 -8 55 -9 90 -1 52 -5 66 -22 80 -34 26 -44 56 -44 122 0 51 -5 67 -26 96 -37 48 -83 43 -130 -13 -24 -29 -37 -25 -106 29 -35 27 -42 29 -91 23 -50 -6 -56 -5 -74 19 -21 26 -34 32 -46 19z';

function WagTriangle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 719.49 635.66" className={className} xmlns="http://www.w3.org/2000/svg">
      <path fill="#C9941F" d={WAG_PATH} />
    </svg>
  );
}

type PrintTestimonial = {
  client: string;
  signatory: string;
  role: string;
  date?: string;
  category: string;
  quote: string;
};

const PRINT_TESTIMONIALS: PrintTestimonial[] = [
  { client: 'ТОО «УКИЗ Актобе» · Aktobe Industrial Zone', signatory: 'Тулебаев А. Н.', role: 'Директор', date: '5 января 2020', category: 'Содержание · 4,5 км',
    quote: 'За время сотрудничества текущее содержание подъездных железнодорожных путей осуществляется квалифицированными специалистами. Качественно и своевременно устраняются все дефекты. Профессионализм работников West Capital Construction LLP позволяет нам быть уверенными в безопасной эксплуатации.' },
  { client: 'ТОО «Актюбинская медная компания»', signatory: 'Бондаренко Н. С.', role: 'Генеральный директор', category: 'Перебортовка · 63 км',
    quote: 'Высококвалифицированный персонал ответственно подошёл к выполнению поставленных задач, и качественно в установленные договором сроки выполнил данные работы. West Capital Construction LLP имеет всю необходимую технику и оборудование для выполнения как демонтажных, так и СМР работ.' },
  { client: 'ТОО «Актюбинская медная компания»', signatory: 'Бондаренко Н. С.', role: 'Генеральный директор', category: 'Содержание · 7,2 + 20 км',
    quote: 'Техническое обслуживание такого путевого развития требует большой ответственности и профессионального внимания. Был заключён договор с West Capital Construction LLP, т. к. их специалисты зарекомендовали себя как профессиональные и добросовестные работники.' },
  { client: 'ТОО «Актюбинская медная компания»', signatory: 'Бондаренко Н. С.', role: 'Генеральный директор', date: '21 сентября 2018', category: 'Реконструкция · ст. Рудная',
    quote: 'Сотрудники компании оперативно и качественно решали многочисленные вопросы, возникающие в процессе строительства. Все этапы дальнейшего строительства West Capital Construction LLP терпеливо согласовывала с руководством ТОО «АМК». Рекомендуем их как надёжную команду для проектов любой сложности.' },
  { client: 'ТОО «Зерде-Керамика Актобе»', signatory: 'Тлеукабылов Е. Р.', role: 'Директор', date: 'Сентябрь 2021', category: 'Строительство · 481 м',
    quote: 'Учитывая добросовестность и ответственность работников West Capital Construction LLP, а также серьёзный подход к выполняемой работе, мы уверены в безопасности эксплуатации железнодорожного пути и надеемся на дальнейшее сотрудничество.' },
  { client: 'ТОО «Зерде-Керамика Актобе»', signatory: 'Тлеукабылов Е. Р.', role: 'Директор', category: 'Демонтаж · 6,7 км',
    quote: 'Ваши специалисты справились с выполнением работ качественно и в установленные сроки, что подтверждает Вашу ответственность и подготовленность. Учитывая, что Ваша компания работала с нами при строительстве, обслуживании и теперь демонтажных работах, мы выражаем готовность на дальнейшее сотрудничество.' },
  { client: 'ТОО «Компания Фаэтон»', signatory: 'Русманова В. Ю.', role: 'Директор', date: '20 октября 2018', category: 'Содержание · рампа 70 м',
    quote: 'Сотрудники West Capital Construction LLP отличаются ответственностью, добропорядочностью и профессионализмом. Обход, осмотр и исправление дефектов подъездного пути осуществляется качественно и своевременно. Их работа даёт нам уверенность в безопасной эксплуатации пути.' },
  { client: 'ТОО «АлтынНұран»', signatory: 'Мурзабеков Ж. Н.', role: 'Директор', date: 'С сентября 2019', category: 'Содержание · 115 м',
    quote: 'Все работы по текущему содержанию железнодорожного пути и сооружений выполнялись высококвалифицированными специалистами. Учитывая добросовестность и ответственность работников, мы уверены в безопасности эксплуатации и надеемся на дальнейшее сотрудничество.' },
  { client: 'ТОО «Синтез Урал»', signatory: 'Морозов С. А.', role: 'Директор', date: 'С ноября 2024', category: 'Строительство · 500 м',
    quote: 'Хочется отметить профессионализм и ответственность работников West Capital Construction LLP, а также оперативность решения вопросов в ходе строительства. Высокий уровень организационной работы позволил качественно и в срок сдать объект в эксплуатацию.' },
  { client: 'ТОО «Portal KZ»', signatory: 'Нышанов М. М.', role: 'Директор', category: 'Строительство · ст. Никельтау',
    quote: 'Строительство выполнено с чётким соблюдением всех условий договора: работа была выполнена в срок, в соответствии с техническим заданием. Между нашими организациями сложилась хорошая практика оперативного взаимодействия в согласовании технических решений.' },
  { client: 'ИП «Жанажанов Б. С.»', signatory: 'Жанажанов Б. С.', role: 'Индивидуальный предприниматель', category: 'Строительство · 200 м',
    quote: 'Благодаря профессиональному подходу к работе сотрудниками West Capital Construction LLP строительство нашего железнодорожного пути необщего пользования было завершено раньше намеченного срока, при этом качество и надёжность построенного объекта достойны самых высоких оценок.' },
  { client: 'ТОО «Нефтестройсервис ЛТД» · NSS', signatory: 'Отаров Р. К.', role: 'Директор', date: '01 ноября 2022', category: 'Строительство · ст. Тендык',
    quote: 'Работы выполнены в соответствии с действующими строительными нормами и правилами, согласно техническому заданию и условиям контракта, с надлежащим качеством и в установленный срок. West Capital Construction LLP проявила себя как высокопрофессиональная компания.' },
  { client: 'ЧЛ «Ни К. А.»', signatory: 'Ни К. А.', role: 'Частный заказчик', category: 'Строительство · 41 разъезд',
    quote: 'Компания показала себя как исполнительный подрядчик, выполняющий договорные обязательства с превосходным качеством работ и в установленные сроки. Применяемые компанией современные методы строительства соответствуют требованиям СН РК, СП РК и ГОСТ.' },
  { client: 'ТОО «СП «Сине Мидас Строй»', signatory: 'Иманкулова Б. Т.', role: 'Исполнительный директор', category: 'Демонтаж · 850 м',
    quote: 'Не можем не отметить высокий профессионализм работников West Capital Construction LLP, а также максимальную ответственность при выполнении поставленных задач. Качество работ не оставляет сомнений, надеемся на ещё более тесное сотрудничество.' },
  { client: 'ТОО «ПГС-Тамды»', signatory: 'Испанов А. К.', role: 'Директор', category: 'Строительство · ст. Тамды',
    quote: 'Профессиональный и ответственный подход к выполнению работы сотрудниками West Capital Construction LLP обеспечили строительство нашего железнодорожного пути необщего пользования в стационарный путь «на окно». Все согласования с организациями АО «НК «КТЖ» велись своевременно.' },
];

const PARTNERS = [
  { file: '9.png',          name: 'Қазақстан Темір Жолы' },
  { file: '1.png',          name: 'Русская Медная Компания' },
  { file: '5554453.png',    name: 'Урал Синтез' },
  { file: '645b7c47-e4a5-4c84-b1ef-17bd24e7e09d.jpg', name: 'Группа Синтез' },
  { file: '4.png',          name: 'Shubarkol Premium' },
  { file: '7.png',          name: 'Altynex' },
  { file: 'metprom-logo-rus-Photoroom.png',           name: 'Метпром' },
  { file: '1637e7d5-4f7c-42f8-a84d-5aeef15cf0a6.jpg', name: 'Тенізшевройл' },
  { file: '20bd4962-9777-4243-9b6d-e953b080c142.jpg', name: 'Khorgos Gateway' },
  { file: 'QB_-01_1__.png', name: 'Qazaq Bitum' },
  { file: '5.png',          name: 'NSS' },
  { file: '3.png',          name: 'Синe Мидас Строй' },
  { file: '6.png',          name: 'Актобе Стекло' },
  { file: 'Снимок экрана 2025-06-21 162017-Photoroom.png', name: 'СПК «Актобе»' },
  { file: '7a29c2e4-bc43-4817-8212-f7e985ee9929.jpg', name: 'СПС Энерго' },
  { file: '2.png',          name: 'Зерде Керамика' },
];

function Corners({ pageNum }: { pageNum: string }) {
  return (
    <>
      <div className={`${styles.cornerMark} ${styles.cornerTopRight}`}><span className={styles.pageNum}>{pageNum}</span></div>
      <div className={`${styles.cornerMark} ${styles.cornerBottomRight}`}>arlan-gr.kz</div>
    </>
  );
}

function IconPhone() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
  );
}

function IconMail() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,13 2,6"/>
    </svg>
  );
}

function IconPin() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  );
}

function IconClock() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  );
}

function Diamond({ variant }: { variant: 'gold' | 'teal' }) {
  return (
    <span className={`${styles.svcDiamond} ${variant === 'gold' ? styles.svcDiamondGold : styles.svcDiamondTeal}`}>
      <span className={`${styles.svcDiamondInner} ${variant === 'gold' ? styles.svcDiamondInnerGold : styles.svcDiamondInnerTeal}`} />
    </span>
  );
}

async function genQR(text: string): Promise<string> {
  return await QRCode.toString(text, {
    type: 'svg',
    errorCorrectionLevel: 'H',
    margin: 0,
    color: { dark: '#04060C', light: '#FFFFFF' },
  });
}

const SVCS_DESIGN = [
  { title: 'Инженерно-геодезические изыскания',  desc: 'Топосъёмка, разбивка, мониторинг деформаций пути, геодезические сети.' },
  { title: 'Инженерно-геологические изыскания',  desc: 'Бурение, лабораторные испытания грунтов, гидрогеология, оценка сейсмичности.' },
  { title: 'Проектные работы полного цикла',     desc: 'ПСД, рабочая документация, прохождение экспертизы в РГП «ГосЭкспертиза».' },
  { title: 'Технические возможности примыкания', desc: 'Согласование с филиалами АО «НК «КТЖ», план путевого развития, ТЭО.' },
  { title: 'Проектирование инженерных сетей',    desc: 'ВЛ-10/110 кВ, газопроводы, водопровод, канализация, кабельные линии.' },
  { title: 'Землеустроительные проекты',         desc: 'Формирование участков, документация для отвода земель под капстроительство.' },
];

const SVCS_BUILD = [
  { title: 'Строительство ж/д подъездных путей', desc: 'Земляные работы, рельсошпальная решётка Р65, стрелочные переводы марки 1/9 и 1/7.' },
  { title: 'Капитальный ремонт путей',           desc: 'Разборка/сборка/укладка РШР, балластировка, выправка, регулировка стыков.' },
  { title: 'Текущее содержание ж/д путей',       desc: 'Промеры пути 2 раза в месяц, замена шпал и рельсов, обслуживание стрелочных переводов.' },
  { title: 'Эстакады и повышенные пути',         desc: 'Сборные ж/б блоки, бетонирование верха, погрузо-выгрузочные рампы.' },
  { num: 'C · 05', title: 'Электрификация и СЦБ',               desc: 'Установка стоек СВ-95/105, монтаж ВЛ-06 кВ, светофоры, переездная сигнализация.' },
  { num: 'C · 06', title: 'Демонтажные работы',                 desc: 'Демонтаж РШР, стрелочных переводов, устройств БМРЦ. Опыт: АО «Уральская Сталь».' },
];

export default async function PortfolioPrintPage() {
  const projects = await getProjects();
  const designProjects = await getDesignProjects();

  const completed  = projects.filter(p => p.status === 'completed').length;
  const inProgress = projects.filter(p => p.status === 'in-progress').length;
  const planned    = projects.filter(p => p.status === 'planned').length;

  const URL_PROJECTS = 'https://arlan-gr.kz/projects';
  const URL_DESIGN   = 'https://arlan-gr.kz/design';

  const [qrProjects, qrDesign] = await Promise.all([
    genQR(URL_PROJECTS),
    genQR(URL_DESIGN),
  ]);

  const TOTAL = 17;
  const p = (n: number) => `${String(n).padStart(2, '0')} / ${TOTAL}`;

  return (
    <main className={styles.book}>
      <PrintButtons />

      {/* ═══ 01 · COVER ═══ */}
      <section className={`${styles.page} ${styles.pageDark} ${styles.cover}`}>
        <div className={styles.coverGrid} />
        <div className={styles.coverContent}>
          <div className={styles.coverEyebrow}>ПОРТФОЛИО · 2026</div>
          <WagTriangle className={styles.coverTriangle} />
          <h1 className={styles.coverTitle}>
            WEST ARLAN<br />
            <span className={styles.coverTitleAccent}>GROUP</span>
          </h1>
          <p className={styles.coverPositioning}>
            Железнодорожные пути для промышленных<br />
            предприятий Казахстана и России
          </p>
        </div>
        <div className={styles.coverBottom}>
          <span>АКТОБЕ · РЕСПУБЛИКА КАЗАХСТАН</span>
          <span>ARLAN-GR.KZ</span>
        </div>
      </section>

      {/* ═══ 02 · ABOUT ═══ */}
      <section className={`${styles.page} ${styles.pageLight}`}>
        <Corners pageNum={p(2)} />
        <div className={styles.sectionInner}>
          <div className={styles.sectionLabel}>О компании</div>
          <h2 className={styles.sectionTitle}>
            Мы строим<br />
            <span className={styles.sectionTitleAccent}>инфраструктуру страны</span>
          </h2>
          <p className={styles.aboutLead}>
            Полный цикл: от геодезических изысканий и проектирования до строительства и сдачи
            объекта «под ключ».
          </p>
          <div className={styles.aboutGrid}>
            <div className={styles.aboutCol}>
              <h3>· Наша миссия</h3>
              <p>
                Создавать надёжную инфраструктуру для будущего Казахстана. Важной причиной
                успеха компании является слаженная работа специалистов, их целеустремлённость
                и нацеленность на результат. Мы неукоснительно следуем нашим ценностям, формируя
                положительный имидж компании и укрепляя доверие партнёров.
              </p>
            </div>
            <div className={styles.aboutCol}>
              <h3>· Виды деятельности</h3>
              <p>
                Компания ведёт инженерно-изыскательскую деятельность, проектную деятельность
                I категории и строительно-монтажные работы I категории. Мы выполняем полный цикл
                работ: от геодезических изысканий до сдачи объектов под ключ.
              </p>
            </div>
          </div>

          <div className={styles.legalLabel}>Юридические лица группы</div>
          <div className={styles.legalCards}>
            <div className={styles.legalCard}>
              <div className={styles.legalCardName}>West Arlan Group</div>
              <div className={styles.legalCardRole}>Головная компания группы</div>
              <div className={styles.legalCardMeta}>ТОО · БИН 090940003245 · Актобе</div>
            </div>
            <div className={styles.legalCard}>
              <div className={styles.legalCardName}>West Capital Construction LLP</div>
              <div className={styles.legalCardRole}>Член группы · СМР</div>
              <div className={styles.legalCardMeta}>Договорная история с 2010 г.</div>
            </div>
            <div className={styles.legalCard}>
              <div className={styles.legalCardName}>Global Construction Project</div>
              <div className={styles.legalCardRole}>Член группы · проектные работы</div>
              <div className={styles.legalCardMeta}>—</div>
            </div>
          </div>
          <div className={styles.legalNote}>
            Все три компании входят в группу West Arlan Group, работают по единой политике качества
            и держат лицензии I категории.
          </div>

          <WagTriangle className={styles.aboutWatermark} />
        </div>
      </section>

      {/* ═══ 03 · NUMBERS ═══ */}
      <section className={`${styles.page} ${styles.pageDark}`}>
        <Corners pageNum={p(3)} />
        <div className={styles.numbersInner}>
          <div className={`${styles.sectionLabel} ${styles.darkLabel}`}>Масштаб работ</div>
          <h2 className={styles.darkTitle}>За пятнадцать лет<br />работы</h2>
          <div className={styles.numbersGrid}>
            <div className={styles.numberBlock}>
              <div className={styles.numberValue}>{projects.length}</div>
              <div className={styles.numberLabel}>СМР объектов</div>
              <div className={styles.numberDesc}>
                Реализованных и текущих строительно-монтажных проектов в реестре с 2015 года
              </div>
            </div>
            <div className={styles.numberBlock}>
              <div className={styles.numberValue}>{designProjects.length}</div>
              <div className={styles.numberLabel}>Проектных работ</div>
              <div className={styles.numberDesc}>
                Рабочих проектов, ТЭО, землеустроительных проектов, пройденных экспертиз
              </div>
            </div>
            <div className={styles.numberBlock}>
              <div className={styles.numberValue}>16</div>
              <div className={styles.numberLabel}>регионов</div>
              <div className={styles.numberDesc}>
                Актюбинская, ЗКО, Атырауская, Мангистауская, Алматы, Астана и другие
              </div>
            </div>
            <div className={styles.numberBlock}>
              <div className={styles.numberValue}>2</div>
              <div className={styles.numberLabel}>страны</div>
              <div className={styles.numberDesc}>
                Казахстан и Россия (АО «Уральская Сталь», Оренбургская область)
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 04 · GEOGRAPHY ═══ */}
      <section className={`${styles.page} ${styles.pageDark}`}>
        <Corners pageNum={p(4)} />
        <div className={styles.geoInner}>
          <div className={`${styles.sectionLabel} ${styles.darkLabel}`}>География работ</div>
          <h2 className={styles.darkTitle}>География работ</h2>
          <div className={styles.geoMapWrap}>
            <svg viewBox="-100 30 1200 820" className={styles.geoMapSvg} xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
              <defs>
                <pattern id="printGrid" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                  <path d="M60,0 L0,0 L0,60" fill="none" stroke="rgba(201,148,31,0.06)" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect x="-100" y="30" width="1200" height="820" fill="url(#printGrid)" />
              <g transform="translate(-50,874) scale(0.1,-0.1)">
                <path d={KZ_MAIN} fill="rgba(13,18,34,0.5)" stroke="none" />
                <path d={KZ_MAIN} fill="none" stroke="rgba(0,168,142,0.6)" strokeWidth="15" strokeLinejoin="round" strokeLinecap="round" />
                <path d={KZ_MAIN} fill="none" stroke="rgba(201,148,31,0.45)" strokeWidth="8" strokeLinejoin="round" strokeDasharray="80 200" />
              </g>
              {/* Russia point — Orenburg / Novotroitsk (no label) */}
              <g>
                <circle cx={310} cy={140} r="16" fill="#4F84FF" opacity="0.22" />
                <circle cx={310} cy={140} r="6" fill="#4F84FF" />
              </g>
              {projects.filter((pr) => pr.x_map != null && pr.y_map != null).slice(0, 30).map((pr) => {
                const color = pr.status === 'completed' ? '#C9941F' : pr.status === 'in-progress' ? '#00A88E' : '#4F84FF';
                return (
                  <g key={pr.id}>
                    <circle cx={pr.x_map!} cy={pr.y_map!} r="14" fill={color} opacity="0.22" />
                    <circle cx={pr.x_map!} cy={pr.y_map!} r="5" fill={color} />
                  </g>
                );
              })}
            </svg>
          </div>
          <div className={styles.geoLegend}>
            <div className={styles.geoLegendItem}><span className={styles.geoLegendDot} style={{ background: '#C9941F' }} /> Завершено · {completed}</div>
            <div className={styles.geoLegendItem}><span className={styles.geoLegendDot} style={{ background: '#00A88E' }} /> В работе · {inProgress}</div>
            <div className={styles.geoLegendItem}><span className={styles.geoLegendDot} style={{ background: '#4F84FF' }} /> В планах · {planned}</div>
          </div>
          <p className={styles.geoCaption}>
            Мы работаем по всей территории Казахстана и ближнего зарубежья.
          </p>
        </div>
      </section>

      {/* ═══ 05 · ISO ═══ */}
      <section className={`${styles.page} ${styles.pageLight}`}>
        <Corners pageNum={p(5)} />
        <div className={styles.sectionInner}>
          <div className={styles.sectionLabel}>Сертификаты · ISO</div>
          <h2 className={styles.sectionTitle}>
            Международные<br />
            <span className={styles.sectionTitleAccent}>стандарты качества</span>
          </h2>
          <div className={styles.licensesGrid}>
            <div className={styles.licenseCard}>
              <img src="/licenses/sertifikat-iso-9001-ru.webp" alt="ISO 9001" className={styles.licenseImg} />
              <div className={styles.licenseMeta}>
                <div className={styles.licenseName}>ISO 9001 · Quality Management</div>
                <div className={styles.licenseDetail}>Система менеджмента качества</div>
              </div>
            </div>
            <div className={styles.licenseCard}>
              <img src="/licenses/sertifikat-iso-9001-kz.webp" alt="ISO 9001 KZ" className={styles.licenseImg} />
              <div className={styles.licenseMeta}>
                <div className={styles.licenseName}>ISO 9001 · KZ</div>
                <div className={styles.licenseDetail}>Сертификат качества Республики Казахстан</div>
              </div>
            </div>
            <div className={styles.licenseCard}>
              <img src="/licenses/sertifikat-ekologicheskiy-menedzhment.webp" alt="ISO 14001" className={styles.licenseImg} />
              <div className={styles.licenseMeta}>
                <div className={styles.licenseName}>ISO 14001 · Environmental</div>
                <div className={styles.licenseDetail}>Экологический менеджмент</div>
              </div>
            </div>
            <div className={styles.licenseCard}>
              <img src="/licenses/sertifikat-iso-9001-2016.webp" alt="ISO 9001 2016" className={styles.licenseImg} />
              <div className={styles.licenseMeta}>
                <div className={styles.licenseName}>ISO 9001:2016</div>
                <div className={styles.licenseDetail}>Аудит процессов · ресертификация</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 06 · LICENSE: СМР ═══ */}
      <section className={`${styles.page} ${styles.pageLight}`}>
        <Corners pageNum={p(6)} />
        <div className={styles.licPageInner}>
          <div className={styles.licHeader}>
            <div className={styles.licHeaderLeft}>
              <span className={styles.licNumber}>№ 25008103 · от 14.03.2025</span>
              <h2 className={styles.licTitleLarge}>Строительно-монтажные работы</h2>
            </div>
            <span className={styles.licCategoryBadge}>I КАТЕГОРИЯ</span>
          </div>
          <div className={styles.licScanWrap}>
            <img src="/portfolio/page8_img2.jpeg" alt="Лицензия СМР" className={styles.licScanImg} />
          </div>
          <div className={styles.licMetaRow}>
            <div className={styles.licMetaItem}>
              <div className={styles.licMetaLabel}>Орган выдачи</div>
              <div className={styles.licMetaValue}>Управление ГАСК Актюбинской области</div>
            </div>
            <div className={styles.licMetaItem}>
              <div className={styles.licMetaLabel}>Первичная выдача</div>
              <div className={styles.licMetaValue}>13.07.2010</div>
            </div>
            <div className={styles.licMetaItem}>
              <div className={styles.licMetaLabel}>Срок действия</div>
              <div className={styles.licMetaValue}>до 25.06.2027</div>
            </div>
            <div className={styles.licMetaItem}>
              <div className={styles.licMetaLabel}>Объём</div>
              <div className={styles.licMetaValue}>Все виды СМР I кат.</div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 07 · LICENSE: ПРОЕКТНАЯ ═══ */}
      <section className={`${styles.page} ${styles.pageLight}`}>
        <Corners pageNum={p(7)} />
        <div className={styles.licPageInner}>
          <div className={styles.licHeader}>
            <div className={styles.licHeaderLeft}>
              <span className={styles.licNumber}>№ 25031072 · от 05.09.2025</span>
              <h2 className={styles.licTitleLarge}>Проектная деятельность</h2>
            </div>
            <span className={styles.licCategoryBadge}>I КАТЕГОРИЯ</span>
          </div>
          <div className={styles.licScanWrap}>
            <img src="/portfolio/page7_img3.jpeg" alt="Лицензия проектная" className={styles.licScanImg} />
          </div>
          <div className={styles.licMetaRow}>
            <div className={styles.licMetaItem}>
              <div className={styles.licMetaLabel}>Орган выдачи</div>
              <div className={styles.licMetaValue}>Управление ГАСК Актюбинской области</div>
            </div>
            <div className={styles.licMetaItem}>
              <div className={styles.licMetaLabel}>Первичная выдача</div>
              <div className={styles.licMetaValue}>28.04.2010</div>
            </div>
            <div className={styles.licMetaItem}>
              <div className={styles.licMetaLabel}>Срок действия</div>
              <div className={styles.licMetaValue}>Бессрочно · класс 1</div>
            </div>
            <div className={styles.licMetaItem}>
              <div className={styles.licMetaLabel}>Объём</div>
              <div className={styles.licMetaValue}>Полный цикл ПСД</div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 08 · LICENSE: ЭКОЛОГИЯ ═══ */}
      <section className={`${styles.page} ${styles.pageLight}`}>
        <Corners pageNum={p(8)} />
        <div className={styles.licPageInner}>
          <div className={styles.licHeader}>
            <div className={styles.licHeaderLeft}>
              <span className={styles.licNumber}>№ 02962Р · от 22.09.2025</span>
              <h2 className={styles.licTitleLarge}>Охрана окружающей среды</h2>
            </div>
            <span className={styles.licCategoryBadge}>КЛАСС 1</span>
          </div>
          <div className={styles.licScanWrap}>
            <img src="/portfolio/page7_img1.jpeg" alt="Лицензия экологическая" className={styles.licScanImg} />
          </div>
          <div className={styles.licMetaRow}>
            <div className={styles.licMetaItem}>
              <div className={styles.licMetaLabel}>Орган выдачи</div>
              <div className={styles.licMetaValue}>Министерство экологии и природных ресурсов РК</div>
            </div>
            <div className={styles.licMetaItem}>
              <div className={styles.licMetaLabel}>Место выдачи</div>
              <div className={styles.licMetaValue}>г. Астана</div>
            </div>
            <div className={styles.licMetaItem}>
              <div className={styles.licMetaLabel}>Особые условия</div>
              <div className={styles.licMetaValue}>Неотчуждаемая</div>
            </div>
            <div className={styles.licMetaItem}>
              <div className={styles.licMetaLabel}>Объём</div>
              <div className={styles.licMetaValue}>Раздел ОВОС в составе ПСД</div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 09 · DESIGN SERVICES ═══ */}
      <section className={`${styles.page} ${styles.pageDark}`}>
        <Corners pageNum={p(9)} />
        <div className={styles.svcInner}>
          <h2 className={`${styles.svcDirTitle} ${styles.svcDirTitleGold}`}>
            <strong>Проектирование</strong> и инженерные изыскания
          </h2>
          <p className={styles.svcDirLead}>
            Получаете комплект документов, готовый для прохождения РГП «ГосЭкспертиза»,
            с согласованным планом примыкания к магистральной сети КТЖ. Лицензия I категории
            на проектную деятельность с 2010 года.
          </p>
          <div className={styles.svcList}>
            {SVCS_DESIGN.map((s) => (
              <div key={s.title} className={styles.svcItem}>
                <Diamond variant="gold" />
                <div className={styles.svcItemBody}>
                  <div className={styles.svcItemTitle}>{s.title}</div>
                  <div className={styles.svcItemDesc}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <div className={styles.svcFooter}>
            <span>{designProjects.length} проектных работ в реестре</span>
            <span>arlan-gr.kz / design</span>
          </div>
        </div>
      </section>

      {/* ═══ 10 · BUILD SERVICES ═══ */}
      <section className={`${styles.page} ${styles.pageDark}`}>
        <Corners pageNum={p(10)} />
        <div className={styles.svcInner}>
          <h2 className={`${styles.svcDirTitle} ${styles.svcDirTitleTeal}`}>
            <strong>Строительно-монтажные</strong> работы
          </h2>
          <p className={styles.svcDirLead}>
            Лицензия I категории на СМР с 2010 года. Подъездные железнодорожные пути на промышленных
            объектах, в индустриальных зонах и в составе АО «НК «КТЖ» — Грузовые перевозки.
          </p>
          <div className={styles.svcList}>
            {SVCS_BUILD.map((s) => (
              <div key={s.title} className={styles.svcItem}>
                <Diamond variant="teal" />
                <div className={styles.svcItemBody}>
                  <div className={styles.svcItemTitle}>{s.title}</div>
                  <div className={styles.svcItemDesc}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <div className={styles.svcFooter}>
            <span>{projects.length} СМР объектов в реестре</span>
            <span>arlan-gr.kz / projects</span>
          </div>
        </div>
      </section>

      {/* ═══ 11 · QR PORTFOLIO ═══ */}
      <section className={`${styles.page} ${styles.pageLight}`}>
        <Corners pageNum={p(11)} />
        <div className={styles.qrInner}>
          <div className={styles.sectionLabel}>Полный реестр</div>
          <h2 className={styles.sectionTitle}>
            Портфолио<br />
            <span className={styles.sectionTitleAccent}>проектов и работ</span>
          </h2>
          <p className={styles.qrIntro}>
            Актуальный реестр проектов с полным составом работ, заказчиками, сроками и статусами
            — на сайте. Реестр обновляется по мере сдачи новых объектов.
          </p>

          <div className={styles.qrGrid}>
            <div className={`${styles.qrCard} ${styles.qrCard_gold}`}>
              <div className={styles.qrCardTitle}>Строительные работы</div>
              <div className={styles.qrCount}>{projects.length}</div>
              <div className={styles.qrCountLabel}>СМР объектов · 2015—2026</div>
              <div className={styles.qrCodeWrap} dangerouslySetInnerHTML={{ __html: qrProjects }} />
              <div className={styles.qrUrl}>arlan-gr.kz/projects</div>
              <div className={styles.qrHint}>Сканируйте камерой телефона</div>
            </div>

            <div className={`${styles.qrCard} ${styles.qrCard_teal}`}>
              <div className={styles.qrCardTitle}>Проектные работы</div>
              <div className={styles.qrCount}>{designProjects.length}</div>
              <div className={styles.qrCountLabel}>проектных работ · ПСД и ТЭО</div>
              <div className={styles.qrCodeWrap} dangerouslySetInnerHTML={{ __html: qrDesign }} />
              <div className={styles.qrUrl}>arlan-gr.kz/design</div>
              <div className={styles.qrHint}>Сканируйте камерой телефона</div>
            </div>
          </div>

        </div>
      </section>

      {/* ═══ 12–15 · TESTIMONIALS (3 on first page, 4 on the rest) ═══ */}
      {(() => {
        const FIRST = 3;
        const PER = 4;
        const chunks: PrintTestimonial[][] = [];
        chunks.push(PRINT_TESTIMONIALS.slice(0, FIRST));
        for (let i = FIRST; i < PRINT_TESTIMONIALS.length; i += PER) {
          chunks.push(PRINT_TESTIMONIALS.slice(i, i + PER));
        }
        return chunks.map((chunk, ci) => (
          <section key={`test-${ci}`} className={`${styles.page} ${styles.pageLight}`}>
            <Corners pageNum={p(12 + ci)} />
            <div className={styles.sectionInner}>
              {ci === 0 ? (
                <>
                  <div className={styles.sectionLabel}>Отзывы клиентов</div>
                  <h2 className={styles.sectionTitle}>
                    Что говорят<br />
                    <span className={styles.sectionTitleAccent}>наши заказчики</span>
                  </h2>
                  <p className={styles.testimonialIntro}>
                    Большинство писем адресованы подрядной компании группы —
                    West Capital Construction LLP — по объектам, сданным в эксплуатацию заказчикам.
                  </p>
                </>
              ) : (
                <div className={styles.testContd}>
                  <span>Отзывы клиентов · продолжение</span>
                  <span>стр. {ci + 1} из {chunks.length}</span>
                </div>
              )}

              <div className={styles.testGrid}>
                {chunk.map((t, ti) => (
                  <article key={`${ci}-${ti}`} className={styles.testCard}>
                    <div className={styles.testCardHeader}>
                      <span className={styles.testCardCategory}>{t.category}</span>
                      {t.date && <span className={styles.testCardDate}>{t.date}</span>}
                    </div>
                    <h3 className={styles.testCardClient}>{t.client}</h3>
                    <p className={styles.testCardQuote}>«{t.quote}»</p>
                    <div className={styles.testCardSig}>
                      <div className={styles.testCardSigName}>{t.signatory}</div>
                      <div className={styles.testCardSigRole}>{t.role}</div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        ));
      })()}

      {/* ═══ 16 · PARTNERS ═══ */}
      <section className={`${styles.page} ${styles.pageLight}`}>
        <Corners pageNum={p(16)} />
        <div className={styles.sectionInner}>
          <div className={styles.sectionLabel}>Партнёры и заказчики</div>
          <h2 className={styles.sectionTitle}>
            Нам доверяют<br />
            <span className={styles.sectionTitleAccent}>крупнейшие компании</span> страны
          </h2>
          <div className={styles.partnersGrid}>
            {PARTNERS.map((pa) => (
              <div key={pa.file} className={styles.partnerCard}>
                <img src={`/partners/${pa.file}`} alt={pa.name} className={styles.partnerLogo} />
                <div className={styles.partnerName}>{pa.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 17 · CONTACTS / BACK COVER ═══ */}
      <section className={`${styles.page} ${styles.pageDark}`}>
        <Corners pageNum={p(17)} />
        <div className={styles.contactsInner}>
          <div className={`${styles.sectionLabel} ${styles.darkLabel}`}>Контакты</div>
          <h2 className={styles.contactsTitle}>
            Готовы<br />
            <span className={styles.contactsTitleAccent}>к сотрудничеству</span>
          </h2>
          <div className={styles.contactsGrid}>
            <div className={styles.contactItem}>
              <div className={styles.contactIcon}><IconPhone /></div>
              <div className={styles.contactBody}>
                <div className={styles.contactLabel}>Телефон офиса</div>
                <div className={styles.contactValue}>8 (7132) 538-288</div>
              </div>
            </div>
            <div className={styles.contactItem}>
              <div className={styles.contactIcon}><IconMail /></div>
              <div className={styles.contactBody}>
                <div className={styles.contactLabel}>Email</div>
                <div className={styles.contactValue}>west_arlan-group@mail.ru</div>
              </div>
            </div>
            <div className={styles.contactItem}>
              <div className={styles.contactIcon}><IconPin /></div>
              <div className={styles.contactBody}>
                <div className={styles.contactLabel}>Адрес</div>
                <div className={styles.contactValue}>Республика Казахстан, Актюбинская обл.,<br />г. Актобе, ул. Казангапа, дом 57В, офис 34</div>
              </div>
            </div>
            <div className={styles.contactItem}>
              <div className={styles.contactIcon}><IconClock /></div>
              <div className={styles.contactBody}>
                <div className={styles.contactLabel}>Режим работы</div>
                <div className={styles.contactValue}>Пн — Пт · 09:00 — 18:00 (GMT+5)</div>
              </div>
            </div>
          </div>

          <div className={styles.contactsTeamLabel}>Прямые контакты руководства</div>
          <div className={styles.contactsTeam}>
            <div className={styles.teamItem}>
              <div className={styles.teamRole}>Генеральный директор</div>
              <div className={styles.teamName}>Аронов Аян Садиржанович</div>
              <div className={styles.teamPhone}>+7 (777) 669-99-89</div>
            </div>
            <div className={styles.teamItem}>
              <div className={styles.teamRole}>Директор проектной группы</div>
              <div className={styles.teamName}>Валеев Алексей Сергеевич</div>
              <div className={styles.teamPhone}>+7 (775) 645-90-51</div>
            </div>
            <div className={styles.teamItem}>
              <div className={styles.teamRole}>Директор по производству</div>
              <div className={styles.teamName}>Прусс Альберт Русланович</div>
              <div className={styles.teamPhone}>+7 (747) 135-14-92</div>
            </div>
            <div className={styles.teamItem}>
              <div className={styles.teamRole}>Главный инженер проекта</div>
              <div className={styles.teamName}>Штурмилов Валентин Петрович</div>
              <div className={styles.teamPhone}>+7 (771) 229-38-78</div>
            </div>
          </div>

          <div className={styles.legal}>
            <div><strong>ТОО «West Arlan Group»</strong><br />БИН 090940003245</div>
            <div><strong>Лицензии</strong><br />СМР № 25008103 · ПД № 25031072 · ОС № 02962Р</div>
          </div>

          <div className={styles.contactsFooter}>
            <div>
              <div className={styles.contactLabel}>Сайт</div>
              <div className={styles.contactsWebsite}>arlan-gr.kz</div>
            </div>
            <WagTriangle className={styles.contactsTriangle} />
          </div>
        </div>
      </section>
    </main>
  );
}

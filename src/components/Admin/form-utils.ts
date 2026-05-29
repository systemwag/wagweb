/** Shared helpers for the admin project/maintenance forms. */

/** Transliterate RU → latin and slugify a title for use in a URL. */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[а-яёa-z0-9]+/gi, m =>
      [...m].map(c => {
        const map: Record<string, string> = {
          а:'a',б:'b',в:'v',г:'g',д:'d',е:'e',ё:'yo',ж:'zh',з:'z',и:'i',й:'y',к:'k',
          л:'l',м:'m',н:'n',о:'o',п:'p',р:'r',с:'s',т:'t',у:'u',ф:'f',х:'kh',ц:'ts',
          ч:'ch',ш:'sh',щ:'shch',ъ:'',ы:'y',ь:'',э:'e',ю:'yu',я:'ya',
        };
        return map[c] ?? c;
      }).join('')
    )
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Extract the storage object path from a full Supabase public image URL. */
export function urlToPath(url: string): string | null {
  const match = url.match(/\/storage\/v1\/object\/public\/project-images\/(.+)$/);
  return match ? match[1] : null;
}

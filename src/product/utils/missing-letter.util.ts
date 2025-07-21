export function getMissingLetter(name: string): string {
 if (!name || typeof name !== 'string') return '_';

  const letters = new Set(name.toLowerCase().replace(/[^a-z]/g, ''));

  for (let i = 97; i <= 122; i++) {
    const letter = String.fromCharCode(i);
    if (!letters.has(letter)) return letter;
  }

  return '_';
}
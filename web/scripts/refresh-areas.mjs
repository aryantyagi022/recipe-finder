import { writeFile } from 'node:fs/promises';

const BASE = 'https://www.themealdb.com/api/json/v1/1';
const LETTERS = 'abcdefghijklmnopqrstuvwxyz'.split('');
const OUTPUT = new URL('../src/lib/api/areas.ts', import.meta.url);

async function fetchLetter(letter) {
	for (let attempt = 1; attempt <= 3; attempt += 1) {
		try {
			const response = await fetch(`${BASE}/search.php?f=${letter}`);
			if (!response.ok) throw new Error(`status ${response.status}`);
			const data = await response.json();
			return data.meals ?? [];
		} catch (error) {
			if (attempt === 3) throw new Error(`Failed to fetch letter "${letter}": ${error.message}`);
			await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
		}
	}
}

const areas = new Set();
let meals = 0;

for (const letter of LETTERS) {
	const batch = await fetchLetter(letter);
	meals += batch.length;
	for (const meal of batch) {
		if (meal.strArea) areas.add(meal.strArea.trim());
	}
}

if (areas.size === 0) throw new Error('Refusing to write an empty area list.');

const sorted = [...areas].sort((a, b) => a.localeCompare(b));
const body = `export const AREAS = [
${sorted.map((area) => `\t'${area.replace(/'/g, "\\'")}'`).join(',\n')}
] as const;
`;

await writeFile(OUTPUT, body);
console.log(`Wrote ${sorted.length} areas from ${meals} meals to ${OUTPUT.pathname}.`);

// fetchDefinition.ts

export async function fetchDefinition(word: string): Promise<string> {
  const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
  if (!response.ok) {
    throw new Error('Failed to fetch definition');
  }
  const data = await response.json();
  if (data.length > 0 && data[0].meanings.length > 0 && data[0].meanings[0].definitions.length > 0) {
    return data[0].meanings[0].definitions[0].definition;
  }
  throw new Error('No definition found');
}
export function parseItinerary<T = unknown>(raw: string): T {
  if (typeof raw !== 'string') {
    throw new Error('Itinerary must be a string')
  }

  // Remove markdown fences: ```json ... ```
  const cleaned = raw
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim()

  try {
    return JSON.parse(cleaned) as T
  } catch (err) {
    console.error('Failed to parse itinerary JSON:', err)
    throw new Error('Invalid itinerary JSON format')
  }
}

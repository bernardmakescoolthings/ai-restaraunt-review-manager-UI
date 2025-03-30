import { Review } from '@/types/review';

function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let currentValue = '';
  let insideQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (char === ',' && !insideQuotes) {
      values.push(currentValue);
      currentValue = '';
    } else {
      currentValue += char;
    }
  }
  
  values.push(currentValue);
  return values;
}

export async function parseCSVData(): Promise<Review[]> {
  try {
    const response = await fetch('/data/harborview_data.csv');
    const text = await response.text();
    const rows = text.split('\n').filter(row => row.trim()); // Remove empty lines
    
    // Skip header row
    return rows.slice(1).map(row => {
      const [
        id_review = '',
        caption = '',
        relative_date = '',
        retrieval_date = '',
        rating = '0',
        username = '',
        n_review_user = '0',
        n_photo_user = '0',
        url_user = ''
      ] = parseCSVLine(row);

      return {
        id_review,
        caption: caption.trim(),
        relative_date,
        retrieval_date,
        rating: parseFloat(rating) || 0,
        username,
        n_review_user: parseInt(n_review_user) || 0,
        n_photo_user: parseInt(n_photo_user) || 0,
        url_user
      };
    }).filter(review => review.id_review); // Filter out any invalid rows
  } catch (error) {
    console.error('Error parsing CSV:', error);
    return [];
  }
} 
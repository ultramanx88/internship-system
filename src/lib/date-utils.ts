/**
 * Utility functions for handling Thai Buddhist Era dates
 * Format: MM/DD/YYYY (Buddhist Era)
 */

/**
 * Convert Gregorian year to Buddhist Era year
 */
export function toBuddhistYear(gregorianYear: number): number {
  return gregorianYear + 543;
}

/**
 * Convert Buddhist Era year to Gregorian year
 */
export function toGregorianYear(buddhistYear: number): number {
  return buddhistYear - 543;
}

/**
 * Format date to Thai format (MM/DD/YYYY BE)
 */
export function formatThaiDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const buddhistYear = toBuddhistYear(date.getFullYear());
  
  return `${month}/${day}/${buddhistYear}`;
}

/**
 * Parse Thai date string (MM/DD/YYYY BE) to Date object
 */
export function parseThaiDate(thaiDateString: string): Date | null {
  try {
    const [month, day, buddhistYear] = thaiDateString.split('/').map(Number);
    
    if (!month || !day || !buddhistYear) {
      return null;
    }
    
    const gregorianYear = toGregorianYear(buddhistYear);
    const date = new Date(gregorianYear, month - 1, day);
    
    // Validate the date
    if (date.getFullYear() !== gregorianYear || 
        date.getMonth() !== month - 1 || 
        date.getDate() !== day) {
      return null;
    }
    
    return date;
  } catch (error) {
    return null;
  }
}

/**
 * Convert HTML date input value (YYYY-MM-DD) to Thai format (MM/DD/YYYY BE)
 */
export function htmlDateToThai(htmlDate: string): string {
  if (!htmlDate) return '';
  
  const date = new Date(htmlDate);
  return formatThaiDate(date);
}

/**
 * Convert Thai format (MM/DD/YYYY BE) to HTML date input value (YYYY-MM-DD)
 */
export function thaiDateToHtml(thaiDate: string): string {
  const date = parseThaiDate(thaiDate);
  if (!date) return '';
  
  const year = String(date.getFullYear()).padStart(4, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

/**
 * Get current date in Thai format
 */
export function getCurrentThaiDate(): string {
  return formatThaiDate(new Date());
}

/**
 * Validate Thai date string format
 */
export function isValidThaiDate(thaiDate: string): boolean {
  const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
  if (!dateRegex.test(thaiDate)) {
    return false;
  }
  
  return parseThaiDate(thaiDate) !== null;
}

/**
 * Format date for display in Thai locale
 */
export function formatThaiDateLong(date: Date): string {
  const thaiMonths = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];
  
  const day = date.getDate();
  const month = thaiMonths[date.getMonth()];
  const buddhistYear = toBuddhistYear(date.getFullYear());
  
  return `${day} ${month} ${buddhistYear}`;
}

/**
 * Get min/max dates for date inputs (in HTML format)
 */
export function getDateLimits(allowPastDates: boolean = false) {
  const today = new Date();
  const currentYear = today.getFullYear();
  
  // Min date: today (or 1 year ago if past dates allowed)
  const minDate = allowPastDates 
    ? new Date(currentYear - 1, 0, 1)
    : today;
    
  // Max date: 2 years from now
  const maxDate = new Date(currentYear + 2, 11, 31);
  
  return {
    min: minDate.toISOString().split('T')[0],
    max: maxDate.toISOString().split('T')[0]
  };
}

/**
 * Check if a date is in the past (before today)
 */
export function isDateInPast(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to start of day
  
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);
  
  return checkDate < today;
}

/**
 * Check if a Thai date string represents a past date
 */
export function isThaiDateInPast(thaiDate: string): boolean {
  const date = parseThaiDate(thaiDate);
  if (!date) return false;
  
  return isDateInPast(date);
}
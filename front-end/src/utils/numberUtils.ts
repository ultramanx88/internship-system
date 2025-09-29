// Dictionary for Arabic to Thai number conversion
const thaiNumbers: { [key: string]: string } = {
  '0': '๐',
  '1': '๑',
  '2': '๒',
  '3': '๓',
  '4': '๔',
  '5': '๕',
  '6': '๖',
  '7': '๗',
  '8': '๘',
  '9': '๙',
};

/**
 * Converts Arabic numerals in a string to Thai numerals.
 * @param arabicNumber - The string containing Arabic numerals.
 * @returns A string with Arabic numerals replaced by Thai numerals.
 */
export const toThaiNumber = (arabicNumber: string | number): string => {
  const numStr = String(arabicNumber);
  return numStr.replace(/[0-9]/g, (digit) => thaiNumbers[digit] || digit);
};

/**
 * Formats a date string or Date object based on the specified language.
 * For Thai, it will use the Buddhist calendar and Thai numerals.
 * For English, it will use the Gregorian calendar and Arabic numerals.
 *
 * @param dateInput - The date to format (string or Date object).
 * @param language - The target language ('th' or 'en').
 * @param options - Intl.DateTimeFormatOptions for customizing the format.
 * @returns A formatted date string.
 */
export const formatDateByLanguage = (
  dateInput: string | Date,
  language: 'th' | 'en',
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }
): string => {
  try {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }

    if (language === 'th') {
      // For Thai, format with Buddhist calendar and then convert numbers
      const beDate = new Intl.DateTimeFormat('th-TH-u-ca-buddhist', {
        ...options,
        // Ensure year is handled correctly
        year: options.year,
      }).format(date);

      // Convert any Arabic numerals in the formatted string to Thai numerals
      return toThaiNumber(beDate);
    } else {
      // For English, use standard formatting
      return new Intl.DateTimeFormat('en-US', options).format(date);
    }
  } catch (error) {
    console.error('Error formatting date:', error);
    return String(dateInput);
  }
};

// Example Usage:
//
// const myDate = new Date('2024-07-29');
//
// // English output: "July 29, 2024"
// console.log(formatDateByLanguage(myDate, 'en'));
//
// // Thai output: "๒๙ กรกฎาคม ๒๕๖๗"
// console.log(formatDateByLanguage(myDate, 'th'));
//
// // Number conversion: "๑๒๓๔๕"
// console.log(toThaiNumber('12345'));

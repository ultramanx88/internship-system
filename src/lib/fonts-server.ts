// Server-side font utilities
import { readFile } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import type { FontInfo } from "./fonts";

/**
 * โหลดฟอนต์จากไฟล์ (server-side only)
 */
export async function loadFont(fontPath: string): Promise<ArrayBuffer | null> {
  try {
    const fullPath = join(process.cwd(), fontPath);

    if (!existsSync(fullPath)) {
      console.log(`Font file not found: ${fullPath}`);
      return null;
    }

    const fontBytes = await readFile(fullPath);
    return new Uint8Array(fontBytes).buffer;
  } catch (error) {
    console.error(`Error loading font: ${fontPath}`, error);
    return null;
  }
}

/**
 * ตรวจสอบว่าฟอนต์มีอยู่หรือไม่ (server-side only)
 */
export function checkFontExists(fontPath: string): boolean {
  try {
    const fullPath = join(process.cwd(), fontPath);
    return existsSync(fullPath);
  } catch (error) {
    return false;
  }
}

/**
 * รับรายการฟอนต์ที่ใช้ได้ (server-side only)
 */
export function getAvailableFonts(fonts: FontInfo[]): FontInfo[] {
  return fonts.filter((font) => checkFontExists(font.path));
}

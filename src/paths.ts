import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function getLoginDataFilePath(): string {
  const customPath = process.env['CARELINK_LOGINDATA_FILE'];
  if (!customPath) {
    return path.join(__dirname, '..', 'logindata.json');
  }
  return path.isAbsolute(customPath) ? customPath : path.resolve(process.cwd(), customPath);
}

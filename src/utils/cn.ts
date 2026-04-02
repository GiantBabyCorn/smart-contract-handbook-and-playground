import { twMerge } from 'tailwind-merge';

export function cn(...inputs: (string | undefined | false | null)[]): string {
  return twMerge(...(inputs.filter(Boolean) as string[]));
}

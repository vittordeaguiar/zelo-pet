export const maskDate = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  const parts = [digits.slice(0, 4), digits.slice(4, 6), digits.slice(6, 8)].filter(Boolean);
  return parts.join('-');
};

export const maskTime = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  const parts = [digits.slice(0, 2), digits.slice(2, 4)].filter(Boolean);
  return parts.join(':');
};

export const maskNumber = (value: string) => {
  const cleaned = value.replace(/[^0-9.,]/g, '');
  const sepIndex = cleaned.search(/[.,]/);
  if (sepIndex === -1) return cleaned;
  const intPart = cleaned.slice(0, sepIndex).replace(/[.,]/g, '');
  const decPart = cleaned.slice(sepIndex + 1).replace(/[.,]/g, '');
  const separator = cleaned[sepIndex];
  return `${intPart}${separator}${decPart}`;
};

export const parseLocalizedNumber = (value: string) => {
  const cleaned = value.trim().replace(/[^0-9.,]/g, '');
  if (!cleaned) return NaN;
  const normalized = cleaned.replace(/,/g, '.');
  const dotIndex = normalized.indexOf('.');
  if (dotIndex === -1) return Number.parseFloat(normalized);
  const intPart = normalized.slice(0, dotIndex).replace(/\./g, '');
  const decPart = normalized.slice(dotIndex + 1).replace(/\./g, '');
  return Number.parseFloat(`${intPart}.${decPart}`);
};

export const isValidDateString = (value: string) => {
  if (!value || value.length !== 10) return false;
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  const test = new Date(year, month - 1, day);
  return (
    test.getFullYear() === year &&
    test.getMonth() === month - 1 &&
    test.getDate() === day
  );
};

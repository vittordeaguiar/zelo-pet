export const toDbBool = (value?: boolean) => (value ? 1 : 0);
export const fromDbBool = (value?: number | null) => Boolean(value);

export function generateExpiryDate(createdDate: Date, monthsToAdd: number): Date {
  const expiry = new Date(createdDate);
  expiry.setMonth(expiry.getMonth() + monthsToAdd);
  return expiry;
}

export function validateMimeType(mimeType: string, allowedTypes: string[]): boolean {
  return allowedTypes.includes(mimeType);
}

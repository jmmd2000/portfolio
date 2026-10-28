export function joinDetails(details: (string | null)[]): string {
  const setDetails = details.filter(detail => detail !== null);
  return setDetails.join(", ");
}

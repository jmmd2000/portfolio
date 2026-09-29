/** Joins the details that are set with " · ", skipping any that are null. */
export function joinDetails(details: (string | null)[]): string {
  const setDetails = details.filter(detail => detail !== null);
  return setDetails.join(" · ");
}

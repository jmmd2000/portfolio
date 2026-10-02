/** A submitted form's text fields by name. The admin forms have no file fields, so anything else is dropped */
export function formText(formData: FormData): Record<string, string> {
  const values: Record<string, string> = {};
  for (const [name, value] of formData) {
    if (typeof value === "string") values[name] = value;
  }
  return values;
}

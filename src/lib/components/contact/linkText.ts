/**
 * The readable text for a contact link: the address for an email link, and the host and path for a web
 * link, without "https://", "www." or a trailing slash. "https://www.linkedin.com/in/jamesmddoyle/" becomes
 * "linkedin.com/in/jamesmddoyle".
 */
export function linkText(url: string): string {
  const parsedURL = new URL(url);
  if (parsedURL.protocol === "mailto:") {
    return parsedURL.pathname;
  }

  const host = parsedURL.hostname.replace(/^www\./, "");
  const path = parsedURL.pathname.replace(/\/+$/, "");
  return `${host}${path}`;
}

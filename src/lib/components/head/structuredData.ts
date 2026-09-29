import type { Profile, Social } from "$lib/server/content/profile";
import { siteURL } from "$lib/site";

interface PersonStructuredData {
  "@context": "https://schema.org";
  "@type": "Person";
  name: string;
  jobTitle: string;
  url: string;
  sameAs: string[];
  email?: string;
}

/**
 * Describes the site owner for search engines as a schema.org Person. Web links become `sameAs`, the profiles
 * elsewhere that belong to the same person; an email link becomes `email`.
 */
export function buildPersonStructuredData(profile: Profile, socials: Social[]): PersonStructuredData {
  const webProfiles = socials.filter(social => social.url.startsWith("https://")).map(social => social.url);
  const person: PersonStructuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    jobTitle: profile.role,
    url: siteURL,
    sameAs: webProfiles,
  };

  const emailSocial = socials.find(social => social.url.startsWith("mailto:"));
  if (!emailSocial) {
    return person;
  }

  return { ...person, email: emailSocial.url.replace("mailto:", "") };
}

/**
 * Turns structured data into JSON that is safe inside a <script> tag. JSON.stringify leaves "<" alone, so a value
 * containing "</script>" would close the tag early. Writing every "<" as its JSON unicode escape keeps the data the
 * same when parsed, but the browser never sees a closing tag.
 */
export function toScriptJSON(data: object): string {
  return JSON.stringify(data).replaceAll("<", "\\u003c");
}

/** A complete JSON-LD script tag for the page head. */
export function jsonLDScriptTag(data: object): string {
  return `<script type="application/ld+json">${toScriptJSON(data)}</script>`;
}

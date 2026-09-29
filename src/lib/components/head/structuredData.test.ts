import { describe, expect, it } from "vitest";
import type { Profile, Social } from "$lib/server/content/profile";
import { buildPersonStructuredData, toScriptJSON } from "./structuredData";

const profile: Profile = { id: 1, name: "James Doyle", role: "Software Engineer", bio: "Bio.", location: "Dublin, Ireland" };

const socials: Social[] = [
  { id: 1, name: "GitHub", url: "https://github.com/jmmd2000", sort: 1 },
  { id: 2, name: "LinkedIn", url: "https://www.linkedin.com/in/jamesmddoyle/", sort: 2 },
  { id: 3, name: "Email", url: "mailto:hi@jamesmddoyle.com", sort: 3 },
];

describe("buildPersonStructuredData", () => {
  it("lists web profiles as sameAs and the email address separately", () => {
    const person = buildPersonStructuredData(profile, socials);

    expect(person.sameAs).toEqual(["https://github.com/jmmd2000", "https://www.linkedin.com/in/jamesmddoyle/"]);
    expect(person.email).toBe("hi@jamesmddoyle.com");
  });

  it("leaves email out when there's no email link", () => {
    const person = buildPersonStructuredData(profile, socials.slice(0, 2));

    expect(person).not.toHaveProperty("email");
  });
});

describe("toScriptJSON", () => {
  it("can't close the script tag it sits in", () => {
    const json = toScriptJSON({ name: "</script><script>alert(1)</script>" });

    expect(json).not.toContain("</script>");
    expect(JSON.parse(json)).toEqual({ name: "</script><script>alert(1)</script>" });
  });
});

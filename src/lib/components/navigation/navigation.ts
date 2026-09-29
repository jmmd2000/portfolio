/** The site's main pages, used for the nav and the sitemap. */
export const navigationLinks = [
  { label: "Home", path: "/" },
  { label: "Projects", path: "/projects" },
  { label: "CV", path: "/cv" },
] as const;

export function isCurrentPage(linkPath: string, currentPath: string): boolean {
  if (linkPath === "/") return currentPath === "/";
  return currentPath === linkPath || currentPath.startsWith(`${linkPath}/`);
}

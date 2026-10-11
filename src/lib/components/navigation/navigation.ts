/** The site's main pages, used for the nav and the sitemap. */
export const navigationLinks = [
  { label: "Home", path: "/" },
  { label: "Projects", path: "/projects" },
  { label: "Articles", path: "/articles" },
  { label: "CV", path: "/cv" },
] as const;

/** The main pages to show now. */
export function shownNavigationLinks(hasArticles: boolean) {
  return navigationLinks.filter(link => hasArticles || link.path !== "/articles");
}

export function isCurrentPage(linkPath: string, currentPath: string): boolean {
  if (linkPath === "/") return currentPath === "/";
  return currentPath === linkPath || currentPath.startsWith(`${linkPath}/`);
}

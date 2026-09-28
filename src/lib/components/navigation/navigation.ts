export function isCurrentPage(linkPath: string, currentPath: string): boolean {
  if (linkPath === "/") return currentPath === "/";
  return currentPath === linkPath || currentPath.startsWith(`${linkPath}/`);
}

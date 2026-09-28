export type Theme = "light" | "dark";

export const storageKey = "theme";

const darkThemeQuery = "(prefers-color-scheme: dark)";

export function getCurrentTheme(): Theme {
  const chosenTheme = document.documentElement.dataset.theme;
  if (chosenTheme === "light" || chosenTheme === "dark") return chosenTheme;

  return window.matchMedia(darkThemeQuery).matches ? "dark" : "light";
}

/** Shows a theme now and saves it for later visits */
export function setTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme;

  try {
    localStorage.setItem(storageKey, theme);
  } catch {
    ////
  }
}

/**
 * Calls onChange when the OS switches between light and dark
 * Returns a function that stops listening
 */
export function watchOperatingSystemTheme(onChange: () => void): () => void {
  const query = window.matchMedia(darkThemeQuery);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

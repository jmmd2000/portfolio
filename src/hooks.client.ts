import type { ClientInit, HandleClientError } from "@sveltejs/kit";
import { env } from "$env/dynamic/public";
import { reportBrowserError, startBrowserErrorReporting } from "$lib/errorReporting";
import { parseErrorReportingConfig } from "$lib/errorReportingConfig";

export const init: ClientInit = () => {
  startBrowserErrorReporting(parseErrorReportingConfig(env));
};

/**
 * Logs and reports errors the app did not expect. SvelteKit also calls this for a missing
 * page (404), which is not a fault, so only server errors (500 and above) are reported.
 * The route, such as `/articles/[slug]`, is reported instead of the address.
 */
export const handleError: HandleClientError = ({ error, event, status }) => {
  const route = event.route.id ?? "unmatched";
  console.error("Unhandled error:", error, { route });
  if (status >= 500) reportBrowserError(error, { route });
};

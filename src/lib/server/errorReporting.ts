import * as Sentry from "@sentry/node";
import type { ErrorReportingConfig } from "../errorReportingConfig";

/** Drizzle ends a failed query's message with a `params:` line that holds the values, such as an email address or private notes. */
const QUERY_PARAMETERS_MARKER = "\nparams:";

/** Postgres puts the offending value after a colon, such as `invalid input syntax for type integer: "-12.50"`. */
const DATABASE_ERROR_TYPE = "PostgresError";
const DATABASE_VALUE_MARKER = ": ";

/**
 * Cuts the values out of one exception message. Returns the exception as it is when there is nothing to cut.
 */
function removeValuesFromException(exception: Sentry.Exception): Sentry.Exception {
  const message = exception.value;
  if (!message) return exception;

  const parametersIndex = message.indexOf(QUERY_PARAMETERS_MARKER);
  if (parametersIndex !== -1) return { ...exception, value: message.slice(0, parametersIndex) };

  const valueIndex = message.indexOf(DATABASE_VALUE_MARKER);
  if (exception.type === DATABASE_ERROR_TYPE && valueIndex !== -1) return { ...exception, value: message.slice(0, valueIndex) };

  return exception;
}

/**
 * Removes the values of a failed database query from the messages of an event.
 * The query text and the kind of failure stay, so the failure can still be found.
 * @param event The event the SDK built
 * @returns The event with the values cut from every exception message
 */
export function removeQueryValues(event: Sentry.ErrorEvent): Sentry.ErrorEvent {
  const values = event.exception?.values?.map(removeValuesFromException);
  if (!values) return event;
  return { ...event, exception: { ...event.exception, values } };
}

/**
 * Builds the SDK options for the web server. Only the integrations listed here run, so the
 * SDK never collects request data such as cookies, headers or query strings by itself.
 * The default integrations would collect it, so they stay off. beforeSend drops any that arrives anyway,
 * and cuts the values out of failed database queries, because they can hold the admin's email or private notes.
 * @param config Where to send events and what to label them with
 * @returns The options to pass to `Sentry.init`
 */
export function buildServerErrorReportingOptions({ dsn, environment, release }: ErrorReportingConfig): Sentry.NodeOptions {
  return {
    dsn,
    environment,
    release,
    defaultIntegrations: false,
    integrations: [
      Sentry.linkedErrorsIntegration(),
      Sentry.onUncaughtExceptionIntegration(),
      // "strict" keeps Node's own behaviour: an unhandled rejection stops the process
      Sentry.onUnhandledRejectionIntegration({ mode: "strict" }),
    ],
    beforeSend: event => removeQueryValues({ ...event, request: undefined }),
  };
}

/**
 * Starts error reporting on the web server.
 * @param config The settings, or `undefined` to leave reporting off
 */
export function startServerErrorReporting(config: ErrorReportingConfig | undefined): void {
  if (!config) return;
  Sentry.init(buildServerErrorReportingOptions(config));
}

/**
 * Sends an error to GlitchTip. Does nothing when reporting is off.
 * @param error The error to send
 * @param tags Values to search by in GlitchTip, such as the HTTP method and route
 */
export function reportServerError(error: unknown, tags: Record<string, string> = {}): void {
  Sentry.captureException(error, { tags });
}

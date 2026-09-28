import { describe, expect, it } from "vitest";
import { assertSafeToWipe } from "./wipe";

describe("assertSafeToWipe", () => {
  it.each(["portfolio_dev", "portfolio_test", "portfolio_test_e2e"])("allows the local database %s", databaseName => {
    expect(() => assertSafeToWipe(`postgres://portfolio:portfolio@localhost:5437/${databaseName}`)).not.toThrow();
  });

  it("allows 127.0.0.1 and ::1 as local hosts", () => {
    expect(() => assertSafeToWipe("postgres://portfolio:portfolio@127.0.0.1:5437/portfolio_dev")).not.toThrow();
    expect(() => assertSafeToWipe("postgres://portfolio:portfolio@[::1]:5437/portfolio_dev")).not.toThrow();
  });

  it("refuses a database whose name isn't dev or test", () => {
    expect(() => assertSafeToWipe("postgres://portfolio:portfolio@localhost:5437/portfolio")).toThrow("must end in _dev, _test or _test_e2e");
  });

  it("refuses a name that only contains a wipeable ending", () => {
    expect(() => assertSafeToWipe("postgres://portfolio:portfolio@localhost:5437/portfolio_dev_backup")).toThrow("must end in");
  });

  it("refuses a remote host even when the name looks safe", () => {
    expect(() => assertSafeToWipe("postgres://portfolio:secret@db:5432/portfolio_test")).toThrow('host "db" is not local');
  });
});

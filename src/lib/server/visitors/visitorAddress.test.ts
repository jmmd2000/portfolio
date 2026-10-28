import { describe, expect, it } from "vitest";
import { visitorAddress } from "./visitorAddress";

describe("visitorAddress", () => {
  it("keeps an IPv4 address whole, also when it comes written as IPv6", () => {
    expect(visitorAddress("203.0.113.7")).toBe("203.0.113.7");
    expect(visitorAddress("::ffff:203.0.113.7")).toBe("203.0.113.7");
  });

  it("gives every address in one IPv6 network the same value", () => {
    const morning = visitorAddress("2001:db8:85a3:12::8a2e:370:7334");
    const evening = visitorAddress("2001:0DB8:85a3:0012:c0ff:ee00:1:2");

    expect(morning).toBe("2001:db8:85a3:12");
    expect(evening).toBe(morning);
  });

  it("fills in the zeros a shortened IPv6 address leaves out", () => {
    expect(visitorAddress("2001:db8::1")).toBe("2001:db8:0:0");
    expect(visitorAddress("::1")).toBe("0:0:0:0");
    expect(visitorAddress("fe80::1%eth0")).toBe("fe80:0:0:0");
  });

  it("tells apart IPv6 networks that differ only in the fourth group", () => {
    expect(visitorAddress("2001:db8:85a3:12::1")).not.toBe(visitorAddress("2001:db8:85a3:13::1"));
  });
});

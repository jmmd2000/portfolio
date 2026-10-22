const mappedIPv4Pattern = /^::ffff:(\d+\.\d+\.\d+\.\d+)$/i;

/**
 * The part of an IP address that stays the same for one visitor through the day. An IPv4 address is used whole,
 * also when it comes written as IPv6. An IPv6 address is cut to its first four groups (its /64 network), because
 * phones and laptops change the rest of it during the day.
 */
export function visitorAddress(address: string): string {
  const mappedIPv4 = address.match(mappedIPv4Pattern);
  if (mappedIPv4) return mappedIPv4[1];
  if (!address.includes(":")) return address;

  return ipv6Groups(address).slice(0, 4).join(":");
}

/** All eight groups of an IPv6 address, with "::" filled in with zeros and each group in its shortest form */
function ipv6Groups(address: string): string[] {
  const [withoutZone] = address.split("%");
  const [head, tail] = withoutZone.split("::");
  const headGroups = head ? head.split(":") : [];

  let groups = headGroups;
  if (tail !== undefined) {
    const tailGroups = tail ? tail.split(":") : [];
    const zeroGroups = new Array<string>(8 - headGroups.length - tailGroups.length).fill("0");
    groups = [...headGroups, ...zeroGroups, ...tailGroups];
  }

  return groups.map(group => parseInt(group, 16).toString(16));
}

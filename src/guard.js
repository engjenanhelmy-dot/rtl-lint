import dns from "node:dns/promises";
import net from "node:net";

function isPrivate(ip) {
  if (net.isIPv4(ip)) {
    const [a, b] = ip.split(".").map(Number);
    return (
      a === 0 || a === 10 || a === 127 ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 100 && b >= 64 && b <= 127)
    );
  }
  const v = ip.toLowerCase();
  if (v.startsWith("::ffff:")) return isPrivate(v.slice(7));
  return v === "::1" || v === "::" || v.startsWith("fc") ||
    v.startsWith("fd") || v.startsWith("fe80");
}

export async function assertPublicUrl(rawUrl) {
  const u = new URL(rawUrl);
  if (!["http:", "https:"].includes(u.protocol)) {
    throw new Error("Only http(s) URLs are allowed");
  }
  const host = u.hostname.replace(/^\[|\]$/g, "");
  const addrs = net.isIP(host)
    ? [{ address: host }]
    : await dns.lookup(host, { all: true });
  if (addrs.some((a) => isPrivate(a.address))) {
    throw new Error("Private or internal addresses are not allowed");
  }
}
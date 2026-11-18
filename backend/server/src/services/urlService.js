
import * as cheerio from "cheerio";
import net from "node:net";

function isPrivateIPv4(ip) {
  const parts = ip.split(".").map(Number);

  if (parts.length !== 4 || parts.some(n => n < 0 || n > 255)) {
    return true;
  }

  const [a, b] = parts;

  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    a >= 224 ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168)
  );
}

function validatePublicUrl(value) {
  let parsed;

  try {
    parsed = new URL(value);
  } catch {
    throw new Error("Please provide a valid URL.");
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error("Only HTTP and HTTPS URLs are supported.");
  }

  const hostname = parsed.hostname.toLowerCase();

  if (
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    hostname === "metadata.google.internal"
  ) {
    throw new Error("This URL is not allowed.");
  }

  const ipVersion = net.isIP(hostname);

  if (
    ipVersion === 4 && isPrivateIPv4(hostname)
  ) {
    throw new Error("Private IP addresses are not allowed.");
  }

  if (
    ipVersion === 6 &&
    (
      hostname === "::1" ||
      hostname.startsWith("fc") ||
      hostname.startsWith("fd") ||
      hostname.startsWith("fe80:")
    )
  ) {
    throw new Error("Private IP addresses are not allowed.");
  }

  return parsed;
}

export async function extractWebpage(url) {
  const parsedUrl = validatePublicUrl(url);

  let response;

  try {
    response = await fetch(parsedUrl, {
      signal: AbortSignal.timeout(10000),
      redirect: "error",
      headers: {
        "User-Agent": "AI-Knowledge-Inbox/1.0",
        Accept: "text/html",
      },
    });
  } catch (error) {
    throw new Error(`Unable to fetch webpage: ${error.message}`);
  }

  if (!response.ok) {
    throw new Error(`Website returned HTTP ${response.status}.`);
  }

  const contentType = response.headers.get("content-type") || "";

  if (!contentType.includes("text/html")) {
    throw new Error("The URL must point to an HTML webpage.");
  }

  const contentLength = Number(
    response.headers.get("content-length") || 0
  );

  if (contentLength > 2 * 1024 * 1024) {
    throw new Error("Webpage is too large to process.");
  }

  const html = await response.text();

  if (Buffer.byteLength(html, "utf8") > 2 * 1024 * 1024) {
    throw new Error("Webpage is too large to process.");
  }

  const $ = cheerio.load(html);

  $("script, style, noscript, nav, footer, header, iframe, svg").remove();

  const title = $("title").first().text().trim() ||
    parsedUrl.hostname;

  const content = $("body").text()
    .replace(/\s+/g, " ")
    .trim();

  if (!content) {
    throw new Error("No readable text was found on this webpage.");
  }

  return {
    title: title.slice(0, 200),
    content: content.slice(0, 100000),
    sourceUrl: parsedUrl.href,
  };
}

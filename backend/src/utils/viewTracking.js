export function detectViewSource(req) {
  const refererRaw = req.headers.referer || req.headers.referrer || "";
  const referer = String(refererRaw).toLowerCase();

  if (
    referer.includes("linkedin.com") ||
    referer.includes("lnkd.in") ||
    referer.includes("linkedin")
  ) {
    return "LinkedIn";
  }

  if (referer.includes("github.com") || referer.includes("github")) {
    return "GitHub";
  }

  if (
    referer.includes("twitter.com") ||
    referer.includes("x.com") ||
    referer.includes("t.co") ||
    referer.includes("twitter")
  ) {
    return "Twitter";
  }

  return "Direct";
}

export function shouldTrackView(req) {
  const userAgent = String(req.headers["user-agent"] || "").toLowerCase();
  const purpose = String(
    req.headers.purpose || req.headers["sec-purpose"] || "",
  ).toLowerCase();

  const knownPreviewOrBotSignatures = [
    "linkedinbot",
    "twitterbot",
    "slackbot",
    "discordbot",
    "facebookexternalhit",
    "whatsapp",
    "skypeuripreview",
    "telegrambot",
    "googlebot",
    "bingbot",
    "duckduckbot",
    "yandexbot",
    "crawler",
    "spider",
    "bot",
  ];

  const isBot = knownPreviewOrBotSignatures.some((signature) =>
    userAgent.includes(signature),
  );

  const isLikelyPrefetch =
    purpose.includes("prefetch") || purpose.includes("preview");

  return !isBot && !isLikelyPrefetch;
}

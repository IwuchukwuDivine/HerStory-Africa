type EventPayloads = {
  cookie_consent: { choice: "granted" | "denied" };
  newsletter_subscribe: { already_subscribed: boolean };
  favorite_toggle: {
    content_type: "article" | "woman";
    slug: string;
    action: "add" | "remove";
  };
  share: {
    content_type: "article" | "woman" | "page";
    slug?: string;
    method: "native" | "clipboard";
  };
  share_card: {
    slug: string;
    format: "square" | "story";
    theme: "light" | "dark";
    action: "download" | "share";
  };
  reflection_save: { slug: string };
  listen_play: { slug?: string };
};
type EventName = keyof EventPayloads;
const CONSENT_STORAGE_KEY = "herstory-africa-consent-v1";

type ConsentChoice = "granted" | "denied";

const grantedConsent = {
  ad_user_data: "granted",
  ad_personalization: "granted",
  ad_storage: "granted",
  analytics_storage: "granted",
} as const;
const deniedConsent = {
  ad_user_data: "denied",
  ad_personalization: "denied",
  ad_storage: "denied",
  analytics_storage: "denied",
} as const;
export const readStoredConsent = (): ConsentChoice | null => {
  if (!import.meta.client) return null;
  try {
    const v = localStorage.getItem(CONSENT_STORAGE_KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    return null;
  }
};

const writeStoredConsent = (choice: ConsentChoice) => {
  if (!import.meta.client) return;
  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, choice);
  } catch {
    // localStorage unavailable — non-fatal
  }
};
export default () => {
  const { gtag } = useGtag();
  const track = <K extends EventName>(name: K, params: EventPayloads[K]) => {
    gtag("event", name, params);
  };

  const grantConsent = () => {
    gtag("consent", "update", grantedConsent);
    writeStoredConsent("granted");
    track("cookie_consent", { choice: "granted" });
  };

  const denyConsent = () => {
    gtag("consent", "update", deniedConsent);
    writeStoredConsent("denied");
    track("cookie_consent", { choice: "denied" });
  };
  const restoreStoredConsent = () => {
    const stored = readStoredConsent();
    if (stored === "granted") gtag("consent", "update", grantedConsent);
    else if (stored === "denied") gtag("consent", "update", deniedConsent);
  };
  return {
    track,
    grantConsent,
    denyConsent,
    restoreStoredConsent,
    readStoredConsent,
  };
};

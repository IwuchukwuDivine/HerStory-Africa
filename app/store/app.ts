type SettableState = {
  hasSeenNewsletterPrompt: boolean;
  subscribedEmail: string;
  preferredVoiceName: string;
  playbackSpeed: number;
};

export const useAppStore = defineStore(
  "app",
  () => {
    const readArticles = ref<string[]>([]);
    const readWomen = ref<string[]>([]);
    const favoriteWomen = ref<string[]>([]);
    const favoriteArticles = ref<string[]>([]);
    const hasSeenNewsletterPrompt = ref(false);
    const subscribedEmail = ref("");
    const preferredVoiceName = ref("");
    const playbackSpeed = ref(1);
    const iosPromptDismissedAt = ref<number | null>(null);

    const settableRefs: { [K in keyof SettableState]: Ref<SettableState[K]> } = {
      hasSeenNewsletterPrompt,
      subscribedEmail,
      preferredVoiceName,
      playbackSpeed,
    };

    function setValue<K extends keyof SettableState>(key: K, value: SettableState[K]) {
      settableRefs[key].value = value;
    }

    function getList(
      kind: "favorite" | "read",
      type: "article" | "woman",
    ): Ref<string[]> {
      if (kind === "favorite")
        return type === "article" ? favoriteArticles : favoriteWomen;
      return type === "article" ? readArticles : readWomen;
    }

    function toggleFavorite(type: "article" | "woman", slug: string) {
      const list = getList("favorite", type);
      const idx = list.value.indexOf(slug);
      if (idx === -1) list.value.push(slug);
      else list.value.splice(idx, 1);
    }

    function markAsRead(type: "article" | "woman", slug: string) {
      const list = getList("read", type);
      if (!list.value.includes(slug)) list.value.push(slug);
    }

    function isFavorite(type: "article" | "woman", slug: string) {
      return getList("favorite", type).value.includes(slug);
    }

    function isRead(type: "article" | "woman", slug: string) {
      return getList("read", type).value.includes(slug);
    }

    function setSubscribed(email: string) {
      subscribedEmail.value = email;
      hasSeenNewsletterPrompt.value = true;
    }

    const isSubscribed = computed(() => subscribedEmail.value !== "");

    const IOS_DISMISS_DAYS = 30;

    const isIosPromptDismissed = (): boolean => {
      if (!iosPromptDismissedAt.value) return false;
      const daysSince =
        (Date.now() - iosPromptDismissedAt.value) / (1000 * 60 * 60 * 24);
      return daysSince < IOS_DISMISS_DAYS;
    };

    const dismissIosPrompt = () => {
      iosPromptDismissedAt.value = Date.now();
    };

    return {
      readWomen,
      readArticles,
      favoriteWomen,
      favoriteArticles,
      hasSeenNewsletterPrompt,
      subscribedEmail,
      isSubscribed,
      preferredVoiceName,
      playbackSpeed,
      iosPromptDismissedAt,
      isIosPromptDismissed,
      dismissIosPrompt,
      setValue,
      toggleFavorite,
      markAsRead,
      isFavorite,
      isRead,
      setSubscribed,
    };
  },
  {
    persist: {
      storage: import.meta.client ? localStorage : undefined,
    },
  },
);

import { useAppStore } from "~/store/app";

export default () => {
  const store = useAppStore();
  const {
    readArticles,
    readWomen,
    favoriteWomen,
    favoriteArticles,
    hasSeenNewsletterPrompt,
    subscribedEmail,
    isSubscribed,
    preferredVoiceName,
    playbackSpeed,
  } = storeToRefs(store);

  return {
    readArticles,
    readWomen,
    favoriteWomen,
    favoriteArticles,
    hasSeenNewsletterPrompt,
    subscribedEmail,
    isSubscribed,
    preferredVoiceName,
    playbackSpeed,
    setValue: store.setValue,
    toggleFavorite: store.toggleFavorite,
    markAsRead: store.markAsRead,
    isFavorite: store.isFavorite,
    isRead: store.isRead,
    setSubscribed: store.setSubscribed,
  };
};

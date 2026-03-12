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
  } = storeToRefs(store);

  return {
    readArticles,
    readWomen,
    favoriteWomen,
    favoriteArticles,
    hasSeenNewsletterPrompt,
    subscribedEmail,
    isSubscribed,
    toggleFavorite: store.toggleFavorite,
    markAsRead: store.markAsRead,
    isFavorite: store.isFavorite,
    isRead: store.isRead,
    dismissNewsletter: store.dismissNewsletter,
    setSubscribed: store.setSubscribed,
  };
};

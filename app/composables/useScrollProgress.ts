/** 0..1 fraction of the document scrolled, shared by the progress line and the reading bar. */
export default function useScrollProgress() {
  const progress = ref(0);

  function update() {
    const doc = document.documentElement;
    const max = doc.scrollHeight - window.innerHeight;
    progress.value = max > 0 ? Math.min(Math.max(window.scrollY / max, 0), 1) : 0;
  }

  onMounted(() => {
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
  });
  onBeforeUnmount(() => {
    window.removeEventListener("scroll", update);
    window.removeEventListener("resize", update);
  });

  return progress;
}

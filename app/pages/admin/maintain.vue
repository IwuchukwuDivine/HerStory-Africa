<template>
  <div class="mt">
    <AdminPanel
      title="Searches with no results"
      meta="What readers looked for and didn't find"
    >
      <AdminEmptyState title="Zero-result searches aren't tracked yet">
        <template #icon><LucideSearchX :size="24" /></template>
        Search runs entirely in the browser through
        <code>useArchiveSearch.ts</code>, and an empty result set is never
        reported anywhere.
        <br><br>
        To fill this panel: emit a <code>search_no_results</code> event through
        the existing <code>useTag.ts</code> wrapper, register the query as a
        custom dimension in the GA4 console, then read it back the way
        <code>/api/admin/analytics</code> reads page paths.
      </AdminEmptyState>
    </AdminPanel>

    <AdminPanel title="Broken internal links" meta="No report to read">
      <AdminEmptyState title="The link checker doesn't publish its findings">
        <template #icon><LucideUnlink :size="24" /></template>
        <code>scripts/check-internal-links.mjs</code> already validates every
        internal Markdown link, but it prints to stdout and exits non-zero. It
        leaves nothing behind for this page to read, and it can't run inside a
        serverless function because it walks the content directory on disk.
        <br><br>
        To fill this panel: have the script also write
        <code>data/link-report.json</code>, and add a workflow that runs it and
        commits the report the way the newsletter cron commits its log.
      </AdminEmptyState>
    </AdminPanel>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: "admin", middleware: "admin" });
useHead({ title: "Search & links" });

const header = useAdminHeader();

watchEffect(() => {
  header.value = {
    title: "Search & links",
    subtitle: "Gaps readers found, and links that no longer work",
    searchable: false,
    searchPlaceholder: "",
  };
});
</script>

<style scoped>
.mt {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>

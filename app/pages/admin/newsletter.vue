<template>
  <div class="nl">
    <AdminEmptyState v-if="failed" title="Couldn't load the newsletter" tone="error">
      <template #icon><LucideAlertCircle :size="24" /></template>
      Try again in a moment.
    </AdminEmptyState>

    <p v-else-if="loading" class="nl__loading">Loading newsletter…</p>

    <template v-else-if="data">
      <div class="nl__tiles">
        <AdminKpi v-for="k in data.tiles" :key="k.label" :kpi="k" />
      </div>

      <p v-if="data.resendError" class="nl__alert">
        <LucideAlertCircle :size="14" aria-hidden="true" />
        Resend didn't answer ({{ data.resendError }}), so statuses below are
        unknown and every action is paused.
      </p>

      <AdminPanel title="Editions" :meta="editionsMeta">
        <AdminEmptyState v-if="!data.editions.length" title="No editions built yet">
          <template #icon><LucideMail :size="24" /></template>
          Run <code>npm run newsletter:build -- &lt;slug&gt;</code>, commit
          <code>server/assets/newsletter/</code> and deploy.
        </AdminEmptyState>

        <ul v-else class="nl__list">
          <li v-for="e in data.editions" :key="e.slug" class="nl__item">
            <div class="nl__row">
              <div class="nl__info">
                <p class="nl__eyebrow">
                  No. {{ e.number }} · {{ layoutName(e.layout) }} · {{ e.register }}
                </p>
                <h3 class="nl__subject">{{ e.subject }}</h3>
                <p class="nl__preview">{{ e.preview }}</p>
                <p class="nl__when">
                  <AdminTag :tone="statusTone(e.status)">{{ statusLabel(e.status) }}</AdminTag>
                  <span>{{ whenLine(e) }}</span>
                  <AdminTag v-if="e.outOfDate" tone="warn">Resend copy is older than the build</AdminTag>
                </p>
              </div>

              <div class="nl__actions">
                <button
                  type="button"
                  class="nl__btn nl__btn--secondary"
                  :aria-expanded="open === e.slug"
                  @click="togglePreview(e.slug)"
                >
                  <LucideEye :size="14" aria-hidden="true" />
                  {{ open === e.slug ? "Hide preview" : "Preview" }}
                </button>
                <button
                  type="button"
                  class="nl__btn nl__btn--secondary"
                  :disabled="!data.testAddress || busy !== null"
                  :title="data.testAddress ? `Sends one copy to ${data.testAddress}` : 'Set NUXT_NEWSLETTER_TEST_ADDRESS first'"
                  @click="sendTest(e)"
                >
                  <LucideSend :size="14" aria-hidden="true" />
                  Send test to me
                </button>
                <button
                  v-if="editable(e)"
                  type="button"
                  class="nl__btn nl__btn--secondary"
                  :disabled="paused || busy !== null"
                  @click="saveDraft(e)"
                >
                  <LucideFileText :size="14" aria-hidden="true" />
                  {{ e.status === "draft" ? "Update draft in Resend" : "Save draft to Resend" }}
                </button>
                <button
                  v-if="editable(e)"
                  type="button"
                  class="nl__btn nl__btn--primary"
                  :disabled="paused || busy !== null || isPast(e)"
                  :title="isPast(e) ? 'The send time has passed. Set a later sendAt and rebuild.' : ''"
                  @click="approve(e)"
                >
                  <LucideCalendarCheck :size="14" aria-hidden="true" />
                  Approve and schedule
                </button>
                <button
                  v-if="e.status === 'scheduled'"
                  type="button"
                  class="nl__btn nl__btn--danger"
                  :disabled="paused || busy !== null"
                  @click="cancel(e)"
                >
                  <LucideCalendarX :size="14" aria-hidden="true" />
                  Cancel schedule
                </button>
                <a
                  v-if="e.broadcastId"
                  class="nl__btn nl__btn--link"
                  :href="`https://resend.com/broadcasts/${e.broadcastId}`"
                  target="_blank"
                  rel="noopener"
                >
                  Open in Resend
                  <LucideExternalLink :size="13" aria-hidden="true" />
                </a>
              </div>
            </div>

            <p
              v-if="notices[e.slug]"
              class="nl__notice"
              :class="{ 'nl__notice--error': notices[e.slug]!.error }"
              role="status"
            >
              {{ notices[e.slug]!.text }}
            </p>

            <div v-if="open === e.slug" class="nl__frame-wrap">
              <p v-if="!previews[e.slug]" class="nl__loading">Loading preview…</p>
              <!-- Scripts stay blocked. allow-same-origin is needed for the
                   edition's images: from an opaque origin they do not load. -->
              <iframe
                v-else
                class="nl__frame"
                :title="`Preview of ${e.subject}`"
                sandbox="allow-same-origin"
                :srcdoc="previews[e.slug]"
              />
            </div>
          </li>
        </ul>
      </AdminPanel>

      <p class="nl__note">
        <LucideInfo :size="14" aria-hidden="true" />
        Nothing reaches subscribers until you press "Approve and schedule". It
        sends to the General segment at the edition's send time, and can be
        cancelled until then. Images load from the live site, so deploy an
        edition's images before sending a test.
      </p>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { AdminEdition, AdminEditionStatus, AdminNewsletter } from "~/utils/types/admin";

definePageMeta({ layout: "admin", middleware: "admin" });
useHead({ title: "Newsletter" });

const { data, loading, failed, load, refresh } = useAdminData<AdminNewsletter>(
  "newsletter",
  "/api/admin/newsletter",
);
onMounted(() => load());

const header = useAdminHeader();

// Nitro's typed-route inference blows the type checker's stack on template
// URLs (see useAdminData), so requests go through a plain signature.
const request = $fetch as unknown as <T>(
  url: string,
  options?: { method?: "POST"; body?: Record<string, unknown>; responseType?: "text" },
) => Promise<T>;

const busy = ref<string | null>(null);
const open = ref<string | null>(null);
const previews = reactive<Record<string, string>>({});
const notices = reactive<Record<string, { text: string; error: boolean } | undefined>>({});

const paused = computed(() => !!data.value?.resendError);

const STATUS: Record<AdminEditionStatus, { label: string; tone: "ok" | "warn" | "bad" | "info" | "muted" }> = {
  local: { label: "Not in Resend", tone: "muted" },
  draft: { label: "Draft", tone: "info" },
  scheduled: { label: "Scheduled", tone: "warn" },
  queued: { label: "Sending", tone: "warn" },
  sent: { label: "Sent", tone: "ok" },
  canceled: { label: "Cancelled", tone: "bad" },
};
const statusLabel = (s: AdminEditionStatus) => STATUS[s].label;
const statusTone = (s: AdminEditionStatus) => STATUS[s].tone;

const WHEN = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Africa/Lagos",
});
/** Resend returns "2026-12-01 07:00:00+00"; Date wants a T. */
const fmt = (value: string) => `${WHEN.format(new Date(value.replace(" ", "T")))} WAT`;

function whenLine(e: AdminEdition) {
  if (e.status === "sent" && e.sentAt) return `Sent ${fmt(e.sentAt)}`;
  if (e.status === "scheduled" && e.scheduledAt) return `Goes out ${fmt(e.scheduledAt)}`;
  return `Send time ${fmt(e.sendAt)}`;
}

const editable = (e: AdminEdition) => ["local", "draft", "canceled"].includes(e.status);
const isPast = (e: AdminEdition) => Date.parse(e.sendAt) - Date.now() < 10 * 60 * 1000;

const editionsMeta = computed(() => {
  const n = data.value?.editions.length ?? 0;
  return `${n} built edition${n === 1 ? "" : "s"}`;
});

function message(error: unknown, fallback: string) {
  const e = error as { data?: { statusMessage?: string; message?: string }; statusMessage?: string };
  return e?.data?.statusMessage || e?.data?.message || e?.statusMessage || fallback;
}

async function run(e: AdminEdition, action: () => Promise<string>, fallback: string) {
  busy.value = e.slug;
  notices[e.slug] = undefined;
  try {
    notices[e.slug] = { text: await action(), error: false };
    await refresh();
  } catch (error) {
    notices[e.slug] = { text: message(error, fallback), error: true };
  } finally {
    busy.value = null;
  }
}

async function togglePreview(slug: string) {
  if (open.value === slug) {
    open.value = null;
    return;
  }
  open.value = slug;
  if (previews[slug]) return;
  try {
    previews[slug] = await request<string>(`/api/admin/newsletter/${slug}/preview`, {
      responseType: "text",
    });
  } catch (error) {
    open.value = null;
    notices[slug] = { text: message(error, "Couldn't load the preview."), error: true };
  }
}

const sendTest = (e: AdminEdition) =>
  run(
    e,
    async () => {
      const res = await request<{ to: string }>(`/api/admin/newsletter/${e.slug}/test`, {
        method: "POST",
      });
      return `Test sent to ${res.to}.`;
    },
    "The test didn't send.",
  );

const saveDraft = (e: AdminEdition) =>
  run(
    e,
    async () => {
      await request(`/api/admin/newsletter/${e.slug}/draft`, { method: "POST" });
      return "Draft saved in Resend. Nothing was sent.";
    },
    "Couldn't save the draft.",
  );

function approve(e: AdminEdition) {
  const subs = data.value?.subscribers;
  const who = subs ? `${subs.subscribed.toLocaleString("en")} subscribers` : "every subscriber";
  const ok = confirm(
    `Schedule No. ${e.number}, "${e.subject}"?\n\n` +
      `It goes to ${who} in the General segment on ${fmt(e.sendAt)}.\n` +
      "You can cancel it here until then.",
  );
  if (!ok) return;
  return run(
    e,
    async () => {
      await request(`/api/admin/newsletter/${e.slug}/schedule`, {
        method: "POST",
        body: { confirm: e.slug },
      });
      return `Scheduled for ${fmt(e.sendAt)}.`;
    },
    "It was not scheduled.",
  );
}

function cancel(e: AdminEdition) {
  if (!confirm(`Take "${e.subject}" off the schedule? It goes back to a draft.`)) return;
  return run(
    e,
    async () => {
      await request(`/api/admin/newsletter/${e.slug}/cancel`, { method: "POST" });
      return "Schedule cancelled. It is a draft again.";
    },
    "Couldn't cancel the schedule.",
  );
}

watchEffect(() => {
  const subs = data.value?.subscribers;
  header.value = {
    title: "Newsletter",
    subtitle: subs
      ? `${subs.subscribed.toLocaleString("en")} subscribed · ${subs.unsubscribed} unsubscribed`
      : "Subscriber counts are unavailable",
    searchable: false,
    searchPlaceholder: "",
  };
});
</script>

<style scoped>
.nl {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.nl__loading {
  font-size: 0.8125rem;
  color: var(--text-muted);
  padding: 2rem 0;
  text-align: center;
  margin: 0;
}

.nl__tiles {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(10.5rem, 1fr));
  gap: 0.75rem;
}

.nl__alert {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  font-size: 0.8125rem;
  color: var(--color-crimson-600);
  background: color-mix(in srgb, var(--color-crimson) 10%, var(--surface));
}

.dark .nl__alert {
  color: var(--color-crimson-300);
}

.nl__list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.nl__item + .nl__item {
  border-top: 1px solid var(--border-light);
}

.nl__row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  flex-wrap: wrap;
  padding: 1rem;
}

.nl__info {
  min-width: 0;
  flex: 1 1 20rem;
}

.nl__eyebrow {
  margin: 0 0 0.25rem;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.nl__subject {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
}

.nl__preview {
  margin: 0.25rem 0 0.625rem;
  font-size: 0.8125rem;
  line-height: 1.5;
  color: var(--text-secondary);
}

.nl__when {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 0;
  font-size: 0.75rem;
  color: var(--text-muted);
}

.nl__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  flex: 0 1 auto;
}

.nl__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  min-height: 44px;
  padding: 0 0.875rem;
  border-radius: 9999px;
  border: 1.5px solid var(--border-default);
  background: transparent;
  font-family: inherit;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--text-secondary);
  text-decoration: none;
  white-space: nowrap;
  cursor: pointer;
  transition:
    background 0.15s ease,
    border-color 0.15s ease,
    color 0.15s ease;
}

.nl__btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.nl__btn--secondary:hover:not(:disabled),
.nl__btn--link:hover {
  border-color: var(--ring-default);
  color: var(--color-primary);
}

.nl__btn--primary {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--text-on-primary);
}

.nl__btn--primary:hover:not(:disabled) {
  background: var(--color-primary-600);
}

.nl__btn--danger:hover:not(:disabled) {
  border-color: var(--color-crimson);
  color: var(--color-crimson);
}

.nl__btn--link {
  border-color: transparent;
  color: var(--color-primary);
}

.nl__notice {
  margin: 0 1rem 1rem;
  font-size: 0.8125rem;
  color: var(--color-forest);
}

.nl__notice--error {
  color: var(--color-crimson-600);
}

.dark .nl__notice--error {
  color: var(--color-crimson-300);
}

/* The email is paper-coloured by design, so the frame stays light in dark mode. */
.nl__frame-wrap {
  padding: 0 1rem 1rem;
}

.nl__frame {
  display: block;
  width: 100%;
  max-width: 40rem;
  height: 52rem;
  margin: 0 auto;
  border: 1px solid var(--border-light);
  border-radius: 0.5rem;
  background: #fff;
}

.nl__note {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  margin: 0;
  font-size: 0.75rem;
  line-height: 1.5;
  color: var(--text-muted);
}

.nl__note svg {
  flex-shrink: 0;
  margin-top: 0.125rem;
}

code {
  font-size: 0.75rem;
  padding: 0.0625rem 0.25rem;
  border-radius: 0.25rem;
  background: var(--surface-muted);
}
</style>

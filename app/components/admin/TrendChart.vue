<template>
  <div
    ref="wrap"
    class="trend"
    @pointermove="onMove"
    @pointerleave="active = null"
  >
    <svg
      class="trend__svg"
      :viewBox="`0 0 ${W} ${H}`"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path class="trend__area" :d="areaPath" />
      <path class="trend__line" :d="linePath" />
    </svg>

    <template v-if="activePoint">
      <span class="trend__cursor" :style="{ left: `${activePoint.xPct}%` }" />
      <span
        class="trend__dot"
        :style="{ left: `${activePoint.xPct}%`, top: `${activePoint.yPct}%` }"
      />
      <span
        class="trend__tip"
        :style="{ left: `${activePoint.xPct}%` }"
        :data-edge="activePoint.edge"
      >
        <strong>{{ activePoint.views }}</strong> views ·
        {{ activePoint.users }} users
        <span class="trend__tip-date">{{ activePoint.dateLabel }}</span>
      </span>
    </template>
  </div>
</template>

<script setup lang="ts">
interface Point {
  date: string;
  views: number;
  users: number;
}

const props = defineProps<{ points: Point[] }>();

const W = 100;
const H = 40;
const PAD = 2;

const wrap = ref<HTMLElement>();
const active = ref<{ i: number } | null>(null);

const max = computed(() =>
  Math.max(1, ...props.points.map((p) => p.views)),
);

function coords(i: number, v: number) {
  const n = props.points.length;
  const x = n <= 1 ? 0 : (i / (n - 1)) * W;
  const y = H - PAD - (v / max.value) * (H - PAD * 2);
  return { x, y };
}

const linePath = computed(() => {
  if (!props.points.length) return "";
  return props.points
    .map((p, i) => {
      const { x, y } = coords(i, p.views);
      return `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
});

const areaPath = computed(() => {
  if (!props.points.length) return "";
  const last = props.points.length - 1;
  const x0 = coords(0, props.points[0]!.views).x;
  const xn = coords(last, props.points[last]!.views).x;
  return `${linePath.value} L ${xn.toFixed(2)} ${H} L ${x0.toFixed(2)} ${H} Z`;
});

const activePoint = computed(() => {
  if (!active.value) return null;
  const i = active.value.i;
  const p = props.points[i];
  if (!p) return null;
  const n = props.points.length;
  const xPct = n <= 1 ? 0 : (i / (n - 1)) * 100;
  const yPct = ((H - PAD - (p.views / max.value) * (H - PAD * 2)) / H) * 100;
  return {
    xPct,
    yPct,
    views: p.views,
    users: p.users,
    dateLabel: formatDate(p.date),
    edge: xPct < 12 ? "start" : xPct > 88 ? "end" : "mid",
  };
});

function onMove(e: PointerEvent) {
  const el = wrap.value;
  const n = props.points.length;
  if (!el || n < 2) return;
  const rect = el.getBoundingClientRect();
  const ratio = (e.clientX - rect.left) / rect.width;
  const i = Math.max(0, Math.min(n - 1, Math.round(ratio * (n - 1))));
  active.value = { i };
}

function formatDate(ga: string) {
  // GA date is "YYYYMMDD"
  if (ga.length !== 8) return ga;
  const d = new Date(
    Number(ga.slice(0, 4)),
    Number(ga.slice(4, 6)) - 1,
    Number(ga.slice(6, 8)),
  );
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(d);
}
</script>

<style scoped>
.trend {
  position: relative;
  width: 100%;
  height: 9.5rem;
}

.trend__svg {
  width: 100%;
  height: 100%;
  display: block;
  overflow: visible;
}

.trend__area {
  fill: var(--color-primary);
  opacity: 0.12;
}

.trend__line {
  fill: none;
  stroke: var(--color-primary);
  stroke-width: 2;
  stroke-linejoin: round;
  stroke-linecap: round;
  vector-effect: non-scaling-stroke;
}

.trend__cursor {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 1px;
  background: var(--border-default);
  transform: translateX(-0.5px);
  pointer-events: none;
}

.trend__dot {
  position: absolute;
  width: 9px;
  height: 9px;
  border-radius: 9999px;
  background: var(--color-primary);
  box-shadow: 0 0 0 2px var(--surface-elevated);
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.trend__tip {
  position: absolute;
  bottom: calc(100% + 0.4rem);
  transform: translateX(-50%);
  white-space: nowrap;
  padding: 0.375rem 0.625rem;
  font-size: 0.75rem;
  color: var(--text-primary);
  background: var(--surface-elevated);
  border: 1px solid var(--border-default);
  border-radius: 0.5rem;
  box-shadow: var(--shadow-card);
  pointer-events: none;
  z-index: 2;
}

.trend__tip[data-edge="start"] {
  transform: translateX(0);
}

.trend__tip[data-edge="end"] {
  transform: translateX(-100%);
}

.trend__tip-date {
  display: block;
  color: var(--text-muted);
  font-weight: 500;
}
</style>

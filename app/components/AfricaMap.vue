<template>
  <div class="africa-map" ref="mapContainer">
    <div class="africa-map__svg-wrap" ref="svgWrap">
      <svg
        ref="svgEl"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 800 900"
        class="africa-map__svg"
        @mouseleave="activeCountry = null"
        @click.self="onMapBackgroundTap"
      >
        <path
          v-for="country in countryPaths"
          :id="country.id"
          :key="country.id"
          :d="country.d"
          class="africa-map__country"
          :class="{
            'africa-map__country--active': activeCountry?.id === country.id,
            'africa-map__country--has-women':
              (countryCounts[country.name] ?? 0) > 0,
          }"
          :style="{ fill: getCountryColor(country.name) }"
          @mouseenter="onCountryHover(country, $event)"
          @mousemove="onCountryMove($event)"
          @mouseleave="activeCountry = null"
          @click="onCountryClick(country, $event)"
        />
        <circle
          v-for="island in islandCircles"
          :id="island.id"
          :key="island.id"
          :cx="island.cx"
          :cy="island.cy"
          :r="island.r"
          class="africa-map__country"
          :class="{
            'africa-map__country--active': activeCountry?.id === island.id,
            'africa-map__country--has-women':
              (countryCounts[island.name] ?? 0) > 0,
          }"
          :style="{ fill: getCountryColor(island.name) }"
          @mouseenter="onCountryHover(island, $event)"
          @mousemove="onCountryMove($event)"
          @mouseleave="activeCountry = null"
          @click="onCountryClick(island, $event)"
        />
      </svg>

      <Transition name="tooltip">
        <div
          v-if="activeCountry && tooltipPos"
          class="africa-map__tooltip"
          :style="{ left: tooltipPos.x + 'px', top: tooltipPos.y + 'px' }"
        >
          <span class="africa-map__tooltip-name">{{ activeCountry.name }}</span>
          <span class="africa-map__tooltip-count">
            {{ countryCounts[activeCountry.name] ?? 0 }}
            {{
              (countryCounts[activeCountry.name] ?? 0) === 1 ? "woman" : "women"
            }}
          </span>
          <span
            v-if="isTouchDevice && (countryCounts[activeCountry.name] ?? 0) > 0"
            class="africa-map__tooltip-hint"
          >
            Tap again to explore
          </span>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { AFRICAN_COUNTRIES } from "~/utils/constants/countries";
import type { CountryData } from "~/utils/constants/countries";

const props = defineProps<{
  countryCounts: Record<string, number>;
}>();

const svgWrap = ref<HTMLDivElement>();

const activeCountry = ref<CountryData | null>(null);
const tooltipPos = ref<{ x: number; y: number } | null>(null);

const isTouchDevice = ref(false);
onMounted(() => {
  isTouchDevice.value = "ontouchstart" in window || navigator.maxTouchPoints > 0;
});

// Parse SVG paths and circles from the static SVG data
// We inline the SVG data to have full reactive control over each path
const countryPaths = computed(() => {
  return AFRICAN_COUNTRIES.filter(
    (c) => !["CV", "KM", "SC", "MU"].includes(c.id),
  )
    .map((c) => ({
      ...c,
      d: getPathData(c.id),
    }))
    .filter((c) => c.d);
});

const islandCircles = computed(() => {
  const islands: Record<string, { cx: number; cy: number; r: number }> = {
    CV: { cx: 115, cy: 290, r: 6 },
    KM: { cx: 575, cy: 530, r: 5 },
    SC: { cx: 620, cy: 460, r: 4 },
    MU: { cx: 625, cy: 570, r: 4 },
  };
  return AFRICAN_COUNTRIES.filter((c) => c.id in islands).map((c) => ({
    ...c,
    ...islands[c.id],
  }));
});

// Static SVG path data keyed by country ID
function getPathData(id: string): string {
  const paths: Record<string, string> = {
    MA: "M225,95 L270,80 L310,85 L320,105 L300,130 L260,140 L230,135 L220,115 Z",
    DZ: "M270,80 L310,85 L350,75 L400,90 L420,130 L410,180 L380,220 L340,230 L300,210 L280,180 L260,140 L300,130 L320,105 L310,85 Z",
    TN: "M350,75 L370,70 L380,85 L375,105 L360,100 L350,85 Z",
    LY: "M375,105 L380,85 L400,90 L420,130 L460,100 L510,110 L530,150 L520,200 L490,240 L450,250 L410,230 L410,180 L420,130 Z",
    EG: "M510,110 L530,100 L560,105 L575,130 L570,170 L555,200 L530,220 L510,210 L520,200 L530,150 Z",
    EH: "M190,130 L225,95 L220,115 L230,135 L260,140 L240,165 L210,175 L190,160 Z",
    MR: "M190,160 L210,175 L240,165 L260,180 L250,220 L240,250 L210,260 L180,250 L170,220 L175,190 Z",
    ML: "M240,165 L260,140 L280,180 L300,210 L290,240 L270,260 L250,270 L240,250 L250,220 L260,180 Z",
    NE: "M300,210 L340,230 L380,220 L400,240 L390,270 L370,290 L340,290 L320,280 L290,270 L290,240 Z",
    TD: "M400,240 L410,230 L450,250 L460,280 L450,320 L430,340 L410,330 L400,310 L390,290 L390,270 Z",
    SD: "M490,240 L510,210 L530,220 L550,250 L540,300 L520,340 L500,350 L480,330 L470,310 L460,280 L450,250 Z",
    SS: "M460,330 L470,310 L480,330 L500,350 L490,370 L470,380 L450,370 L440,350 Z",
    ER: "M540,230 L555,200 L570,220 L565,240 L550,250 Z",
    DJ: "M570,260 L580,250 L585,265 L575,275 Z",
    ET: "M500,270 L520,260 L540,270 L565,260 L570,280 L560,310 L535,330 L510,340 L500,350 L490,330 L480,310 L490,290 Z",
    SO: "M565,260 L580,250 L585,265 L595,280 L600,310 L590,360 L570,400 L550,370 L535,330 L560,310 L570,280 Z",
    SN: "M160,280 L190,275 L200,280 L195,295 L180,300 L160,295 Z",
    GM: "M163,290 L190,288 L190,296 L163,296 Z",
    GW: "M155,300 L175,300 L180,315 L165,318 Z",
    GN: "M175,300 L195,295 L210,305 L220,320 L210,335 L195,330 L185,320 L180,315 Z",
    SL: "M175,325 L195,330 L195,345 L180,350 L170,340 Z",
    LR: "M195,345 L210,340 L225,355 L215,370 L195,365 L185,355 Z",
    CI: "M225,320 L250,310 L260,330 L255,360 L235,375 L215,370 L225,355 L210,340 L210,335 L220,320 Z",
    BF: "M250,270 L290,270 L290,290 L270,300 L250,310 L240,295 L245,280 Z",
    GH: "M260,330 L270,310 L280,310 L285,340 L275,370 L260,375 L255,360 Z",
    TG: "M285,340 L290,320 L295,340 L290,370 L280,375 L275,370 Z",
    BJ: "M295,340 L300,310 L310,310 L310,345 L300,375 L290,370 Z",
    NG: "M310,310 L320,280 L340,290 L370,290 L385,310 L380,340 L365,365 L340,380 L320,385 L310,370 L310,345 Z",
    CM: "M370,310 L385,310 L390,330 L395,360 L380,390 L365,400 L350,395 L345,380 L355,370 L365,365 L380,340 Z",
    GQ: "M345,405 L360,402 L362,415 L347,418 Z",
    GA: "M350,395 L365,400 L375,420 L370,445 L355,450 L340,435 L338,415 Z",
    CG: "M375,420 L395,410 L410,430 L405,460 L390,475 L370,465 L370,445 Z",
    ST: "M325,430 L332,428 L334,436 L327,438 Z",
    CD: "M395,360 L410,330 L430,340 L450,370 L470,380 L490,370 L500,390 L505,420 L500,460 L485,490 L460,500 L440,490 L420,480 L405,460 L410,430 L395,410 L375,420 L370,400 L380,390 Z",
    CF: "M400,310 L410,330 L430,340 L440,350 L450,340 L460,330 L470,340 L460,360 L450,370 L430,350 L410,340 L395,360 L385,340 L390,330 Z",
    MG: "M575,500 L590,490 L600,510 L605,550 L598,590 L580,610 L565,590 L560,555 L565,520 Z",
    UG: "M470,380 L490,370 L500,385 L495,405 L480,415 L465,405 L460,390 Z",
    KE: "M500,350 L520,345 L535,360 L540,390 L530,420 L510,430 L495,415 L495,405 L500,385 L500,370 Z",
    RW: "M465,410 L480,415 L478,428 L463,425 Z",
    BI: "M463,425 L478,428 L476,442 L461,440 Z",
    TZ: "M495,415 L510,430 L530,420 L545,440 L540,480 L525,510 L505,510 L490,495 L485,470 L480,445 L476,442 L478,428 L480,415 Z",
    AO: "M340,465 L370,465 L390,475 L405,460 L420,480 L425,510 L420,545 L400,570 L370,575 L345,555 L335,520 L330,490 Z",
    ZM: "M420,480 L440,490 L460,500 L470,520 L460,550 L440,560 L420,555 L400,570 L420,545 L425,510 Z",
    MW: "M485,490 L500,485 L508,510 L505,545 L490,550 L480,530 L478,505 Z",
    MZ: "M490,550 L505,545 L520,530 L535,520 L540,550 L535,590 L520,620 L500,640 L485,630 L475,610 L470,585 L475,560 Z",
    NA: "M345,555 L370,575 L380,610 L385,650 L370,670 L345,665 L325,640 L320,610 L330,580 Z",
    BW: "M380,610 L400,600 L420,610 L430,640 L420,665 L395,670 L370,670 L385,650 Z",
    ZW: "M420,555 L440,560 L460,565 L470,585 L460,610 L440,620 L420,610 L400,600 L405,580 Z",
    ZA: "M345,665 L370,670 L395,670 L420,665 L440,670 L460,680 L470,710 L460,740 L435,760 L405,770 L375,760 L350,740 L340,710 L338,690 Z",
    LS: "M415,720 L430,715 L435,730 L420,735 Z",
    SZ: "M455,680 L465,675 L468,690 L458,693 Z",
  };
  return paths[id] ?? "";
}

// Color gradient based on profile count
function getCountryColor(name: string): string {
  const count = props.countryCounts[name] ?? 0;
  if (count === 0) return "var(--map-empty)";
  if (count <= 2) return "var(--map-low)";
  if (count <= 5) return "var(--map-mid)";
  if (count <= 10) return "var(--map-high)";
  return "var(--map-max)";
}

function onCountryHover(country: CountryData, event: MouseEvent) {
  if (isTouchDevice.value) return;
  activeCountry.value = country;
  updateTooltipPos(event);
}

function onCountryMove(event: MouseEvent) {
  if (isTouchDevice.value) return;
  updateTooltipPos(event);
}

function updateTooltipPos(event: MouseEvent) {
  if (!svgWrap.value) return;
  const rect = svgWrap.value.getBoundingClientRect();
  tooltipPos.value = {
    x: event.clientX - rect.left + 12,
    y: event.clientY - rect.top - 8,
  };
}

function onCountryClick(country: CountryData, event: MouseEvent) {
  const count = props.countryCounts[country.name] ?? 0;

  if (isTouchDevice.value && activeCountry.value?.id !== country.id) {
    activeCountry.value = country;
    updateTooltipPos(event);
    return;
  }

  if (count > 0) {
    navigateTo(`/women?q=${encodeURIComponent(country.name)}`);
  }
}

function onMapBackgroundTap() {
  if (isTouchDevice.value) {
    activeCountry.value = null;
    tooltipPos.value = null;
  }
}

</script>

<style scoped>
.africa-map {
  --map-empty: var(--surface-muted);
  --map-low: color-mix(in srgb, var(--color-primary) 25%, var(--surface-muted));
  --map-mid: color-mix(in srgb, var(--color-primary) 45%, var(--surface-muted));
  --map-high: color-mix(
    in srgb,
    var(--color-primary) 70%,
    var(--surface-muted)
  );
  --map-max: var(--color-primary);
}

.africa-map__svg-wrap {
  position: relative;
  max-width: 600px;
  margin: 0 auto;
}

.africa-map__svg {
  width: 100%;
  height: auto;
  display: block;
}

.africa-map__country {
  stroke: var(--surface-elevated);
  stroke-width: 1.5;
  cursor: pointer;
  transition:
    fill 0.2s ease,
    opacity 0.2s ease,
    stroke-width 0.15s ease;
}

.africa-map__country:hover,
.africa-map__country--active {
  stroke: var(--color-primary);
  stroke-width: 2.5;
  filter: brightness(1.1);
}

.africa-map__country--has-women {
  cursor: pointer;
}

.africa-map__country:not(.africa-map__country--has-women) {
  cursor: default;
  opacity: 0.6;
}

/* Tooltip */
.africa-map__tooltip {
  position: absolute;
  pointer-events: none;
  z-index: 10;
  background: var(--surface-elevated);
  border: 1px solid var(--border-default);
  border-radius: 0.5rem;
  padding: 0.5rem 0.75rem;
  box-shadow: var(--shadow-elevated);
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  white-space: nowrap;
}

.africa-map__tooltip-name {
  font-weight: 700;
  font-size: 0.875rem;
  color: var(--text-primary);
}

.africa-map__tooltip-count {
  font-size: 0.8125rem;
  color: var(--text-secondary);
}

.africa-map__tooltip-hint {
  font-size: 0.6875rem;
  color: var(--color-primary);
  font-weight: 600;
  margin-top: 0.125rem;
}

.tooltip-enter-active,
.tooltip-leave-active {
  transition: opacity 0.15s ease;
}

.tooltip-enter-from,
.tooltip-leave-to {
  opacity: 0;
}

</style>

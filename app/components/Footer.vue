<template>
  <footer class="site-footer">
    <div class="site-footer__inner">
      <div class="site-footer__brand">
        <NuxtLink to="/" class="site-footer__logo-link">
          <Logo size="2rem" />
        </NuxtLink>
        <p class="site-footer__tagline">
          The women history forgot to teach you.
        </p>
      </div>

      <div class="site-footer__nav">
        <div class="site-footer__col">
          <h4 class="site-footer__col-title">Explore</h4>
          <NuxtLink to="/women" class="site-footer__link">All Women</NuxtLink>
          <NuxtLink to="/timeline" class="site-footer__link">Timeline</NuxtLink>
          <NuxtLink to="/articles" class="site-footer__link">Articles</NuxtLink>
          <NuxtLink to="/about" class="site-footer__link">About</NuxtLink>
        </div>

        <div class="site-footer__col">
          <h4 class="site-footer__col-title">Browse</h4>
          <NuxtLink
            :to="{ path: '/women', query: { region: 'West Africa' } }"
            class="site-footer__link"
          >
            West Africa
          </NuxtLink>
          <NuxtLink
            :to="{ path: '/women', query: { region: 'East Africa' } }"
            class="site-footer__link"
          >
            East Africa
          </NuxtLink>
          <NuxtLink
            :to="{ path: '/women', query: { region: 'Southern Africa' } }"
            class="site-footer__link"
          >
            Southern Africa
          </NuxtLink>
          <NuxtLink
            :to="{ path: '/women', query: { region: 'Central Africa' } }"
            class="site-footer__link"
          >
            Central Africa
          </NuxtLink>
          <NuxtLink
            :to="{ path: '/women', query: { region: 'North Africa' } }"
            class="site-footer__link"
          >
            North Africa
          </NuxtLink>
        </div>
      </div>

      <div class="site-footer__bottom">
        <p class="site-footer__copy">
          &copy; {{ currentYear }} HerStory Africa. An educational project.
        </p>
        <p class="site-footer__credit">
          Built with care for the women who came before us.
        </p>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const currentYear = new Date().getFullYear()
</script>

<style scoped>
.site-footer {
  border-top: 1px solid var(--border-light);
  background: var(--surface-muted);
  margin-top: 2rem;
}

.site-footer__inner {
  max-width: 64rem;
  margin: 0 auto;
  padding: 3rem 1.5rem 2rem;
}

@media (min-width: 768px) {
  .site-footer__inner {
    padding: 3.5rem 2rem 2rem;
  }
}

.site-footer__brand {
  margin-bottom: 2rem;
}

.site-footer__logo-link {
  display: inline-flex;
  text-decoration: none;
}

.site-footer__tagline {
  font-size: 0.9375rem;
  font-style: italic;
  color: var(--text-muted);
  margin: 0.75rem 0 0;
}

.site-footer__nav {
  display: flex;
  flex-wrap: wrap;
  gap: 2.5rem;
  margin-bottom: 2.5rem;
}

.site-footer__col {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 8rem;
}

.site-footer__col-title {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin: 0 0 0.25rem;
}

.site-footer__link {
  font-size: 0.9375rem;
  color: var(--text-secondary);
  text-decoration: none;
  transition: color 0.15s ease;
}

.site-footer__link:hover {
  color: var(--color-primary);
}

.site-footer__bottom {
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-light);
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 0.5rem;
}

.site-footer__copy,
.site-footer__credit {
  font-size: 0.8125rem;
  color: var(--text-muted);
  margin: 0;
}
</style>

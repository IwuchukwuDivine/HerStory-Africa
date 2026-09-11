<template>
  <footer class="site-footer">
    <div class="site-footer__inner">
      <div class="site-footer__brand">
        <NuxtLink to="/" class="site-footer__logo-link" aria-label="HerStory Africa home">
          <Logo size="2rem" />
        </NuxtLink>
        <p class="site-footer__tagline">
          The women history forgot to teach you.
        </p>
      </div>

      <div class="site-footer__nav">
        <div class="site-footer__col">
          <h4 class="site-footer__col-title">Explore</h4>
          <NuxtLink to="/women" class="site-footer__link">All women</NuxtLink>
          <NuxtLink to="/timeline" class="site-footer__link">Timeline</NuxtLink>
          <NuxtLink to="/articles" class="site-footer__link">Articles</NuxtLink>
          <NuxtLink to="/opportunities" class="site-footer__link">Opportunities</NuxtLink>
          <NuxtLink to="/about" class="site-footer__link">About</NuxtLink>
          <NuxtLink to="/suggest" class="site-footer__link">Suggest a woman</NuxtLink>
        </div>

        <div class="site-footer__col">
          <h4 class="site-footer__col-title">Browse</h4>
          <NuxtLink to="/women/region/west-africa" class="site-footer__link">West Africa</NuxtLink>
          <NuxtLink to="/women/region/east-africa" class="site-footer__link">East Africa</NuxtLink>
          <NuxtLink to="/women/region/southern-africa" class="site-footer__link">Southern Africa</NuxtLink>
          <NuxtLink to="/women/region/central-africa" class="site-footer__link">Central Africa</NuxtLink>
          <NuxtLink to="/women/region/north-africa" class="site-footer__link">North Africa</NuxtLink>
          <NuxtLink to="/women/all" class="site-footer__link">All women A to Z</NuxtLink>
        </div>

        <div class="site-footer__col">
          <h4 class="site-footer__col-title">Contact</h4>
          <a
            href="mailto:hello.herstoryafrica@gmail.com"
            class="site-footer__link site-footer__link--contact"
          >
            <LucideMail :size="16" />
            hello.herstoryafrica@gmail.com
          </a>
        </div>
      </div>

      <div class="site-footer__newsletter">
        <h4 class="site-footer__col-title">Stay in the loop</h4>
        <p class="site-footer__newsletter-desc">
          New stories of remarkable African women, straight to your inbox.
        </p>
        <NewsletterForm placeholder="Your email address" />
      </div>

      <div class="site-footer__bottom">
        <p class="site-footer__line">
          &copy; {{ currentYear }} HerStory Africa. An educational project.
        </p>
        <p class="site-footer__line">
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
  margin-top: 32px;
}

.site-footer__inner {
  max-width: 64rem;
  margin: 0 auto;
  padding: 40px 24px calc(28px + var(--bottom));
  display: flex;
  flex-direction: column;
  gap: 28px;
}

@media (min-width: 768px) {
  .site-footer__inner {
    padding: 48px 32px 32px;
  }
}

.site-footer__brand {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.site-footer__logo-link {
  display: inline-flex;
  align-items: center;
  align-self: flex-start;
  min-height: 44px;
  text-decoration: none;
}

.site-footer__tagline {
  font-size: 15px;
  font-style: italic;
  color: var(--text-muted);
  margin: 0;
}

.site-footer__nav {
  display: flex;
  flex-wrap: wrap;
  gap: 24px 40px;
}

.site-footer__col {
  display: flex;
  flex-direction: column;
  min-width: 128px;
}

.site-footer__col-title {
  font-size: 12px;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin: 0 0 6px;
}

.site-footer__link {
  display: flex;
  align-items: center;
  min-height: 40px;
  font-size: 15px;
  color: var(--text-secondary);
  text-decoration: none;
  transition: color 0.15s ease;
}

.site-footer__link:hover {
  color: var(--color-primary);
}

.site-footer__link--contact {
  gap: 6px;
  word-break: break-all;
}

.site-footer__newsletter {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-top: 24px;
  border-top: 1px solid var(--border-light);
}

.site-footer__newsletter .site-footer__col-title {
  margin-bottom: 0;
}

.site-footer__newsletter-desc {
  font-size: 15px;
  line-height: 1.5;
  color: var(--text-secondary);
  margin: 0;
  max-width: 24rem;
}

.site-footer__bottom {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-top: 20px;
  border-top: 1px solid var(--border-light);
}

@media (min-width: 768px) {
  .site-footer__bottom {
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 8px;
  }
}

.site-footer__line {
  font-size: 13px;
  color: var(--text-muted);
  margin: 0;
}
</style>

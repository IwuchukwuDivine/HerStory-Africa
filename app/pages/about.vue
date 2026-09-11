<template>
  <div class="about">
    <header class="about__header">
      <MuseumLabel level="h1" eyebrow="About" title="Why this exists" />
      <p class="about__intro">
        Too many people with large followings are spreading misconceptions about
        what feminism actually means. Teenagers and young adults in their
        formative years look up to these voices and walk away with the wrong
        idea. This project exists because the best response to misinformation is
        history.
      </p>
    </header>

    <div class="prose about__prose">
      <h2>The problem</h2>
      <p>
        Online conversations about feminism have become loud, polarised, and
        often detached from reality. What gets engagement is not what gets it
        right. Young people scrolling through social media are absorbing ideas
        about gender, equality, and women's rights from people who have never
        read the history, never studied the movements, and never bothered to
        learn the names.
      </p>
      <p>
        The result is a generation that thinks feminism is a trend, a slogan, or
        something to argue about in comment sections. It is not. It is a history
        of real women who risked everything so that other women could vote, own
        property, go to school, and live free from violence.
      </p>

      <h2>What HerStory Africa is</h2>
      <p>
        HerStory Africa is a free, open-source educational archive documenting
        African women who fought for equality, rights, and social change across
        history. No paywalls. No agenda. Just well-sourced history that deserves
        to be told.
      </p>
      <p>
        Every profile is researched, cited, and written to give you the real
        story: who these women were, what they fought for, what it cost them,
        and why it matters today.
      </p>

      <h2>Who it's for</h2>
      <div class="about__audience">
        <div class="panel about__card">
          <LucideGraduationCap :size="20" class="about__card-icon" />
          <h3 class="about__card-title">Students and teenagers</h3>
          <p class="about__card-text">
            Learning about African history and women's rights for the first
            time.
          </p>
        </div>
        <div class="panel about__card">
          <LucideBookOpen :size="20" class="about__card-icon" />
          <h3 class="about__card-title">Educators</h3>
          <p class="about__card-text">
            Looking for well-sourced material to bring into classrooms and
            discussions.
          </p>
        </div>
        <div class="panel about__card">
          <LucideGlobe :size="20" class="about__card-icon" />
          <h3 class="about__card-title">Everyone else</h3>
          <p class="about__card-text">
            Anyone who wants the full story of African history, told through the
            women who shaped it.
          </p>
        </div>
      </div>

      <h2>How profiles are sourced</h2>
      <p>
        Every profile in the archive is sourced from verifiable references:
        Wikipedia, Encyclopaedia Britannica, national archives, academic
        publications, and primary historical documents. Sources are listed at
        the bottom of every profile. Image credits are noted under every
        photograph.
      </p>
      <p>
        If something is wrong, open an issue. Accuracy matters more than volume.
      </p>

      <h2>How to contribute</h2>
      <p>
        HerStory Africa is open source. If you know your country's history well
        and want to add a profile, you can.
      </p>
      <ol class="about__steps">
        <li class="about__step">
          <span class="about__step-num" aria-hidden="true">1</span>
          <span class="about__step-text">Fork the repository on GitHub</span>
        </li>
        <li class="about__step">
          <span class="about__step-num" aria-hidden="true">2</span>
          <span class="about__step-text">Add a new Markdown file in <code>app/content/women/</code></span>
        </li>
        <li class="about__step">
          <span class="about__step-num" aria-hidden="true">3</span>
          <span class="about__step-text">Source your information (Wikipedia, Britannica, primary sources preferred)</span>
        </li>
        <li class="about__step">
          <span class="about__step-num" aria-hidden="true">4</span>
          <span class="about__step-text">Submit a pull request with your sources listed</span>
        </li>
      </ol>
      <Pill
        to="https://github.com/IwuchukwuDivine/herstory-africa"
        variant="secondary"
        target="_blank"
        rel="noopener noreferrer"
      >
        <template #icon>
          <LucideGithub :size="16" />
        </template>
        View on GitHub
      </Pill>
    </div>

    <section class="panel about__suggest" aria-labelledby="about-suggest-title">
      <div class="label">
        <span class="rule" aria-hidden="true" />
        <span class="eyebrow">Suggest a woman</span>
      </div>
      <h2 id="about-suggest-title" class="about__suggest-title">
        Know someone whose story should be here?
      </h2>
      <p class="about__suggest-text">
        If you know an African woman who fought, built, led, or changed
        something and her story isn't in the archive yet, we want to hear about
        her.
      </p>
      <Pill to="/suggest" variant="primary" class="about__suggest-cta">
        <template #icon>
          <LucideSend :size="16" />
        </template>
        Suggest a woman
      </Pill>
    </section>

    <footer class="about__footer">
      <p class="about__credit">
        Built by
        <a
          href="https://deevyn-portfolio.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
        >Divine Iwuchukwu</a>. HerStory Africa, the women history forgot to teach you.
      </p>
    </footer>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  title: "About",
  description:
    "Why HerStory Africa exists: an open-source educational archive documenting African women who fought for equality, rights, and social change.",
  ogTitle: "About HerStory Africa",
  ogDescription:
    "Why HerStory Africa exists: correcting misconceptions about feminism through real history.",
  ogUrl: getAbsoluteUrl("/about"),
});

defineOgImage("Card", {
  variant: "page",
  pill: "About",
  title: "Why this exists",
  description:
    "Why HerStory Africa exists: an open-source educational archive documenting African women who fought for equality, rights, and social change.",
});

useHead({
  link: [{ rel: "canonical", href: getAbsoluteUrl("/about") }],
});
</script>

<style scoped>
.about {
  max-width: 48rem;
  margin: 0 auto;
  padding: 28px 24px 56px;
}

@media (min-width: 768px) {
  .about {
    padding: 40px 32px 64px;
  }
}

.about__header {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 40px;
}

.about__intro {
  max-width: 42rem;
  font-size: 17px;
  line-height: 1.6;
  color: var(--text-secondary);
  margin: 0;
}

/* ── Audience panels ── */
.about__audience {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  margin: 0 0 24px;
}

@media (min-width: 640px) {
  .about__audience {
    grid-template-columns: repeat(3, 1fr);
  }
}

.about__card {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.about__card-icon {
  color: var(--color-primary);
  margin-bottom: 4px;
}

.about__card-title {
  font-size: 16px;
  font-weight: 700;
  line-height: 1.3;
  color: var(--text-primary);
  margin: 0;
}

.about__card-text {
  font-size: 15px;
  line-height: 1.55;
  color: var(--text-secondary);
  margin: 0;
}

/* ── Contribution steps: 32px numbered circles like the reading path ── */
.about__steps {
  gap: 14px;
  margin: 0 0 24px;
}

.about__step {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding-left: 0;
  font-size: 17px;
  line-height: 1.6;
}

.about__step::before {
  content: none;
}

.about__step-num {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1.5px solid var(--border-default);
  font-size: 14px;
  font-weight: 800;
  line-height: 1;
  color: var(--color-primary);
}

.about__step-text {
  padding-top: 3px;
}

.about__step-text code {
  font-size: 15px;
  padding: 2px 6px;
  border-radius: 6px;
  background: var(--surface-subtle);
  color: var(--color-primary);
}

/* ── Suggest panel ── */
.about__suggest {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 40px;
}

.about__suggest-title {
  font-size: 22px;
  font-weight: 800;
  line-height: 1.2;
  color: var(--text-primary);
  margin: 0;
}

.about__suggest-text {
  font-size: 16px;
  line-height: 1.6;
  color: var(--text-secondary);
  margin: 0;
}

.about__suggest-cta {
  align-self: flex-start;
  margin-top: 4px;
}

/* ── Footer credit ── */
.about__footer {
  margin-top: 40px;
  padding-top: 24px;
  border-top: 1px solid var(--border-light);
}

.about__credit {
  font-size: 13px;
  line-height: 1.5;
  color: var(--text-muted);
  margin: 0;
}

/* Inline link padded to a 44px hit box without moving the line. */
.about__credit a {
  display: inline-block;
  padding: 12px 0;
  margin: -12px 0;
  color: var(--text-secondary);
  text-decoration: underline;
  text-underline-offset: 3px;
}

.about__credit a:hover {
  color: var(--color-primary);
}
</style>

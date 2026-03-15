<template>
  <div class="about">
    <header class="about__header">
      <h1 class="about__title">Why This Exists</h1>
      <p class="about__lead">
        Too many people with large followings are spreading misconceptions about
        what feminism actually means. Teenagers and young adults in their
        formative years look up to these voices and walk away with the wrong
        idea. This project exists because the best response to misinformation is
        history.
      </p>
    </header>

    <section class="about__section">
      <h2 class="about__heading">The Problem</h2>
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
    </section>

    <section class="about__section">
      <h2 class="about__heading">What HerStory Africa Is</h2>
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
    </section>

    <section class="about__section">
      <h2 class="about__heading">Who It's For</h2>
      <div class="about__audience">
        <div class="about__audience-card">
          <LucideGraduationCap :size="24" class="about__audience-icon" />
          <h3>Students &amp; Teenagers</h3>
          <p>
            Learning about African history and women's rights for the first
            time.
          </p>
        </div>
        <div class="about__audience-card">
          <LucideBookOpen :size="24" class="about__audience-icon" />
          <h3>Educators</h3>
          <p>
            Looking for well-sourced material to bring into classrooms and
            discussions.
          </p>
        </div>
        <div class="about__audience-card">
          <LucideGlobe :size="24" class="about__audience-icon" />
          <h3>Everyone Else</h3>
          <p>
            Anyone who wants the full story of African history, told through the
            women who shaped it.
          </p>
        </div>
      </div>
    </section>

    <section class="about__section">
      <h2 class="about__heading">How Profiles Are Sourced</h2>
      <p>
        Every profile in the archive is sourced from verifiable references:
        Wikipedia, Encyclopaedia Britannica, national archives, academic
        publications, and primary historical documents. Sources are listed at
        the bottom of every profile. Image credits are noted in every page's
        metadata.
      </p>
      <p>
        If something is wrong, open an issue. Accuracy matters more than volume.
      </p>
    </section>

    <section class="about__section">
      <h2 class="about__heading">Contribute</h2>
      <p>
        HerStory Africa is open source. If you know your country's history well
        and want to add a profile, you can.
      </p>
      <ol class="about__steps">
        <li>Fork the repository on GitHub</li>
        <li>Add a new Markdown file in <code>app/content/women/</code></li>
        <li>
          Source your information (Wikipedia, Britannica, primary sources
          preferred)
        </li>
        <li>Submit a pull request with your sources listed</li>
      </ol>
      <p>
        <a
          href="https://github.com/IwuchukwuDivine/herstory-africa"
          target="_blank"
          rel="noopener noreferrer"
          class="about__github-link"
        >
          <LucideGithub :size="18" />
          View on GitHub
        </a>
      </p>
    </section>

    <section class="about__section about__suggest">
      <h2 class="about__heading">Know someone whose story should be here?</h2>
      <p>
        If you know an African woman who fought, built, led, or changed
        something and her story isn't in the archive yet, we want to hear
        about her.
      </p>
      <NuxtLink to="/suggest" class="about__suggest-link">
        <LucideSend :size="18" />
        Suggest a woman
      </NuxtLink>
    </section>

    <footer class="about__footer">
      <p class="about__built-by">
        Built by
        <a
          href="https://deevyn-portfolio.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Divine Iwuchukwu
        </a>
      </p>
      <p class="about__tagline">
        HerStory Africa &mdash; The women history forgot to teach you.
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
  ogImage: "https://her-story-africa-seven.vercel.app/og-image.png",
});
</script>

<style scoped>
.about {
  max-width: 48rem;
  margin: 0 auto;
  padding: 2rem 1.5rem 3.5rem;
}

@media (min-width: 768px) {
  .about {
    padding: 2.5rem 2rem 4rem;
  }
}

.about__header {
  margin-bottom: 3rem;
  padding-bottom: 2.5rem;
  border-bottom: 1px solid var(--border-light);
}

.about__title {
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 800;
  color: var(--text-primary);
  margin: 0;
  line-height: 1.15;
}

.about__lead {
  font-size: 1.1875rem;
  line-height: 1.7;
  color: var(--text-secondary);
  margin: 1.25rem 0 0;
}

.about__section {
  margin-bottom: 2.5rem;
}

.about__heading {
  font-size: 1.375rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.75rem;
}

.about__section p {
  font-size: 1.0625rem;
  line-height: 1.8;
  color: var(--text-secondary);
  margin: 0 0 1rem;
}

.about__section p:last-child {
  margin-bottom: 0;
}

/* ── Audience cards ── */
.about__audience {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  margin-top: 0.5rem;
}

@media (min-width: 640px) {
  .about__audience {
    grid-template-columns: repeat(3, 1fr);
  }
}

.about__audience-card {
  padding: 1.5rem;
  border-radius: 1rem;
  background: var(--surface-elevated);
  border: 1.5px solid var(--border-light);
}

.about__audience-icon {
  color: var(--color-primary);
  margin-bottom: 0.75rem;
}

.about__audience-card h3 {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.375rem;
}

.about__audience-card p {
  font-size: 0.9375rem;
  line-height: 1.5;
  color: var(--text-muted);
  margin: 0;
}

/* ── Steps list ── */
.about__steps {
  padding-left: 1.5rem;
  margin: 0.75rem 0 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.about__steps li {
  font-size: 1.0625rem;
  line-height: 1.6;
  color: var(--text-secondary);
}

.about__steps code {
  font-size: 0.9375rem;
  padding: 0.125rem 0.5rem;
  border-radius: 0.375rem;
  background: var(--surface-subtle);
  color: var(--color-primary);
}

/* ── GitHub link ── */
.about__github-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  font-size: 0.9375rem;
  font-weight: 600;
  border-radius: 9999px;
  background: var(--color-primary);
  color: var(--text-on-primary);
  text-decoration: none;
  transition:
    background 0.2s ease,
    transform 0.15s ease;
}

.about__github-link:hover {
  background: var(--color-primary-600);
  transform: translateY(-1px);
}

/* ── Suggest CTA ── */
.about__suggest {
  padding: 2rem;
  border-radius: 1rem;
  background: var(--surface-elevated);
  border: 1.5px solid var(--border-light);
}

.about__suggest-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  font-size: 0.9375rem;
  font-weight: 600;
  border-radius: 9999px;
  background: var(--color-primary);
  color: var(--text-on-primary);
  text-decoration: none;
  transition:
    background 0.2s ease,
    transform 0.15s ease;
}

.about__suggest-link:hover {
  background: var(--color-primary-600);
  transform: translateY(-1px);
}

/* ── Footer ── */
.about__footer {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid var(--border-light);
  text-align: center;
}

.about__built-by {
  font-size: 0.9375rem;
  color: var(--text-secondary);
  margin: 0 0 0.375rem;
}

.about__built-by a {
  color: var(--color-primary);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.about__built-by a:hover {
  color: var(--color-primary-600);
}

.about__tagline {
  font-size: 0.875rem;
  font-style: italic;
  color: var(--text-muted);
  margin: 0;
}
</style>

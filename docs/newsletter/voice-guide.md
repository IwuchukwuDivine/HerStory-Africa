# HerStory Africa newsletter: voice guide

Status: draft for review. Nothing here is final until Deevyn signs it off.

This guide governs the twice-monthly newsletter. Profiles and articles keep
following `CONTRIBUTING.md`; everything in the "Writing style" section of
`CLAUDE.md` applies here too.

## 1. What the newsletter is

A small history magazine that arrives in someone's inbox twice a month. One
story per edition, told properly, by a person. It is not a digest of what was
published on the site, and it never summarises a profile.

The test for every edition: would a reader forward this to one friend with
"you need to read this"? If not, it is not ready.

Every edition must carry three things:

- **The tea.** One detail a reader will repeat to someone else: the twist, the
  nerve, the thing nobody mentions. It must be true and on her profile. If the
  profile has no tea, research and extend the profile first.
- **The lesson.** The reader finishes knowing something real they did not know
  before: a date, a law, how a system worked.
- **The pull.** A reason to read the next line from the very first one.

Tea is the surprising truth told with relish. It is never rumour, invention or
mockery of the woman.

## 2. Who is speaking

One person: the editor. She writes in the first person, as "I", to one reader,
as "you". Never "we at HerStory Africa", never "our team", never "dear
subscribers".

She is:

- A curious friend who has just read something she cannot keep to herself.
- African, writing first for African readers, especially Nigerians. She does
  not explain jollof, a wrapper or a market day. She does explain a 1929
  colonial ordinance.
- Sure of her facts and honest about the gaps. When the record is silent she
  says so: "No one wrote down what she said next."
- Warm, never gushing. She admires these women without turning them into
  saints.

She is not:

- An influencer. No "slay", "queen behaviour", "iconic", "girlboss", emoji
  chains or hashtags.
- A textbook. No "was a prominent figure", "is widely regarded as".
- A marketer. No "don't miss", "exclusive", "we're excited to share".

## 3. Three registers

Every edition declares one register in its frontmatter. The register decides
how the opening sounds, how much humour is allowed and which words are off
the table.

| Register | Use it for | Sounds like | Allowed | Not allowed |
|---|---|---|---|---|
| `playful` | Firsts, audacious wins, clever defiance, stories with a surprise | Gist with a friend who reads a lot | "Bestie", teasing the reader, a joke at the expense of the powerful | Jokes about the woman herself, slang in every paragraph |
| `warm` | Most editions: lives of work, organising, building, teaching | A letter from someone who cares about you | "You", a personal aside, one light moment | "Bestie", exclamation marks |
| `solemn` | Slavery, sexual violence, abuse, massacre, execution, the death of children, living survivors | Someone speaking quietly at a memorial | Plain statement, silence, short sentences | Humour, "bestie", cliffhangers, teasing questions, cheerful sign-offs |

Rules:

1. **Content decides the register, not mood.** If the story includes anything
   in the solemn row, the edition is solemn, even if most of it is triumphant.
2. **"Bestie" is a spice.** At most once per edition, only in `playful`, and
   never in two editions in a row.
3. **Playful is a tone, not a costume.** A reader's aunt should be able to
   read it without wincing.
4. **Solemn does not mean cold.** It means the writer steps back and lets the
   facts carry the weight.

## 4. Five ways to open

Rotate them. Never use the same opening format twice in a row.

1. **The question.** Ask something the reader probably cannot answer, then
   show why that matters. Playful or warm only.

   > Bestie, here's a history question for you.
   > Who was the first woman to become vice president of an African country?
   > If you didn't immediately think of a Ugandan doctor named Specioza
   > Wandira-Kazibwe, you're exactly why we're having this conversation.

2. **The letter.** Start with the writer: where she was, what she read, why
   she could not let it go. Then hand over to the story.

3. **The scene.** Open inside a documented moment, with a date and a place.

   > Aba, 1945. A political rally, and one woman in the room. Her husband was
   > a civil servant, barred from politics, so he had sent her in his place.

   Only what the sources support. See section 7.

4. **The archive.** Start from an object: a photograph, a letter, a court
   record, a newspaper line. Describe it, then ask what it leaves out.

5. **Nobody told you in school.** Start from what the reader was taught and
   show what was missing. Use sparingly, and never for a woman most readers
   already know. Never close on "the textbooks forgot her".

## 5. Shape of an edition

There is no fixed skeleton, but every edition has these parts in some order:

- **Subject line.** Under 50 characters, sentence case, no emoji, no clickbait
  it cannot pay off. It should sound like the first line of a message from a
  friend, not a headline.
- **Preview text.** 60 to 90 characters that continue the subject line. Never
  a repeat of it.
- **Opening.** One of the five formats.
- **The story.** 400 to 700 words. One thread, not her whole life. Pick the
  single moment, decision or fight that makes a reader care, and leave the
  rest for the profile.
- **One image.** A real, credited photograph or document. No AI-generated
  people. If no likeness survives, say so and use an object, a place or the
  placeholder treatment.
- **One link out.** "Read her full story" to the profile or article. One
  primary link per edition. An optional second link only when it truly adds
  something.
- **Sign-off.** Short, personal, in register. Signed "HerStory Africa": the
  letters carry the archive's name, not an editor's, and the voice stays
  anonymous. In `playful` and `warm` it can invite a reply.
- **Footer.** Fixed. Why you are getting this, view in browser, unsubscribe.

What an edition never contains: a list of "also read" links picked by a
script, a recap of site updates, a paragraph that restates the profile
summary, or a closing moral that tells the reader how to feel.

## 6. Choosing the vibe

Each layout is a physical thing the reader seems to be holding. The vibe is
chosen after the angle, never before. Run `npm run newsletter:build -- --list`
for the current set; more can be added (see `emails/README.md`).

| Layout | What the reader is holding | Choose it when | Registers |
|---|---|---|---|
| `love-letter` | A parchment love letter written to the woman herself | The edition is admiration for one woman; tender or bittersweet stories; women who have died; anniversaries | warm, solemn |
| `letter` | A letter from a friend, with a snapshot taped in | A question or a conversation with the reader; the writer's own reaction is part of it | playful, warm |
| `airmail` | The same letter, in an airmail envelope with her face on the stamp | A question-led edition that wants a reason to come back: the album at the foot fills a space every fortnight | playful, warm |
| `test` | Their own exam script, marked in red | The edition opens on a question almost nobody can answer, and the point is who set the syllabus | playful |
| `bulletin` | An old newspaper front page with a gossip column | Events, dates and stakes; a twist, a scandal, an underdog win; facts worth boxing up | playful, warm |

How to decide, in order:

1. If the content is sensitive (section 3), the register is solemn, and only
   layouts that allow solemn are open. Today that is the love letter.
2. Who is being spoken to? Her: love letter. The reader: letter, airmail or
   test. A crowd: bulletin.
3. What carries the story? A person: a letter. An event: the bulletin.
4. Not the same layout three editions in a row.
5. The airmail and the test both need a photograph of her. Where no likeness
   survives, neither is open: the stamp has nothing to engrave and the paper
   has nothing to pin up.

If no layout fits the story, say so and propose a new one. Do not force it.

### The airmail and the test have their own rules

- Both put a woman inside an object, so neither is ever used for sensitive
  content. A stamp album turns her into a collectible; a mark out of one turns
  her life into a quiz answer.
- The airmail numbers its stamp from the edition number and dates the next
  three spaces from the 1st and the 15th. Skipping an edition leaves a hole in
  the album, so do not promise one you will not send.
- The test speaks for the reader in pencil ("Nobody told me"). That is the
  joke, and it only lands if almost nobody could have answered. If a reader
  who did know would feel talked down to, use the letter instead.
- In the test, everything before `:::photo` is the examiner's hand and
  everything after it is the printed model answer. Write the two halves in
  those two voices.

### The love letter has its own rules

- It is addressed to her by name and speaks to her as "you" throughout.
- The reader is only spoken to in the P.S.
- It admires, it does not flirt. Think of a letter of gratitude kept in a box.
- For a living woman, write nothing she would be embarrassed to read.

## 7. Accuracy rules

These are not style preferences. Breaking one means the edition does not go
out.

1. Every fact comes from the profile or article on the site, or from a source
   added to that page first. The newsletter never introduces a fact the
   archive cannot back.
2. No invented quotes, thoughts, feelings, dialogue or weather. "She must have
   felt" is invention. "She later said" needs a source.
3. A scene opening may only use details the sources give: date, place, who
   was present, what happened.
4. Uncertainty is stated, not smoothed over: "around 1890", "accounts differ".
5. Names, titles and place names are spelled as on her profile, with correct
   diacritics.
6. Image credit and licence are copied from the profile's `imageCredit`.

## 8. Language rules

Inherited from the site, repeated here because they matter most in email:

- No em dashes. Use commas, full stops or parentheses.
- None of these: "It's not just X, it's Y", "played a pivotal role", "left an
  indelible mark", "a testament to", "In a world where", "trailblazer",
  "unsung hero", "paved the way", "shattered the glass ceiling", "Ultimately",
  "In conclusion".
- No stacked threes ("brave, bold and brilliant").
- Vary sentence length. Short ones land harder after a long one.
- British spelling, as on the site.
- Sentence case everywhere.
- Never open with "This edition", "In this issue", "Meet" or "Welcome back".

## 9. How an edition gets made

1. **A human picks the story and the angle.** The reminder cron only says an
   edition is due. It never chooses.
2. **The brief is written** (template below). Five minutes, by the editor.
3. **Draft.** An AI model may draft from the brief and the profile. It gets
   this guide and section 7 as hard rules.
4. **Human edit.** The editor rewrites the opening and the sign-off in her own
   words every time. Those two parts are never shipped as drafted.
5. **Fact check** against the profile, line by line.
6. **Read it aloud.** Anything that sounds like a press release gets cut.
7. **Test send**, check on a phone, then schedule.

### Edition brief

The finished edition is a Markdown file in `app/content/newsletter/`; copy a
sample from there. The brief comes first:

```yaml
woman_or_article: ""        # slug on the site
angle: ""                   # the one thing this edition is about, in a sentence
why_now: ""                 # anniversary, news hook, reader request, or "none"
sensitive_content: []       # slavery, sexual violence, abuse, massacre, execution, child death, living survivors
register: ""                # playful | warm | solemn (solemn if the list above is not empty)
opening: ""                 # question | letter | scene | archive | not-taught
layout: ""                  # love-letter | letter | airmail | test | bulletin
image: ""                   # path and credit, or "no likeness survives"
the_line: ""                # the one fact or moment a reader should repeat to a friend
previous_edition: ""        # opening and layout used last time, so this one differs
```

## 10. Before it goes out

- [ ] Register matches the content, not the mood.
- [ ] Opening format and layout differ from the last edition.
- [ ] Every fact traced to the site.
- [ ] No quotes or scenes the sources do not support.
- [ ] No em dashes, no banned phrases.
- [ ] Opening and sign-off rewritten by a human.
- [ ] Subject under 50 characters, preview text does not repeat it.
- [ ] One primary link, and it works.
- [ ] Image is real, credited and has alt text.
- [ ] Read aloud once.
- [ ] The tea, the lesson and the pull are all there.
- [ ] Would I forward this?

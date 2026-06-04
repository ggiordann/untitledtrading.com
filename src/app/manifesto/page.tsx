import React from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "../../components/Navbar";
import gameTheoryImage from "./gametheory.jpg";

export const metadata = {
  title: "Untitled Trading",
  description: "A manifesto for Untitled Trading and the probability age.",
};

const manifestoCriticalCss = `
@font-face {
  font-family: 'Aeonik-Bold';
  src: url('/fonts/Aeonik-Bold.otf') format('opentype');
  font-weight: 700;
  font-display: swap;
  font-style: normal;
}

@font-face {
  font-family: 'Aeonik-Regular';
  src: url('/fonts/Aeonik-Regular.otf') format('opentype');
  font-weight: 400;
  font-display: swap;
  font-style: normal;
}

@font-face {
  font-family: 'Aeonik-Thin';
  src: url('/fonts/Aeonik-Thin.otf') format('opentype');
  font-weight: 300;
  font-display: swap;
  font-style: normal;
}

@font-face {
  font-family: 'Voyager-Thin';
  src: url('/fonts/Voyager-Thin.otf') format('opentype');
  font-weight: 300;
  font-display: swap;
  font-style: normal;
}

@font-face {
  font-family: 'Graebenbach-Mono-Regular';
  src: url('/fonts/Graebenbach-Mono-Regular.ttf') format('truetype');
  font-weight: 400;
  font-display: swap;
  font-style: normal;
}

html,
body {
  margin: 0;
  background: #000;
  color: #fff;
}

body {
  min-width: 320px;
}

a {
  color: inherit;
}

.fixed-header-container header {
  position: fixed;
  z-index: 50;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.fixed-header-container header > a p {
  position: absolute;
  top: 2rem;
  left: 2rem;
  margin: 0;
  color: #fff;
  font-family: 'Aeonik-Bold', -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif;
  font-size: 21px;
  line-height: 1;
  letter-spacing: 0;
}

.fixed-header-container nav {
  position: absolute;
  top: 2rem;
  right: 2rem;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.fixed-header-container nav a {
  color: rgb(255 255 255 / 0.5);
  font-family: 'Graebenbach-Mono-Regular', -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif;
  font-size: 1rem;
  line-height: 1.5;
  text-align: center;
  text-decoration: none;
}

.fixed-header-container nav a:hover {
  color: #fff;
}

.manifesto-page {
  min-height: 100vh;
  width: 100%;
  background: #000;
  color: #fff;
}

.manifesto-shell {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 1280px;
  box-sizing: border-box;
  margin: 0 auto;
  padding: 8rem 1.5rem 7rem;
}

.manifesto-back,
.manifesto-kicker,
.manifesto-section-label,
.manifesto-contact {
  font-family: 'Graebenbach-Mono-Regular', -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu,
    Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
  font-size: 12px;
  line-height: 1.4;
  text-transform: uppercase;
}

.manifesto-back {
  display: inline-flex;
  width: fit-content;
  margin-bottom: 3.5rem;
  color: rgb(255 255 255 / 0.5);
  letter-spacing: 0.18em;
  text-decoration: none;
  transition: color 200ms ease;
}

.manifesto-back:hover,
.manifesto-contact:hover {
  color: #fff;
}

.manifesto-hero {
  display: grid;
  gap: 3rem;
  align-items: center;
  padding-bottom: 5rem;
  border-bottom: 1px solid rgb(255 255 255 / 0.2);
}

.manifesto-kicker {
  margin: 0 0 1.25rem;
  color: rgb(255 255 255 / 0.4);
  letter-spacing: 0.26em;
}

.manifesto-title,
.manifesto-quote,
.manifesto-section-title,
.manifesto-final-line {
  font-family: 'Voyager-Thin', -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell,
    Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
  color: #fff;
  letter-spacing: 0;
}

.manifesto-title {
  max-width: 820px;
  margin: 0;
  font-size: clamp(3.875rem, 13vw, 7.375rem);
  line-height: 0.96;
}

.manifesto-byline {
  max-width: 560px;
  margin: 2rem 0 0;
  color: rgb(255 255 255 / 0.5);
  font-family: 'Graebenbach-Mono-Regular', -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif;
  font-size: 13px;
  line-height: 1.55;
  letter-spacing: 0.03em;
  text-transform: none;
}

.manifesto-hero-copy {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2.25rem;
}

.manifesto-quote {
  max-width: 720px;
  margin: 0;
  padding-left: 1.5rem;
  border-left: 1px solid rgb(255 255 255 / 0.3);
  font-size: clamp(2rem, 7.5vw, 3rem);
  line-height: 1.18;
}

.manifesto-article {
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-top: 0;
}

.manifesto-opening {
  display: flex;
  justify-content: center;
  padding: 3rem 0 4.5rem;
  border-bottom: 1px solid rgb(255 255 255 / 0.1);
}

.manifesto-opening-spacer {
  display: none;
}

.manifesto-opening-body {
  width: 100%;
  max-width: 860px;
  color: rgb(255 255 255 / 0.8);
  font-family: 'Aeonik-Thin', -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell,
    Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
  font-size: clamp(1.1875rem, 4.5vw, 1.375rem);
  line-height: 1.78;
  letter-spacing: 0.01em;
}

.manifesto-opening-body p:first-child::first-letter {
  float: left;
  margin: 0.11em 0.14em 0 0;
  color: #fff;
  font-family: 'Aeonik-Bold', -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif;
  font-size: calc(2em * 1.78);
  line-height: 0.78;
  letter-spacing: 0;
}

.manifesto-opening-body p {
  margin: 0;
}

.manifesto-opening-body p + p {
  margin-top: 2rem;
}

.manifesto-section {
  display: grid;
  gap: 2.5rem;
  padding: 5rem 0;
  border-bottom: 1px solid rgb(255 255 255 / 0.1);
}

.manifesto-section-label {
  margin: 0 0 1rem;
  color: rgb(255 255 255 / 0.4);
  letter-spacing: 0.22em;
}

.manifesto-section-title {
  max-width: 360px;
  margin: 0;
  font-size: clamp(2.75rem, 10vw, 4rem);
  line-height: 1.04;
}

.manifesto-section-body {
  width: 100%;
  max-width: 860px;
  color: rgb(255 255 255 / 0.8);
  font-family: 'Aeonik-Thin', -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell,
    Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
  font-size: clamp(1.1875rem, 4.5vw, 1.375rem);
  line-height: 1.78;
  letter-spacing: 0.01em;
}

.manifesto-section-body p {
  margin: 0;
}

.manifesto-section-body p + p {
  margin-top: 2rem;
}

.manifesto-final {
  display: grid;
  gap: 2rem;
  min-height: 72vh;
  align-items: center;
  padding: 7rem 0 8rem;
}

.manifesto-final-spacer {
  display: none;
}

.manifesto-final-inner {
  max-width: 860px;
}

.manifesto-final-line {
  margin: 0;
  font-size: clamp(3rem, 10vw, 4.875rem);
  line-height: 1.08;
}

.manifesto-final-board {
  width: min(100%, 760px);
  margin: 3.25rem 0 0;
}

.manifesto-final-image-frame {
  position: relative;
  width: 100%;
  aspect-ratio: 1.42;
  overflow: hidden;
  background: #000;
}

.manifesto-final-image {
  object-fit: cover;
  object-position: 50% 54%;
  filter: grayscale(1) contrast(1.08);
}

.manifesto-final-caption {
  margin: 1rem 0 0;
  color: rgb(255 255 255 / 0.5);
  font-family: 'Graebenbach-Mono-Regular', -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif;
  font-size: 12px;
  font-style: italic;
  line-height: 1.4;
  letter-spacing: 0.16em;
}

.manifesto-contact {
  display: inline-flex;
  margin-top: 2.5rem;
  color: rgb(255 255 255 / 0.6);
  letter-spacing: 0.2em;
  text-decoration: underline;
  text-underline-offset: 8px;
  transition: color 200ms ease;
}

footer {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0 2rem 1.25rem;
  color: #fff;
}

footer > div {
  display: flex;
  flex-direction: column;
  width: 100%;
}

footer h1 {
  margin: 0;
  font-family: 'Aeonik-Bold', -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif;
  line-height: 1.1;
  letter-spacing: 0;
}

footer h1:first-child {
  font-size: clamp(1.5rem, 9vw, 6.75rem);
}

footer h1:nth-child(2) {
  overflow-wrap: anywhere;
  text-align: end;
  font-size: clamp(1rem, 6.2vw, 4.875rem);
  line-height: 1;
}

footer p {
  width: 100%;
  margin: 2.5rem 0 0;
  opacity: 0.6;
  font-family: 'Aeonik-Regular', -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif;
  font-size: 16px;
  text-align: center;
}

body > div[class*='fixed'][class*='bottom'] {
  position: fixed;
  right: 2rem;
  bottom: 2rem;
  z-index: 50;
  display: none;
  flex-direction: column;
  gap: 1.5rem;
}

body > div[class*='fixed'][class*='bottom'] a {
  opacity: 0.6;
  transition: opacity 150ms ease;
}

body > div[class*='fixed'][class*='bottom'] a:hover {
  opacity: 1;
}

@media (min-width: 768px) {
  .fixed-header-container header > a p {
    font-size: 18px;
  }

  .manifesto-shell {
    padding-right: 2.5rem;
    padding-left: 2.5rem;
  }

  .manifesto-section {
    padding: 6rem 0;
  }

  body > div[class*='fixed'][class*='bottom'] {
    display: flex;
  }
}

@media (min-width: 1024px) {
  .manifesto-shell {
    padding-right: 3.5rem;
    padding-left: 3.5rem;
  }

  .manifesto-hero {
    grid-template-columns: 0.86fr 1fr;
    gap: 5rem;
  }

  .manifesto-section,
  .manifesto-final {
    grid-template-columns: 260px 1fr;
    gap: 5rem;
  }

  .manifesto-section-meta {
    position: sticky;
    top: 7rem;
    height: fit-content;
  }

  .manifesto-section-title {
    font-size: 3.625rem;
  }

  .manifesto-final-spacer {
    display: block;
  }

  footer {
    padding-right: 6rem;
    padding-bottom: 2.5rem;
    padding-left: 6rem;
  }
}
`;

const manifestoOpening = [
  "In July 2003, the Pentagon tried to build a market for coups, terrorist attacks, and political instability in the Middle East.",
  "It was called the Policy Analysis Market. The idea was cold enough to sound insane. If markets could gather scattered knowledge better than committees, maybe a price could notice geopolitical risk before an intelligence agency could.",
  "Senators saw something different. A government backed betting parlor for atrocity. Within a day of public outrage, the project was dead.",
  "The category did not die with it. It only waited for the world to become less shocked by the idea that uncertainty has a price.",
];

const manifestoSections = [
  {
    label: "I",
    title: "The First Mispricing",
    paragraphs: [
      "A market becomes interesting when consensus has not caught up to reality. The surface can remain calm for a while after the important thing has moved underneath it. That delay rarely shows up cleanly, and it almost never looks heroic while it is happening.",
      "Markets give public stories too much time to survive. Information arrives unevenly, attention moves slowly, and stories keep their shape longer than they deserve. The obvious reaction is usually crowded. What matters is the discipline to stay honest while the crowd is still forming its view.",
      "Untitled Trading is built around that discipline. We do not want the clean story after the outcome, because the clean story is usually just hindsight wearing a suit. Our work sits earlier, when reality remains ugly, the evidence stays partial, and acting appears premature to those who need consensus before they can move.",
      "Most public thinking treats the future as something to narrate. Markets punish that habit. One can sound intelligent about politics, sport, regulation, science, or technology, then vanish before settlement asks what the sentence was worth. Prediction markets make the sentence heavier. They force belief to take a form that can be attacked.",
      "This is why the category matters more than its current reputation. People still talk about prediction markets as if they are a strange entertainment layer on top of the news, because early categories are always judged by their least critical use case. The final shape is different. A liquid market for outcomes turns the future into a public surface, and the first groups that learn to read that surface well will not look like traditional media, traditional finance, or traditional research.",
      "They will look like people who became uncomfortable with unpriced uncertainty before everyone else did.",
    ],
  },
  {
    label: "II",
    title: "Belief Has To Bleed",
    paragraphs: [
      "The internet made opinion infinite and memory weak. Forecasts about elections, product launches, court decisions, macro risk, cultural shifts, and scientific claims can gather status without carrying much consequence. Even when the archive remembers the sentence, the social system rarely remembers the cost of being wrong.",
      "A prediction market changes the cost structure. The statement has to become a price, and once that happens, another person can take the other side. It may still be wrong for hours, weeks, or months. Early markets are imperfect, uneven, and sometimes badly designed. Wrongness becomes organized enough for another mind to fight it.",
      "Belief should not be protected from contact with time. A forecast that never settles becomes decoration, even when it sounds critical. Exposure gives the idea a body. It can be wounded, defended, resized, abandoned, or vindicated. That is closer to philosophy than gambling, because the question is no longer whether someone can persuade a room. What matters is whether their model survives a world that does not care how persuasive it sounded.",
      "Its moral value is easy to underestimate. Society has too many places where confidence can float without being scored, and too few places where uncertainty is made legible enough to improve decisions. A mayor can announce a policy with ceremonial conviction, a company can insist a product will ship, a research field can praise a result while specialists privately distrust the method. Hidden doubt is everywhere, but most systems give it no graceful path into the open.",
      "Prediction markets give hidden doubt a door. The door is imperfect, sometimes ugly, and sometimes misused, which is why market design and culture matter. Still, a flawed door is better than a locked room. When private knowledge can become public probability before failure becomes undeniable, the institution loses some of its ability to hide inside language.",
      "That is the civic promise. Better markets will not make people wise by default, but they can make certain kinds of foolishness more expensive. They can turn vague claims into measurable expectations, reveal when the crowd is confusing emotional force with likelihood, and create a public record that outlives the news cycle. Over time, a society that learns to read probability becomes harder to hypnotize.",
    ],
  },
  {
    label: "III",
    title: "The Last Generalists",
    paragraphs: [
      "AI is making polished thought cheap. The world is already filling with summaries, code, simulations, charts, confident explanations, and arguments that sound correct enough to pass through a tired room. When presentation collapses toward zero cost, the scarce skill becomes taste. Taste is the ability to know which game is worth playing, which constraint controls the outcome, and which clean abstraction is quietly false.",
      "Prediction markets reward that kind of taste because every domain becomes learnable only after you stop respecting its official costume. Once an outcome has a price, the label matters less than the system underneath it. The surface opens the door, then the real work begins below it.",
      "This is why being pigeonholed destroys judgment. People are trained to move through fields in straight lines, collecting approved signals and mistaking the route for the territory. A critical operator has to learn faster than the institution, then leave the institution's map without becoming sloppy. Tourism across domains is useless. What matters is understanding a system without becoming captured by its costume.",
      "We believe the last job is quantitative, as every empirical field moves toward a feedback loop. Markets were the first obvious laboratory because the score was fast and brutal, but the same logic is spreading through everything that can be simulated, measured, forecasted, or optimized. Prediction markets sit at the center of that shift because they connect the generalist's ability to learn a system with the trader's need to be right under risk.",
      "Untitled Trading should be built for people who kept the dangerous part of themselves alive. The person we want reaches past coder, analyst, sports obsessive, political addict, or a finance kid with a terminal. We want the mind that can enter an unfamiliar system, ignore the prestige map, and turn private judgment into disciplined work.",
      "That temperament is rare because it asks for traits that normally fight each other. You need patience that stays hard, aggression disciplined by rigor, active humility, and enough arrogance to take a position—but only the kind that dies when the record kills it. Most people can hold one side of that tension for a while, then their psychology leaks into the trade. The company has to become a structure that keeps the tension productive.",
    ],
  },
  {
    label: "IV",
    title: "The Rails Before Respect",
    paragraphs: [
      "Prediction markets are yet to reach maturity. Liquidity is uneven, resolution standards are young, regulation will reshape the field, interfaces still feel early, and too much of the culture carries the smell of a casino. None of that makes the category less important. Early rails are supposed to look rough before the world understands what will run on them.",
      "The best builders make ambition visible through infrastructure before the category becomes socially safe. Jeffery Yan did not make Hyperliquid interesting by asking the world to admire a startup identity. The important part was stranger and more demanding. A small team chose a hard technical standard, refused the comfortable funding path, let users own meaningful upside, and kept building until markets that had traded one way for a century began to bend around new rails.",
      "Untitled Trading has to carry that standard into prediction markets. A clever content brand around event odds would be the wrong ambition. The work is to build systems, culture, and judgment around the moment probability becomes public. If this category becomes empirical, someone will help define the operating discipline early. We intend to be one of those groups.",
      "Respectability is usually consensus after the hard part is already over. By the time a market looks clean, the most interesting assumptions have often been professionalized into language everyone can repeat. Roughness is where builders matter. It is also where traders with taste can see which constraints matter and which ones will fade.",
      "There are ethical lines here, and pretending otherwise would be dishonest. Some markets should never exist. Certain incentives remain ugly even when they create liquidity. A society that turns every human consequence into entertainment deserves the criticism it receives. The mature version uses markets as instruments for foresight, accountability, and risk discovery without letting spectacle become the point.",
      "That version benefits institutions and outsiders simultaneously. Companies become less able to deceive themselves, forecasts grow measurable and consequential, research communities surface doubt earlier, citizens acquire a new sense organ for uncertainty, and outsiders with real knowledge can challenge stale authority.",
    ],
  },
  {
    label: "V",
    title: "The Standard We Keep",
    paragraphs: [
      "Untitled Trading has to win in the quiet places first. The work is not loud. Small advantages matter when they are real, repeatable, and protected from the emotional habits that destroy them.",
      "Our standard is practical before it becomes philosophical. The record beats the myth, evidence beats narrative, and tools should make our thinking harder to corrupt. When a thesis becomes beautiful and the evidence turns ugly, the evidence wins. A trade that works for the wrong reason should make pride feel suspicious, while a loss that exposes a better process has to become useful before the ego turns it into a story.",
      "The first opponent is internal. Revenge arrives dressed as conviction, overtrading borrows the feeling of work, consensus offers the narcotic of safety, and contrarianism can look like courage when it is only boredom with better posture. A market will punish all of it eventually, but we would rather do the punishment ourselves while it is still cheap.",
      "We want a company that feels like a quiet room full of people trying to hear a signal before the rest of the world has language for it. The work should be obsessive without becoming loud. Care has to extend into the unglamorous parts, because that is where a systemic culture proves itself.",
      "Fate is a word for surrender when uncertainty feels too large. We do not use it that way. The future remains partly unknowable, and pretending otherwise is how traders die. But uncertainty is not permission to drift. The work is to stay alert, stay measured, and update before pride turns a position into an identity.",
    ],
  },
];

const Manifesto = () => {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: manifestoCriticalCss }} />
      <Navbar />
      <main className="manifesto-page">
        <section className="manifesto-shell">
          <header className="manifesto-hero">
            <div>
              <p className="manifesto-kicker">
                Manifesto
              </p>
              <h1 className="manifesto-title">
                The Bid Against Fate
              </h1>
            </div>

            <div className="manifesto-hero-copy">
              <blockquote className="manifesto-quote">
                We build for markets where uncertainty has a price.
              </blockquote>
            </div>
          </header>

          <article className="manifesto-article">
            <section className="manifesto-opening">
              <div className="manifesto-opening-spacer" />
              <div className="manifesto-opening-body">
                {manifestoOpening.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>

            {manifestoSections.map((section) => (
              <section
                key={section.label}
                className="manifesto-section"
              >
                <div className="manifesto-section-meta">
                  <p className="manifesto-section-label">
                    {section.label}
                  </p>
                  <h2 className="manifesto-section-title">
                    {section.title}
                  </h2>
                </div>
                <div className="manifesto-section-body">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </section>
            ))}
          </article>

          <section className="manifesto-final">
            <div className="manifesto-final-spacer" />
            <div className="manifesto-final-inner">
              <p className="manifesto-final-line">
                We bid against fate.
              </p>
              <figure className="manifesto-final-board">
                <div className="manifesto-final-image-frame">
                  <Image
                    src={gameTheoryImage}
                    alt="Black and white chessboard with pawns facing larger pieces"
                    className="manifesto-final-image"
                    fill
                    sizes="(min-width: 1024px) 760px, calc(100vw - 3rem)"
                    priority={false}
                  />
                </div>
                <figcaption className="manifesto-final-caption">
                  Out of book.
                </figcaption>
              </figure>
              <p className="manifesto-byline">
                — Giordan Masen on behalf of Untitled Trading
              </p>
              <Link
                href="mailto:contact@untitledtrading.com"
                className="manifesto-contact"
              >
                contact@untitledtrading.com
              </Link>
            </div>
          </section>
        </section>
      </main>
    </>
  );
};

export default Manifesto;

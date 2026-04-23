import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getHeroImages, getPageHeroImage } from './publicAssetImages';

const SLIDE_MS = 7000;

export default function HomePage() {
  const heroImages = getHeroImages();
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    if (heroImages.length <= 1) return undefined;
    const id = window.setInterval(() => {
      setSlide((s) => (s + 1) % heroImages.length);
    }, SLIDE_MS);
    return () => window.clearInterval(id);
  }, [heroImages.length]);

  const imgB = getPageHeroImage('homeSplitA');
  const imgC = getPageHeroImage('homeSplitB');

  return (
    <>
      <section className="public-home-hero">
        <div className="public-home-hero-bg" aria-hidden>
          {heroImages.map((url, i) => (
            <div
              key={`slide-${i}`}
              className={`public-home-hero-slide${i === slide ? ' public-home-hero-slide--active' : ''}`}
              style={{ backgroundImage: `url(${url})` }}
            />
          ))}
        </div>
        <div className="public-home-hero-scrim" />
        <div className="public-home-hero-grid" aria-hidden>
          <span className="public-home-hero-line public-home-hero-line--1" />
          <span className="public-home-hero-line public-home-hero-line--2" />
        </div>
        <div className="public-home-hero-inner public-animate-in">
          <div className="public-home-hero-badge">
            <span className="public-home-hero-dot" />
            Smart Campus Platform
          </div>
          <h1 className="public-home-hero-title">
            Run your campus in{' '}
            <span className="public-hero-accent public-home-hero-gradient-text">one brilliant flow</span>
          </h1>
          <p className="public-home-hero-lead">
            SmartUni connects bookings, facilities, and maintenance — so students focus on learning, staff on teaching, and your
            campus teams on outcomes instead of paperwork.
          </p>
          <div className="public-home-hero-actions">
            <Link to="/services" className="public-btn public-btn--primary public-btn--lg">
              See what&apos;s included
            </Link>
            <Link to="/login" className="public-btn public-btn--glass public-btn--lg">
              Access your dashboard
            </Link>
          </div>
          <div className="public-home-hero-dots" role="tablist" aria-label="Hero backgrounds">
            {heroImages.map((_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === slide}
                className={`public-home-hero-dotbtn${i === slide ? ' public-home-hero-dotbtn--active' : ''}`}
                onClick={() => setSlide(i)}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="public-home-trust public-animate-in public-animate-delay-1">
        <div className="public-section-inner public-home-trust-inner">
          <p className="public-home-trust-label">Designed for universities that move fast</p>
          <div className="public-home-trust-row">
            {['Facilities', 'Student life', 'IT & ops', 'Academic affairs'].map((label) => (
              <div key={label} className="public-home-trust-pill">
                {label}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="public-section public-home-stats">
        <div className="public-section-inner">
          <header className="public-home-section-head">
            <span className="public-home-eyebrow">Impact</span>
            <h2 className="public-section-title">Built to scale with your institution</h2>
            <p className="public-section-lead public-home-narrow">
              From single faculties to entire campuses — one consistent experience for requesters, approvers, and technicians.
            </p>
          </header>
          <div className="public-home-stats-grid">
            {[
              { n: '24/7', t: 'Visibility', d: 'Track requests and tickets whenever you need them.' },
              { n: 'One', t: 'Dashboard', d: 'Bookings, resources, and incidents in a single sign-on flow.' },
              { n: '360°', t: 'Campus view', d: 'Rooms, labs, halls, and equipment with status-aware discovery.' },
              { n: 'Fast', t: 'Resolution paths', d: 'Priorities and ownership so nothing gets lost in email.' },
            ].map((x) => (
              <article key={x.t} className="public-home-stat-card">
                <span className="public-home-stat-num">{x.n}</span>
                <h3 className="public-home-stat-title">{x.t}</h3>
                <p className="public-home-stat-desc">{x.d}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="public-section public-home-bento-wrap">
        <div className="public-section-inner">
          <header className="public-home-section-head">
            <span className="public-home-eyebrow">Platform</span>
            <h2 className="public-section-title">Everything clicks together</h2>
          </header>
          <div className="public-home-bento">
            <article className="public-home-bento-card public-home-bento-card--wide">
              <div className="public-home-bento-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="28" height="28" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3>Frictionless booking</h3>
              <p>
                Choose a resource, pick a slot inside campus hours, add purpose and attendees — approvals stay visible from pending
                to confirmed.
              </p>
            </article>
            <article className="public-home-bento-card">
              <div className="public-home-bento-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="28" height="28" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3>Live clarity</h3>
              <p>Dashboards and filters tailored for everyday campus roles.</p>
            </article>
            <article className="public-home-bento-card public-home-bento-card--accent">
              <div className="public-home-bento-icon public-home-bento-icon--light">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="28" height="28" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3>Rapid response</h3>
              <p>Maintenance tickets with priorities, comments, and SLA-minded timelines.</p>
            </article>
            <article className="public-home-bento-card">
              <div className="public-home-bento-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="28" height="28" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3>Role-aware access</h3>
              <p>Students and admins each see what matters — nothing more.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="public-home-split">
        <div className="public-home-split-visual public-animate-in">
          <div className="public-home-split-photo" style={{ '--split-bg': `url(${imgB})` }} />
          <div className="public-home-split-float">
            <span className="public-home-split-float-label">Signal over noise</span>
            <strong>Unified alerts</strong>
            <span className="public-home-split-float-sub">Fewer inbox threads — one trail per booking or ticket.</span>
          </div>
        </div>
        <div className="public-home-split-copy">
          <span className="public-home-eyebrow">Why teams switch</span>
          <h2 className="public-home-split-title">Less chasing. More teaching and fixing.</h2>
          <p className="public-home-split-text">
            SmartUni replaces scattered spreadsheets and ad-hoc messages with structured workflows: every reservation and every
            ticket has a clear owner, status, and history — so campus operations stay accountable without slowing anyone down.
          </p>
          <ul className="public-home-split-list">
            <li>Approval-aware bookings with campus-wide resource discovery</li>
            <li>Incident and maintenance flows that technicians can trust</li>
            <li>Notifications that respect your attention — not another noisy feed</li>
          </ul>
          <Link to="/about" className="public-text-link public-home-split-link">
            Read our story →
          </Link>
        </div>
      </section>

      <section className="public-section public-home-steps">
        <div className="public-section-inner">
          <header className="public-home-section-head">
            <span className="public-home-eyebrow">How it works</span>
            <h2 className="public-section-title">Three steps. Zero drama.</h2>
          </header>
          <ol className="public-home-steps-list">
            <li className="public-home-step">
              <span className="public-home-step-num">01</span>
              <div>
                <h3>Sign in securely</h3>
                <p>Use your institutional access — land on a dashboard tuned to your role.</p>
              </div>
            </li>
            <li className="public-home-step">
              <span className="public-home-step-num">02</span>
              <div>
                <h3>Book or report in seconds</h3>
                <p>Pick a facility window or raise a ticket with context and attachments.</p>
              </div>
            </li>
            <li className="public-home-step">
              <span className="public-home-step-num">03</span>
              <div>
                <h3>Track to done</h3>
                <p>Follow status changes and messages until you&apos;re green across the board.</p>
              </div>
            </li>
          </ol>
        </div>
      </section>

      <section className="public-home-band" style={{ '--band-bg': `url(${imgC})` }}>
        <div className="public-home-band-scrim" />
        <div className="public-home-band-inner">
          <blockquote className="public-home-quote">
            “We finally have one place to see what&apos;s booked, what&apos;s broken, and what&apos;s next — without digging through
            threads.”
          </blockquote>
          <p className="public-home-quote-meta">Campus operations · SmartUni pilot feedback</p>
        </div>
      </section>

      <section className="public-section public-home-testimonials">
        <div className="public-section-inner">
          <header className="public-home-section-head">
            <span className="public-home-eyebrow">Voices</span>
            <h2 className="public-section-title">Loved by busy campus teams</h2>
          </header>
          <div className="public-home-quote-grid">
            <figure className="public-home-tcard">
              <p>
                “Students book labs without flooding our inbox. Approvals are visible — we reclaim hours every week.”
              </p>
              <figcaption>Faculty coordinator</figcaption>
            </figure>
            <figure className="public-home-tcard public-home-tcard--alt">
              <p>“Tickets don’t vanish. Priorities and updates are right where our technicians expect them.”</p>
              <figcaption>Facilities lead</figcaption>
            </figure>
          </div>
        </div>
      </section>

      <section className="public-section public-home-faq">
        <div className="public-section-inner public-home-faq-inner">
          <header className="public-home-section-head">
            <span className="public-home-eyebrow">FAQ</span>
            <h2 className="public-section-title">Quick answers</h2>
          </header>
          <div className="public-home-faq-grid">
            <details className="public-home-faq-item" open>
              <summary>Who is SmartUni for?</summary>
              <p>Students and staff who book spaces or report issues — plus technicians and admins who approve and resolve work.</p>
            </details>
            <details className="public-home-faq-item">
              <summary>Do I need a separate app?</summary>
              <p>No — SmartUni runs in your browser. Sign in once and use your dashboard on desktop or mobile.</p>
            </details>
            <details className="public-home-faq-item">
              <summary>Can we start with one department?</summary>
              <p>Yes. Roll out gradually while keeping one consistent platform for everyone.</p>
            </details>
            <details className="public-home-faq-item">
              <summary>Where do I get help?</summary>
              <p>
                Visit{' '}
                <Link to="/contact" className="public-text-link">
                  Contact us
                </Link>{' '}
                for campus desk details — we&apos;re here for rollout and everyday questions.
              </p>
            </details>
          </div>
        </div>
      </section>

      <section className="public-cta public-home-final-cta">
        <div className="public-cta-inner">
          <h2>Bring your campus together</h2>
          <p>Explore services, meet the platform in your dashboard, or talk to us about rollout.</p>
          <div className="public-cta-actions">
            <Link to="/login" className="public-btn public-btn--primary public-btn--lg">
              Sign in
            </Link>
            <Link to="/contact" className="public-btn public-btn--ghost-light public-btn--lg">
              Contact campus desk
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

import React from 'react';
import { Link } from 'react-router-dom';
import { getPageHeroImage } from './publicAssetImages';

const channels = [
  {
    title: 'General support',
    detail: 'support@smartuni.lk',
    hint: 'Accounts, access, and product questions',
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="26" height="26" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    title: 'Phone',
    detail: '+94 11 555 0142',
    hint: 'Weekdays · campus IT front desk',
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="26" height="26" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    ),
  },
];

export default function ContactPage() {
  const heroBg = getPageHeroImage('contact');

  return (
    <>
      <section className="public-page-hero public-page-hero--tall" style={{ '--public-hero-bg': `url(${heroBg})` }}>
        <div className="public-hero-orbs public-hero-orbs--subtle" aria-hidden>
          <span className="public-orb public-orb--a" />
          <span className="public-orb public-orb--c" />
        </div>
        <div className="public-page-hero-inner public-animate-in">
          <p className="public-about-hero-kicker">Contact</p>
          <h1 className="public-page-title">Let&apos;s keep your campus moving</h1>
          <p className="public-page-subtitle public-about-hero-lead">
            Reach us by email or phone — no forms. We&apos;re here for rollout planning and day-to-day questions.
          </p>
        </div>
      </section>

      <section className="public-section public-contact-section">
        <div className="public-section-inner">
          <header className="public-home-section-head">
            <span className="public-home-eyebrow">Reach us</span>
            <h2 className="public-section-title">Choose a channel</h2>
            <p className="public-section-lead public-home-narrow">
              Contact channels for reference — reach us using the email or phone below.
            </p>
          </header>

          <div className="public-contact-channels public-contact-channels--narrow" role="list">
            {channels.map((c) => (
              <div key={c.title} className="public-contact-channel public-contact-channel--display" role="listitem">
                <div className="public-contact-channel-icon">{c.icon}</div>
                <div className="public-contact-channel-text">
                  <span className="public-contact-channel-title">{c.title}</span>
                  <span className="public-contact-channel-detail">{c.detail}</span>
                  <span className="public-contact-channel-hint">{c.hint}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="public-section public-section--muted">
        <div className="public-section-inner public-contact-hours-only">
          <div className="public-contact-hours-card">
            <h2 className="public-contact-card-heading">Office hours</h2>
            <ul className="public-contact-hours-list">
              <li>
                <span>Monday – Friday</span>
                <strong>8:00 – 17:00</strong>
              </li>
              <li>
                <span>Saturday</span>
                <strong>9:00 – 13:00 · by appointment</strong>
              </li>
              <li>
                <span>Sunday &amp; holidays</span>
                <strong>Closed — email for async help</strong>
              </li>
            </ul>
            <p className="public-contact-hours-note">
              Emergency facilities issues should follow your campus escalation line — we can align SmartUni alerts with that process
              during setup.
            </p>
          </div>
        </div>
      </section>

      <section className="public-cta public-home-final-cta">
        <div className="public-cta-inner">
          <h2>Prefer to explore first?</h2>
          <p>Browse services and sign in when you&apos;re ready — we&apos;ll drop you into the right dashboard.</p>
          <div className="public-cta-actions">
            <Link to="/services" className="public-btn public-btn--primary public-btn--lg">
              View services
            </Link>
            <Link to="/login" className="public-btn public-btn--ghost-light public-btn--lg">
              Sign in
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

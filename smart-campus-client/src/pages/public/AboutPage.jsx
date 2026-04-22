import React from 'react';
import { Link } from 'react-router-dom';
import { getPageHeroImage } from './publicAssetImages';

export default function AboutPage() {
  const banner = getPageHeroImage('about');
  const sideImg = getPageHeroImage('aboutSide');

  return (
    <>
      <section className="public-page-hero public-page-hero--tall" style={{ '--public-hero-bg': `url(${banner})` }}>
        <div className="public-hero-orbs public-hero-orbs--subtle" aria-hidden>
          <span className="public-orb public-orb--a" />
          <span className="public-orb public-orb--b" />
          <span className="public-orb public-orb--c" />
        </div>
        <div className="public-page-hero-inner public-animate-in">
          <p className="public-about-hero-kicker">About SmartUni</p>
          <h1 className="public-page-title">We believe campus life should feel effortless behind the scenes</h1>
          <p className="public-page-subtitle public-about-hero-lead">
            SmartUni exists to erase friction between people and places: booking a room, fixing a light, or knowing what&apos;s
            happening next — without another spreadsheet or mystery email thread.
          </p>
        </div>
      </section>

      <section className="public-section public-about-intro">
        <div className="public-section-inner public-about-intro-grid">
          <div className="public-about-intro-copy">
            <span className="public-home-eyebrow">Our story</span>
            <h2 className="public-section-title">From fragmented tools to one campus rhythm</h2>
            <p className="public-about-text">
              Universities juggle dozens of systems. SmartUni focuses on the daily heartbeat of campus life — where people meet,
              what spaces they need, and how quickly issues get solved. We pair clear workflows with a calm, modern interface so
              adoption feels natural for students and staff alike.
            </p>
            <p className="public-about-text">
              Whether you&apos;re coordinating lab sessions, approving room requests, or triaging maintenance, SmartUni keeps the
              narrative in one place — transparent, searchable, and accountable.
            </p>
          </div>
          <div className="public-about-intro-visual">
            <div className="public-about-photo" style={{ '--about-img': `url(${sideImg})` }} />
            <div className="public-about-float-card">
              <span className="public-about-float-label">Guiding principle</span>
              <strong>Operations should be invisible when they work.</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="public-about-pillars">
        <div className="public-section-inner">
          <header className="public-home-section-head">
            <span className="public-home-eyebrow">What drives us</span>
            <h2 className="public-section-title">Principles we design around</h2>
          </header>
          <div className="public-about-pillar-grid">
            <article className="public-about-pillar">
              <span className="public-about-pillar-num">01</span>
              <h3>Clarity first</h3>
              <p>Everyone sees status, ownership, and next steps — no cryptic queues or duplicate requests.</p>
            </article>
            <article className="public-about-pillar">
              <span className="public-about-pillar-num">02</span>
              <h3>Respect for time</h3>
              <p>Fast paths for common actions; depth when you need audit trails and detail.</p>
            </article>
            <article className="public-about-pillar">
              <span className="public-about-pillar-num">03</span>
              <h3>Trust by design</h3>
              <p>Role-aware access and thoughtful notifications — signal without surveillance vibes.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="public-section public-about-mission">
        <div className="public-section-inner public-about-mission-grid">
          <article className="public-about-mission-card">
            <h2>Mission</h2>
            <p>
              Empower universities to coordinate spaces and maintenance with clarity — so communities thrive on campus, not in
              inboxes.
            </p>
          </article>
          <article className="public-about-mission-card public-about-mission-card--inverse">
            <h2>Vision</h2>
            <p>
              A default expectation that every campus interaction — booking, reporting, resolving — is traceable, fair, and fast.
            </p>
          </article>
        </div>
      </section>

      <section className="public-section public-about-cta">
        <div className="public-section-inner public-about-cta-inner">
          <h2 className="public-section-title">See it in action</h2>
          <p className="public-section-lead public-home-narrow">
            Browse services and sign in to explore the dashboard your teams will use every day.
          </p>
          <div className="public-about-cta-actions">
            <Link to="/services" className="public-btn public-btn--primary public-btn--lg">
              View services
            </Link>
            <Link to="/contact" className="public-btn public-btn--ghost public-btn--lg">
              Talk to us
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

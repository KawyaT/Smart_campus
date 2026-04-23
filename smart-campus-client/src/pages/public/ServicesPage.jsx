import React from 'react';
import { Link } from 'react-router-dom';
import { MARKETING_BACKGROUNDS, getPageHeroImage } from './publicAssetImages';

const services = [
  {
    title: 'Book a resource',
    tag: 'Facilities',
    description:
      'Browse campus facilities and request labs, lecture halls, meeting rooms, or equipment. Approval rules stay visible from pending to confirmed.',
    highlights: ['Capacity-aware requests', 'Campus booking windows', 'Clear pending / approved states'],
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="32" height="32" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    redirect: '/user-dashboard/book-resource',
  },
  {
    title: 'My bookings',
    tag: 'Schedule',
    description:
      'Your reservations in one timeline — upcoming sessions, history, and status at a glance. Adjust or cancel where policy allows.',
    highlights: ['Filter by status', 'Upcoming-first layout', 'Synced with resource rules'],
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="32" height="32" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    redirect: '/user-dashboard/my-bookings',
  },
  {
    title: 'Report an issue',
    tag: 'Maintenance',
    description:
      'Structured tickets for maintenance and incidents — priorities, descriptions, and progress through resolution with less back-and-forth.',
    highlights: ['Priority levels', 'Comments & updates', 'Great for facilities & IT handoffs'],
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="32" height="32" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3h2a1 1 0 010 2H3v3a2 2 0 002 2h2a1 1 0 012 0h2a1 1 0 012 0h2a1 1 0 012 0h2a2 2 0 002-2v-3h-2a1 1 0 010-2h2V7a2 2 0 00-2-2H5z" />
      </svg>
    ),
    redirect: '/user-dashboard/report-issue',
  },
  {
    title: 'Student dashboard',
    tag: 'Home base',
    description:
      'After sign-in, land on a hub built for your role — quick actions, alerts, and navigation to every SmartUni tool without hunting.',
    highlights: ['Role-aware entry', 'Notifications & metrics', 'One place to resume work'],
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="32" height="32" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
    redirect: '/user-dashboard',
  },
];

export default function ServicesPage() {
  const heroBg = getPageHeroImage('services');

  return (
    <>
      <section className="public-page-hero public-page-hero--tall" style={{ '--public-hero-bg': `url(${heroBg})` }}>
        <div className="public-hero-orbs public-hero-orbs--subtle" aria-hidden>
          <span className="public-orb public-orb--b" />
          <span className="public-orb public-orb--c" />
        </div>
        <div className="public-page-hero-inner public-animate-in">
          <p className="public-about-hero-kicker">Services</p>
          <h1 className="public-page-title">Everything you need after sign-in</h1>
          <p className="public-page-subtitle public-about-hero-lead">
            Pick where you want to go — we&apos;ll send you to login, then straight into the right dashboard experience. Built for
            everyday campus workflows, not demos.
          </p>
        </div>
      </section>

      <section className="public-section public-services-intro">
        <div className="public-section-inner">
          <header className="public-home-section-head">
            <span className="public-home-eyebrow">Capability map</span>
            <h2 className="public-section-title">Four doors. One platform.</h2>
            <p className="public-section-lead public-home-narrow">
              Each tile opens the module that teams use most — from grabbing a slot in a busy lab to closing the loop on a ticket.
            </p>
          </header>
        </div>
      </section>

      <section className="public-section public-section--flush">
        <div className="public-section-inner">
          <div className="public-service-showcase">
            {services.map((s, index) => {
              const thumb = MARKETING_BACKGROUNDS[(index + 3) % MARKETING_BACKGROUNDS.length];
              return (
                <article key={s.title} className="public-service-showcase-card">
                  <div className="public-service-showcase-media" style={{ '--svc-bg': `url(${thumb})` }} />
                  <div className="public-service-showcase-body">
                    <div className="public-service-showcase-top">
                      <span className="public-service-tag">{s.tag}</span>
                      <div className="public-service-showcase-icon">{s.icon}</div>
                    </div>
                    <h2 className="public-service-showcase-title">{s.title}</h2>
                    <p className="public-service-showcase-desc">{s.description}</p>
                    <ul className="public-service-highlights">
                      {s.highlights.map((h) => (
                        <li key={h}>{h}</li>
                      ))}
                    </ul>
                    <Link
                      to={`/login?redirect=${encodeURIComponent(s.redirect)}`}
                      className="public-btn public-btn--primary public-service-showcase-cta"
                    >
                      Continue to sign in
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="public-cta public-home-final-cta">
        <div className="public-cta-inner">
          <h2>Questions before you roll out?</h2>
          <p>Our campus desk can walk through roles, timelines, and the best starting module for your faculty.</p>
          <div className="public-cta-actions">
            <Link to="/contact" className="public-btn public-btn--ghost-light public-btn--lg">
              Contact us
            </Link>
            <Link to="/about" className="public-btn public-btn--primary public-btn--lg">
              About SmartUni
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

import type { RefObject } from 'react'
import { gsap, ScrollTrigger, useGSAP } from '../animation/gsap'
import { DUR, EASE, MQ, STAGGER } from '../animation/config'

// The header joins the entrance only on the first homepage visit of a session;
// returning home replays just the hero, so navigation never feels like a reload.
let introPlayed = false

const revealPending = () => document.documentElement.classList.remove('hero-pending')

/**
 * All homepage choreography in one scoped context. useGSAP reverts every tween
 * and ScrollTrigger on unmount, and matchMedia reverts per-breakpoint work on
 * resize, so route changes and remounts cannot leave duplicate triggers behind.
 */
export function useHomeMotion(root: RefObject<HTMLElement | null>) {
  useGSAP(() => {
    const mm = gsap.matchMedia()

    mm.add({ motion: MQ.motion, desktop: MQ.desktop }, context => {
      const { motion, desktop } = context.conditions as { motion: boolean; desktop: boolean }
      if (!motion) {
        revealPending()
        return
      }

      // ---- Entrance ----------------------------------------------------------
      const header = document.querySelector('.site-header')
      const tl = gsap.timeline({ defaults: { ease: EASE.out } })
      if (!introPlayed && header) tl.from(header, { y: -24, opacity: 0, duration: DUR.fast })
      tl.from('[data-hero="eyebrow"]', { y: 14, opacity: 0, duration: DUR.fast }, introPlayed ? 0 : '-=0.15')
        .from('[data-hero="line"]', { yPercent: 108, duration: DUR.slow, stagger: STAGGER.base, ease: EASE.expo }, '-=0.2')
        .from('[data-hero="arch"]', { scaleY: 0.2, opacity: 0, transformOrigin: '50% 100%', duration: DUR.slow, ease: EASE.expo }, '<')
        .from('[data-hero="sun"]', { scale: 0.4, opacity: 0, duration: DUR.slow, ease: 'back.out(1.6)' }, '<0.1')
        .from('[data-hero="bag"]', { y: 150, rotation: -7, opacity: 0, duration: DUR.hero }, '<0.05')
      // Each produce layer arrives on its own path rather than one shared fade-up.
      const paths = [
        { x: -140, y: -90, rotation: -50 },
        { x: 160, y: -60, rotation: 35 },
        { x: 90, y: 140, rotation: 25 },
        { x: -60, y: 160, rotation: -20 },
      ]
      gsap.utils.toArray<HTMLElement>('[data-hero="item"]').forEach((item, index) => {
        tl.from(item, { ...paths[index % paths.length], opacity: 0, duration: DUR.slow, ease: 'back.out(1.3)' }, `<${index ? 0.07 : 0.25}`)
      })
      tl.from('[data-hero="lede"]', { y: 18, opacity: 0, duration: DUR.base }, '-=0.75')
        .from('[data-hero="cta"] > *', { y: 14, opacity: 0, duration: DUR.fast, stagger: STAGGER.tight }, '<0.05')
        .from('[data-hero="meta"]', { opacity: 0, duration: DUR.base }, '<0.1')
      // from() tweens have already rendered their start state, so it is now safe to drop the CSS guard.
      revealPending()
      introPlayed = true

      // ---- Hero leaves: produce separates ---------------------------------------
      if (desktop) {
        const drift = [
          { x: -90, y: -120, rotation: -25 },
          { x: 110, y: -80, rotation: 20 },
          { x: 80, y: 90, rotation: 15 },
          { x: -70, y: 110, rotation: -12 },
        ]
        const leave = gsap.timeline({ scrollTrigger: { trigger: '[data-anim="hero"]', start: 'top top', end: 'bottom top', scrub: 0.6 } })
        gsap.utils.toArray<HTMLElement>('[data-layer="item"]').forEach((layer, index) => {
          leave.to(layer, { ...drift[index % drift.length], ease: EASE.scrub }, 0)
        })
        leave.to('[data-layer="bag"]', { y: -50, ease: EASE.scrub }, 0)
      }

      // ---- Departments: editorial reveal ----------------------------------------
      const depts = gsap.utils.toArray<HTMLElement>('[data-anim="dept"]')
      gsap.set(depts, { y: desktop ? 60 : 28, opacity: 0 })
      gsap.set('[data-anim="dept"] img', { scale: 1.14 })
      ScrollTrigger.batch(depts, {
        start: 'top 85%',
        once: true,
        onEnter: batch => {
          gsap.to(batch, { y: 0, opacity: 1, duration: DUR.slow, stagger: STAGGER.loose, ease: EASE.out })
          gsap.to(batch.map(el => el.querySelector('img')), { scale: 1, duration: 1.2, stagger: STAGGER.loose, ease: EASE.out })
        },
      })

      // ---- Featured cards: one batched entrance, then they stay put while used ---
      const cards = gsap.utils.toArray<HTMLElement>('[data-anim="reveal-grid"] [data-anim="product-card"]')
      gsap.set(cards, { y: 24, opacity: 0 })
      ScrollTrigger.batch(cards, {
        start: 'top 90%',
        once: true,
        onEnter: batch => gsap.to(batch, { y: 0, opacity: 1, duration: DUR.base, stagger: STAGGER.tight, ease: EASE.out, clearProps: 'transform' }),
      })

      // ---- Bold typographic transition ------------------------------------------
      if (desktop) {
        gsap.utils.toArray<HTMLElement>('[data-anim="kinetic-row"]').forEach((row, index) => {
          gsap.fromTo(row, { xPercent: index % 2 ? -6 : 6 }, {
            xPercent: index % 2 ? 4 : -4,
            ease: EASE.scrub,
            scrollTrigger: { trigger: '[data-anim="kinetic"]', start: 'top bottom', end: 'bottom top', scrub: 0.5 },
          })
        })
      } else {
        gsap.from('[data-anim="kinetic-row"]', {
          y: 30, opacity: 0, duration: DUR.slow, stagger: STAGGER.base,
          scrollTrigger: { trigger: '[data-anim="kinetic"]', start: 'top 80%', once: true },
        })
      }

      // ---- Groceries travel into the delivery story -----------------------------
      if (desktop) {
        const story = gsap.timeline({ scrollTrigger: { trigger: '[data-anim="story"]', start: 'top 80%', end: 'center 45%', scrub: 0.6 } })
        story
          .fromTo('[data-anim="story-item"]', { x: 0, y: 0, rotation: 0 }, { x: (i: number) => 260 - i * 30, y: (i: number) => 40 + i * 30, rotation: (i: number) => (i % 2 ? 18 : -14), scale: 0.55, opacity: 0, ease: EASE.scrub, stagger: 0.05 }, 0)
          .fromTo('[data-anim="story-image"]', { scale: 0.86, rotation: -2 }, { scale: 1, rotation: 0, ease: EASE.scrub }, 0)
          .fromTo('[data-anim="story-copy"]', { y: 40, opacity: 0 }, { y: 0, opacity: 1, ease: EASE.scrub }, 0.3)
      } else {
        gsap.from('[data-anim="story-image"], [data-anim="story-copy"]', {
          y: 30, opacity: 0, duration: DUR.slow, stagger: STAGGER.base,
          scrollTrigger: { trigger: '[data-anim="story"]', start: 'top 80%', once: true },
        })
      }

      // Webfonts change line heights; re-measure trigger positions once they settle.
      let alive = true
      document.fonts.ready.then(() => { if (alive) ScrollTrigger.refresh() })
      return () => { alive = false }
    })

    // Any failure above must not leave the hero hidden.
    return () => revealPending()
  }, { scope: root, dependencies: [] })
}

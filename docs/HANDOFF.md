# VOLTA Store — Handoff

```yaml
active_work:
  - id: STORE-INIT-003
    title: Landing Conversion & Acquisition Measurement
    state: merged_production_deploy_blocked
    main_sha: cb1edd880fff3651674de0a27ff75c9d6413d4a7
    blocker: Vercel build-rate-limit rejected the post-merge production build
    latest_confirmed_production_sha: 0cc1e9053f20c850611e8b5481a2949259a27c0a
    next:
      - trigger/allow exactly one production build once Vercel accepts builds again
      - verify deployment READY and domain aliases on a SHA containing STORE-INIT-003
      - visually review landing desktop/mobile, especially NOVA media, pricing, real-store proof and sticky CTA
      - confirm at least one controlled row reaches saas_funnel_events
      - inspect production runtime errors
      - archive the initiative to docs/initiatives/completed and clear this handoff
```

Do not redevelop or redesign STORE-INIT-003. The runtime change is already merged and CI-green; the remaining work is release verification.

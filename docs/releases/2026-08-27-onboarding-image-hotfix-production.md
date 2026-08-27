# VOLTA Store — onboarding + image hotfix production release

**Date:** 2026-08-27  
**Branch:** `main`  
**Release:** onboarding clarity + mobile image robustness

Production release marker for the activation/onboarding and image-pipeline fixes already integrated and quality-verified on `main`.

Runtime scope in this release:

- robust cover/product image handling across Safari/iPhone fallbacks;
- explicit onboarding progression: uploads no longer advance the user automatically;
- clearer distinction between store cover and product photo;
- guided two-stage first-product setup (data, then photo);
- improved store-creation transition copy;
- first-admin-entry tutorial, mobile-first and skippable;
- onboarding/admin build and tests passing in GitHub Actions.

This marker intentionally triggers one fresh production deployment so the verified `main` state can be promoted to `voltastore.app` after the previous Vercel deployment limit interruption.

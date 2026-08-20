# iOS checkout text control QA

Regression target: iOS Safari / in-app browsers where a one-line `<input>` is repainted with a white contact-autofill surface after blur in a dark storefront.

## Expected

- Customer name remains on the store surface both focused and blurred.
- Typed text and placeholder preserve readable contrast.
- No contact-autofill white repaint is introduced by the browser.
- Return/Enter does not create a second line in one-line checkout fields.
- Long notes remain multiline.
- Short custom checkout fields use the same one-line browser-neutral control.
- Light storefronts remain readable.

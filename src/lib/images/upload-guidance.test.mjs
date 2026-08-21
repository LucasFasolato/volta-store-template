import assert from 'node:assert/strict'
import test from 'node:test'
import { IMAGE_WIDTH_GUIDANCE, buildImageQualityHint } from './upload-guidance.ts'

test('product and hero resolution are recommendations, not blockers', () => {
  assert.equal(IMAGE_WIDTH_GUIDANCE.product.minimum, null)
  assert.equal(IMAGE_WIDTH_GUIDANCE.hero.minimum, null)
  assert.equal(IMAGE_WIDTH_GUIDANCE.product.recommended, 800)
  assert.equal(IMAGE_WIDTH_GUIDANCE.hero.recommended, 1200)
})

test('logo keeps a real minimum because tiny logos are not usable', () => {
  assert.equal(IMAGE_WIDTH_GUIDANCE.logo.minimum, 240)
})

test('small product images get a non-blocking quality hint', () => {
  assert.match(buildImageQualityHint('product', 520) ?? '', /se puede usar/i)
  assert.equal(buildImageQualityHint('product', 800), null)
})

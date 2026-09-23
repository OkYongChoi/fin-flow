import { expect, test } from '@playwright/test'

test('a failed page download shows a localized recovery action and reloads the same route', async ({ page }) => {
  await page.route(/\/(?:src\/components\/InfoPage\.tsx|assets\/InfoPage-[^/?]+\.js)(?:\?|$)/, route => route.abort('failed'), { times: 1 })
  await page.goto('/ko/learn?ref=loading-check')
  await expect(page.getByRole('alert')).toContainText('화면을 불러오지 못했습니다')
  await page.getByRole('button', { name: '다시 불러오기' }).click()
  await expect(page).toHaveURL('/ko/learn?ref=loading-check')
  await expect(page.locator('#main-content')).toBeVisible()
  await expect(page.getByRole('alert')).toHaveCount(0)
})


test('route loading boundaries preserve unsaved drafts across language and pricing changes', async ({ page }) => {
  await page.addInitScript(() => {
    const original = Storage.prototype.setItem
    Storage.prototype.setItem = function (key, value) {
      if (key.startsWith('fin-flow:')) throw new DOMException('blocked', 'SecurityError')
      return original.call(this, key, value)
    }
  })
  await page.goto('/en/workspace')
  await expect(page.getByRole('alert')).toContainText('Browser storage is blocked')
  await page.getByLabel('Brief title').fill('Unsaved work must stay')
  await page.getByLabel('Your perspective and questions').fill('No browser backup is available')
  await page.getByRole('button', { name: '한국어로 전환' }).click()
  await expect(page.getByLabel('브리핑 제목')).toHaveValue('Unsaved work must stay')
  await expect(page.getByLabel('내 관점과 질문')).toHaveValue('No browser backup is available')
  await page.getByRole('button', { name: '요금제', exact: true }).click()
  await page.getByRole('button', { name: '작업실 열기', exact: true }).click()
  await expect(page.getByLabel('브리핑 제목')).toHaveValue('Unsaved work must stay')
  await expect(page.getByLabel('내 관점과 질문')).toHaveValue('No browser backup is available')
})

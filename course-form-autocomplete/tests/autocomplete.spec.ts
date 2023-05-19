import { expect, test } from '@playwright/test'

test('autocomplete', async ({ page }) => {
  await page.goto('/')

  await page.getByTitle('請輸入您的登入學號').fill(process.env.schoolId)

  await page.getByTitle('請輸入您的登入密碼').fill(process.env.password)

  await page.locator('#loginBtn1').click()

  await page.waitForLoadState('networkidle')

  await page.goto('https://cof.ntpu.edu.tw/pls/univer/query_all_course.judge?year1=111')

  await expect(await page.getByText('系級')).toBeVisible()
})

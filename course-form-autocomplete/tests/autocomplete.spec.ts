import { expect, test } from '@playwright/test'

const EStatus = {
  PENDING: 0,
  SUCCESS: 1,
  FAILURE: 2,
}

test('autocomplete', async ({ page, request }) => {
  await page.goto('/')

  await page.getByTitle('請輸入您的登入學號').fill(process.env.schoolId)

  await page.getByTitle('請輸入您的登入密碼').fill(process.env.password)

  await page.locator('#loginBtn1').click()

  await page.waitForLoadState('networkidle')

  await page.goto('https://cof.ntpu.edu.tw/pls/univer/query_all_course.judge?year1=111')

  await expect(await page.getByText('系級')).toBeVisible()

  await request.post(`${process.env.HOST_DOMAIN}/finish-job`, {
    data: {
      ...process.env,
    },
  })
})

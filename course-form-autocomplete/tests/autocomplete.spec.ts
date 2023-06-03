import { test } from '@playwright/test'

test('autocomplete', async ({ page, request }) => {
  await page.goto('/student_new.htm')

  page.on('dialog', dialog => dialog.accept())
  const isProd = process.env.containerId

  await page.getByTitle('請輸入您的登入學號').fill(process.env.schoolId)

  await page.getByTitle('請輸入您的登入密碼').fill(process.env.password)

  await page.locator('#loginBtn1').click()

  await page.waitForLoadState('networkidle')

  await page.goto('/pls/univer/query_all_course.judge?year1=111')

  const allLink = await page.getByRole('link')

  for (let index = 0; index < await allLink.count(); index++) {
    const element = await allLink.nth(index)
    const href = await element.getAttribute('href')

    if (!href.includes('c_id')) continue

    await page.goto(`/pls/univer/${href}`)

    await page.locator('//html/body/center/form/center[1]/table[1]/tbody/tr[4]/th[2]/input').click()

    await page.locator('//html/body/center/form/center[1]/table[2]/tbody/tr[4]/th[2]/input').click()
    await page.locator('//html/body/center/form/center[1]/table[2]/tbody/tr[5]/th[2]/input').click()
    await page.locator('//html/body/center/form/center[1]/table[2]/tbody/tr[6]/th[2]/input').click()
    await page.locator('//html/body/center/form/center[1]/table[2]/tbody/tr[7]/th[6]/input').click()

    await page.locator('//html/body/center/form/center[1]/table[2]/tbody/tr[8]/th[2]/input').click()
    await page.locator('//html/body/center/form/center[1]/table[2]/tbody/tr[9]/th[2]/input').click()
    await page.locator('//html/body/center/form/center[1]/table[2]/tbody/tr[10]/th[2]/input').click()

    await page.locator('//html/body/center/form/center[1]/table[2]/tbody/tr[11]/th[2]/input').click()
    await page.locator('//html/body/center/form/center[1]/table[2]/tbody/tr[12]/th[2]/input').click()
    await page.locator('//html/body/center/form/center[1]/table[2]/tbody/tr[13]/th[2]/input').click()
    await page.locator('//html/body/center/form/center[1]/table[2]/tbody/tr[14]/th[6]/input').click()

    await page.locator('//html/body/center/form/center[1]/table[2]/tbody/tr[15]/th[2]/input').click()
    await page.locator('//html/body/center/form/center[1]/table[2]/tbody/tr[16]/th[2]/input').click()
    await page.locator('//html/body/center/form/center[1]/table[2]/tbody/tr[17]/th[2]/input').click()

    await page.locator('//html/body/center/form/center[1]/table[2]/tbody/tr[22]/th[2]/input').click()
    await page.locator('//html/body/center/form/center[1]/table[2]/tbody/tr[23]/th[2]/input').click()
    await page.locator('//html/body/center/form/center[1]/table[2]/tbody/tr[24]/th[2]/input').click()

    await page.locator('//html/body/center/form/center[1]/table[2]/tbody/tr[26]/th[2]/input').click()
    await page.locator('//html/body/center/form/center[1]/table[2]/tbody/tr[27]/th[2]/input').click()

    await page.locator('//html/body/center/form/center[1]/table[2]/tbody/tr[28]/th[1]/div/input[1]').click()
    await page.locator('//html/body/center/form/center[1]/table[2]/tbody/tr[29]/th[1]/div/input[1]').click()
    await page.locator('//html/body/center/form/center[1]/table[2]/tbody/tr[30]/th[1]/div/input[3]').click()
    await page.locator('//html/body/center/form/center[1]/table[2]/tbody/tr[31]/th[1]/div/input[4]').click()
    await page.locator('//html/body/center/form/center[2]/table/tbody/tr[2]/td/textarea').fill('謝謝老師')

    await page.locator('//html/body/center/form/center[2]/input[5]').click()
  }

  if (isProd) {
    await request.post(`${process.env.HOST_DOMAIN}/finish-job`, {
      data: {
        ...process.env,
      },
    })
  }
})

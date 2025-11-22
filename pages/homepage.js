const { expect } = require('@playwright/test');

class HomePage {
  constructor(page) {
    this.page = page;
    this.fromField = page.locator('(//div[@role="button"])[1]');
    this.toField = page.locator('(//div[@role="button"])[3]');
    this.dateField = page.locator('(//div[@role="button"])[4]');
    this.searchButton = page.locator('//*[@id="root"]/main/div/div/search/div/div/button');
  }

//Validate the page title
 async validateTitle(expectedTitle) {
  const actualTitle = await this.page.title();
  console.log('Actual Page Title:', actualTitle);

  if (!actualTitle.includes(expectedTitle)) {
    await this.page.screenshot({ path: 'screenshots/title_check_failed.png', fullPage: true });
    throw new Error(`Page Title mismatch! Expected to include: "${expectedTitle}", Actual: "${actualTitle}"`);
  } else {
    console.log('Page title validation passed.');
  }
}

//Validate the page URL
async validateURL(expectedURL) {
  const actualURL = this.page.url();
  console.log('Actual Page URL:', actualURL);

  if (!actualURL.includes(expectedURL)) {
    await this.page.screenshot({ path: 'screenshots/url_check_failed.png', fullPage: true });
    throw new Error(`Page URL mismatch! Expected to include: "${expectedURL}", Actual: "${actualURL}"`);
  } else {
    console.log('Page URL validation passed.');
  }
}

//Enter Madurai and chennai from and to fields
  async fillFromTo(from, to) {
    if (!(await this.fromField.isEnabled()) || !(await this.toField.isEnabled())) {
      await this.page.screenshot({ path: 'screenshots/from_to_fields_failed.png', fullPage: true });
      throw new Error('From/To fields disabled');
    }

    await this.fromField.click();
    await this.page.waitForTimeout(1500);
    await this.page.keyboard.type(from);
    await this.page.waitForTimeout(1500);
    await this.page.keyboard.press('ArrowDown');
    await this.page.keyboard.press('Enter');

    await this.toField.click();
    await this.page.waitForTimeout(1500);
    await this.page.keyboard.type(to);
    await this.page.waitForTimeout(1500);
    await this.page.keyboard.press('ArrowDown');
    await this.page.keyboard.press('Enter');
  }


//Select the date Dec24th from date picker
  async selectDate(month, year, day) {
    if (!(await this.dateField.isVisible())) {
      await this.page.screenshot({ path: 'screenshots/date_picker_failed.png', fullPage: true });
      throw new Error('Date picker not visible');
    }

    await this.dateField.click();
    await this.page.waitForTimeout(1500);

    const headerLocator = this.page.locator('//p[contains(@class, "monthYear")]');
    const nextArrow = this.page.locator('(//i[contains(@class, "icon-arrow")])[2]');

    for (let i = 0; i < 12; i++) {
      await expect(headerLocator).toBeVisible({ timeout: 5000 });
      const text = await headerLocator.textContent();

      if (text.includes(month) && text.includes(year)) {
        break;
      }

      await nextArrow.click();
      await this.page.waitForTimeout(500);
    }

    const finalText = await headerLocator.textContent();
    if (!finalText.includes(month) || !finalText.includes(year)) {
      await this.page.screenshot({ path: 'screenshots/calendar_navigation_failed.png', fullPage: true });
      throw new Error(`Failed to reach target month/year: ${month} ${year}`);
    }

    const dayLocator = this.page.locator(`//ul[contains(@class,"datesWrap")]//li//span[text()="${day}"]`);
    await expect(dayLocator).toBeVisible({ timeout: 5000 });
    await dayLocator.click();
  }

//click the search button action
  async clickSearch() {
    if (!(await this.searchButton.isEnabled())) {
      await this.page.screenshot({ path: 'screenshots/search_button_failed.png', fullPage: true });
      throw new Error('Search button disabled for clicking');
    }

    await this.searchButton.click();
    await this.page.waitForTimeout(1500);
  }
}

module.exports = { HomePage };

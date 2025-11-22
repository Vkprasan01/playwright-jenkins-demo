const { expect } = require('@playwright/test');

class BookingPage {
  constructor(page) {
    this.page = page;

    //Locators for bookingpage.

    // Filters and sorting
    this.sortIcon = page.locator("//div[text()='Price'] // i[contains(@class,'icon-sortdown')]");
    this.sortEvening = page.locator("//div[@role='checkbox'][.//div[text()='18:00-24:00 (21)']]");



    // Bus names with boarding time
    this.busNameLocator = page.locator("//div[contains(@class,'travelsName')]");
    this.boardingTimeLocator = page.locator("//p[contains(@class,'boardingTime')]");
    this.viewSeatsButtonLocator = page.locator("//button[contains(@class,'viewSeatsBtn')]");

    // Seat selection
    this.seatSelectionPage = page.locator('//span[contains(text(), "Select seats")]');
    this.seatElements = page.locator("//span[@role='button']");

    // Boarding actions
    this.selectBoardingButton = page.locator('//button[contains(text(),"Select boarding & dropping points")]');
    this.boardingDetailsText = page.locator('//span[contains(text(), "2. Board/Drop point")]');
    this.droppingNames = page.locator("//div[contains(@class,'bpdp')]//div[contains(@class,'name')]");
    this.droppingRadios = page.locator("//div[contains(@class,'bpdp')]//label[contains(@class,'customRadio')]");

    // Passenger Info locators
    this.fillPassengerButton = page.locator('//button[text()="Fill passenger details"]');
    this.passengerDetailsText = page.locator('//span[contains(text(), "3. Passenger Info")]');
    this.phoneField = page.locator('//input[@name="Phone *"]');
    this.emailField = page.getByPlaceholder('Enter email id');
    this.stateField = page.locator('//input[@name="0_201"]');
    this.stateSearch = page.getByPlaceholder('Search for state');
    this.stateRadio = page.locator("(//label[contains(@class,'customRadio')])[5]");
    this.nameField = page.getByPlaceholder('Enter your Name');
    this.ageField = page.getByPlaceholder('Enter Age');
    this.genderToggle = page.locator('//div[@role="radio" and @aria-label="Male"]');

    // Extras
    this.freeCancellationText = page.locator('//div[text()="Free Cancellation"]');
    this.dontAddFreeCancellation = page.locator('(//label[contains(@class,"customRadio")])[2]');
    this.travelInsuranceText = page.locator('//h4[text()="Travel Insurance"]');
    this.addTravelInsurance = page.locator('//label[@for="insuranceConfirmBtn"]');
    this.redbusDonationFee = page.locator('#redCare');

    // Final
    this.continueBookingBtn = page.locator('//div[contains(@class,"payNowBtn")]//button');
    this.busName = page.locator("//h2[contains(@class,'travelsName')]");
    this.routePoints = page.locator("//span[contains(@class,'bpDpName')]");
    this.passengerName = page.locator("//div[contains(@class,'name')]");
    this.fare = page.locator("//div[contains(@class,'totalPayableSection')]//div[@class='fare']");
  }

  //Apply the sorting low to high price filter and evening time bus only
  async applyFilters() {
    if (await this.sortIcon.isVisible()) await this.sortIcon.click();
    await this.page.waitForTimeout(1500);
    if (await this.sortEvening.isVisible()) await this.sortEvening.click();
    await this.page.waitForTimeout(2000);
  }

  //Select the Bus and click the view seats action
  async selectBusByNameAndTime(expectedBusName, expectedBoardingTime) {
    await expect(this.busNameLocator.first()).toBeVisible({ timeout: 10000 });

    const busNames = await this.busNameLocator.all();
    const boardingTimes = await this.boardingTimeLocator.all();
    const viewSeatsButtons = await this.viewSeatsButtonLocator.all();

    for (let i = 0; i < busNames.length; i++) {
      const busName = (await busNames[i].innerText()).trim();
      const boardingTime = (await boardingTimes[i].innerText()).trim();

      const nameMatch = busName.toLowerCase().includes(expectedBusName.toLowerCase());
      const timeMatch = boardingTime.toLowerCase().includes(expectedBoardingTime.toLowerCase());

      if (nameMatch && timeMatch) {
        console.log(`Found matching bus: ${busName} at ${boardingTime}`);
        try {
          await viewSeatsButtons[i].scrollIntoViewIfNeeded();
          await viewSeatsButtons[i].click();
          await this.page.waitForTimeout(1000);
          console.log('Clicked the matching View Seats button.');
        } catch (error) {
          console.error('Failed to click View Seats button:', error);
        }
        break; // Stop after clicking the first match
      } else {
        console.log(`Skipping bus: ${busName} (${boardingTime})`);
      }
    }
  }



  //Select the available seat from bus

  async selectAvailableSeat() {
    await expect(this.seatSelectionPage).toBeVisible();
    await expect(this.seatElements.first()).toBeVisible({ timeout: 10000 });

    const seats = await this.seatElements.all();

    for (const seat of seats) {
      const ariaLabel = await seat.getAttribute('aria-label');
      if (!ariaLabel) continue;

      const isAvailable = ariaLabel.toLowerCase().includes('seat status available');

      if (isAvailable) {
        try {
          await seat.scrollIntoViewIfNeeded();
          await seat.click();
          console.log(`Selected seat: ${ariaLabel}`);
          await this.page.waitForTimeout(1000);
          break; // stop after selecting the first available seat
        } catch (error) {
          console.error('Failed to click available seat:', error);
        }
      } else {
        console.log(`Skipping sold seat: ${ariaLabel}`);
      }
    }

    console.log('Seat selection completed.');
  }


  //Click the boariing details button
  async ClickBoardingButton() {
    await expect(this.selectBoardingButton).toBeEnabled({ timeout: 5000 });
    await this.selectBoardingButton.scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(1000);

    await this.selectBoardingButton.click();
  }

  //Validate the boardin details text in the tab
  async validateBoardingDetailsText(expectedText) {
    await expect(this.boardingDetailsText).toBeVisible({ timeout: 5000 });

    const actualText = await this.boardingDetailsText.textContent();
    if (actualText.trim() !== expectedText.trim()) {
      throw new Error(`Boarding details text mismatch. Expected: "${expectedText}", Found: "${actualText.trim()}"`);
    }
  }


  //Select the boarding and dropping stop in bus
  async selectDroppingPoint(targetStopName) {
    const names = await this.droppingNames.all();
    const radios = await this.droppingRadios.all();

    for (let i = 0; i < names.length; i++) {
      const nameText = await names[i].textContent();

      if (nameText.trim().toLowerCase() === targetStopName.trim().toLowerCase()) {
        await radios[i].scrollIntoViewIfNeeded();
        await radios[i].click();
        return;
      }
    }

    await this.page.screenshot({ path: 'screenshots/dropping_point_not_found.png', fullPage: true });
    throw new Error(`Dropping point not found: ${targetStopName}`);
  }

  //Click the fill passenger button  
  async clickFillPassengerButton() {
    await expect(this.fillPassengerButton).toBeEnabled({ timeout: 5000 });
    await this.fillPassengerButton.scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(2000); // Optional: smooth UI interaction
    await this.fillPassengerButton.click();
  }



  //Provide the passenger details in inputs field  
  async fillPassengerDetails(phone, email, state, name, age) {
    await expect(this.passengerDetailsText).toBeVisible();

    await this.phoneField.scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(300);
    await this.phoneField.fill(phone);

    await this.emailField.scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(300);
    await this.emailField.fill(email);

    await this.stateField.scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(300);
    await this.stateField.click();

    await this.stateSearch.scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(300);
    await this.stateSearch.fill(state);

    await this.stateRadio.scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(300);
    if (!await this.stateRadio.isChecked()) {
      await this.stateRadio.click();
    }

    await this.nameField.scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(300);
    await this.nameField.fill(name);

    await this.ageField.scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(300);
    await this.ageField.fill(age);

    await this.genderToggle.scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(1000);
    await this.genderToggle.click();
  }

  //Add the travel insurance and select the dont add free cancellation 
  async handleExtrafee() {
    await this.dontAddFreeCancellation.scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(1000);
    await this.dontAddFreeCancellation.click();

    await this.addTravelInsurance.scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(1000);
    await this.addTravelInsurance.click();

    await this.redbusDonationFee.scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(1000);
    await this.redbusDonationFee.click();
  }


  //Click the continue button 
  async continueBooking() {
    if (await this.continueBookingBtn.isEnabled()) {
      await this.continueBookingBtn.click();
    } else {
      await this.page.screenshot({ path: 'screenshots/continue_booking_failed.png', fullPage: true });
      throw new Error("Continue booking button disabled");
    }
  }

  //Validate the bus, stops, name, fare details before payment process  
  async validateSummary(expectedBus, expectedFrom, expectedTo, expectedName, expectedFare) {
    const bus = await this.busName.textContent();
    const points = await this.routePoints.all();
    const from = await points[0].textContent();
    const to = await points[1].textContent();
    const name = await this.passengerName.textContent();
    const fare = await this.fare.textContent();

    if (
      bus?.includes(expectedBus) &&
      from?.includes(expectedFrom) &&
      to?.includes(expectedTo) &&
      name?.includes(expectedName) &&
      fare?.includes(expectedFare)
    ) {
      console.log("Summary matches expected values");
    } else {
      console.log("Summary mismatch. Review before payment.");
      await this.page.screenshot({ path: 'screenshots/final_validation_failed.png', fullPage: true });
      throw new Error("Booking summary validation failed");
    }
  }
}

module.exports = { BookingPage };

// tests/redbusBooking.spec.js
const { test } = require('@playwright/test');
const { HomePage } = require('../pages/homepage');
const { BookingPage } = require('../pages/bookingpage');

test.setTimeout(60000);

test('Book a bus ticket from Madurai to Chennai on redBus', async ({ page }) => {
  const home = new HomePage(page);
  const booking = new BookingPage(page);
  await page.goto('https://www.redbus.in/');

  await home.validateTitle('Bus Booking Online and Train Tickets at Lowest Price - redBus');
  await home.validateURL('https://www.redbus.in/');
  await page.waitForTimeout(2000);

  await home.fillFromTo('Madurai', 'Chennai');
  await home.selectDate('December', '2025', '24');
  await home.clickSearch();

  await home.validateTitle('Madurai to Chennai Bus - Book from 361 Buses, Get Up To 500 Off - Nov, 2025');

  await booking.applyFilters();
  await booking.selectBusByNameAndTime('YBM Travels(BLM)', '22:00');
  await booking.selectAvailableSeat();
  await booking.ClickBoardingButton();
  await booking.validateBoardingDetailsText('2. Board/Drop point');
  await booking.selectDroppingPoint('Kilambakkam Omni Bus Terminus');
  await booking.clickFillPassengerButton();

  await booking.fillPassengerDetails(
    '9823099232',
    'test@gmail.com',
    'Tamil Nadu',
    'Prasannakumar',
    '24'
  );

  await booking.handleExtrafee();
  await booking.continueBooking();

  await booking.validateSummary(
    'YBM Travels(BLM)',
    'Mattuthavani',
    'Kilambakkam Bus Stand',
    'Prasannakumar',
    '₹1,385'

  );

  await page.waitForTimeout(2000);
});

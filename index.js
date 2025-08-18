// install dulu: npm install playwright
// jalankan: node instagram_signup.js

const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch({ headless: false }); // ganti true jika ingin headless
  const page = await browser.newPage();

  // 1. buka temp mail
  await page.goto("https://tempmail.edu.kg/en/");

  // tunggu sampai email muncul
  // Wait for 3 seconds before getting the email
  // Wait until the email value contains .edu.kg
  const email = await page.waitForFunction(() => {
    const emailInput = document.querySelector('#emailInput');
    return emailInput && emailInput.value && emailInput.value.includes('.edu.kg');
  }).then(() => page.$eval('#emailInput', (el) => el.value));
  console.log("Generated temp email:", email);

  // 2. buka instagram signup
  const ig = await browser.newPage();
  await ig.goto("https://www.instagram.com/accounts/emailsignup/");

  // isi form instagram (email, fullname, username, password)
  await ig.waitForSelector("input[name=emailOrPhone]");
  await ig.fill("input[name=emailOrPhone]", email);
  await ig.fill("input[name=fullName]", "Test Account");
  await ig.fill(
    "input[name=username]",
    "test" + Math.floor(Math.random() * 1000000)
  );
  await ig.fill("input[name=password]", "Password123!");

  await ig.click("button[type=submit]");

  // Handle birthday form first
  try {
    console.log('Waiting for birthday form...');
    await ig.waitForTimeout(5000); // Give the page time to load
    
    // Take a screenshot to see what we're dealing with
    await ig.screenshot({ path: 'birthday-form.png' });
    console.log('Saved screenshot of birthday form');
    
    // Simple approach - click directly on the month dropdown (August)
    console.log('Clicking on the month dropdown');
    
    // Use the exact selectors to target the month and year dropdowns and set their values
    try {
      // Target the month dropdown using the exact class from the HTML and set value
      await ig.selectOption('select._aau-._ap32[title="Month:"]', '5'); // Select May (value 5)
      console.log('Selected May in month dropdown');
      
      // Target the year dropdown and set value to 1995
      await ig.selectOption('select._aau-._ap32[title="Year:"]', '1995'); // Select 1995
      console.log('Selected 1995 in year dropdown');
    } catch (cssErr) {
      console.log('CSS selector failed, trying alternate approaches');
      
      try {
        // Try selecting by generic select elements
        const selectElements = await ig.$$('select');
        if (selectElements.length > 0) {
          // Set month value (first select)
          await ig.selectOption(selectElements[0], '5'); // Select May (value 5)
          console.log('Selected May in first select element');
          
          // Set year value (third select)
          if (selectElements.length >= 3) {
            await ig.selectOption(selectElements[2], '1995'); // Select 1995
            console.log('Selected 1995 in year select element');
          }
        } else {
          // Try using JavaScript to set the values
          await ig.evaluate(() => {
            const selects = document.querySelectorAll('select');
            if (selects.length > 0) {
              // Set month value (first select)
              selects[0].value = '5';
              selects[0].dispatchEvent(new Event('change', { bubbles: true }));
              
              // Set year value (third select)
              if (selects.length >= 3) {
                selects[2].value = '1995';
                selects[2].dispatchEvent(new Event('change', { bubbles: true }));
              }
              return true;
            }
            return false;
          });
          console.log('Attempted to set month and year values using JavaScript');
        }
      } catch (altErr) {
        console.error('Alternative approaches failed:', altErr);
      }
    }
    
    // Click the Next button to continue
    console.log('Clicking Next button...');
    try {
      // Try different selectors for the Next button
      await Promise.any([
        ig.click('button:has-text("Next")'),
        ig.click('button[type="submit"]'),
        ig.click('button._acan._acap._acas._aj1-')
      ]);
      console.log('Clicked Next button successfully');
    } catch (nextErr) {
      console.error('Failed to click Next button:', nextErr);
    }
    
    // Wait for verification code page to load
    await ig.waitForTimeout(3000);
    await ig.screenshot({ path: 'verification-code-page.png' });
    console.log('Saved screenshot of verification code page');
    
    console.log('Month dropdown click attempt completed');
    console.log('Birthday form handling completed');
  } catch (birthdayError) {
    console.error('Error handling birthday form:', birthdayError);
  }

  // 3. cek berkala inbox tempmail
  let code = null;
  for (let i = 0; i < 10; i++) {
    await page.reload();
    // cek apakah ada email masuk
    const mailRow = await page.$(".inbox-dataList ul li a");
    if (mailRow) {
      await mailRow.click();
      await page.waitForSelector(".inbox-data-content-intro");
      const mailContent = await page.textContent(".inbox-data-content-intro");
      console.log("Mail content:", mailContent);

      // ekstrak kode (biasanya 6 digit)
      const match = mailContent.match(/(\d{6})/);
      if (match) {
        code = match[1];
        break;
      }
    }
    await new Promise((r) => setTimeout(r, 5000));
  }

  if (!code) {
    console.error("Verification code not found");
    await browser.close();
    return;
  }

  console.log("Got verification code:", code);

  // 4. masukkan kode verifikasi di Instagram
  console.log('Entering verification code:', code);
  try {
    // Wait for the verification code input field
    await ig.waitForSelector('input[name=confirmationCode]', { timeout: 10000 });
    
    // Fill in the verification code
    await ig.fill('input[name=confirmationCode]', code);
    console.log('Filled verification code');
    
    // Take a screenshot after filling the code
    await ig.screenshot({ path: 'after-code-entry.png' });
    
    // Click the submit button
    await ig.click('button[type=submit]');
    console.log('Clicked submit button for verification code');
    
    // Wait for the next page to load
    await ig.waitForTimeout(5000);
    await ig.screenshot({ path: 'after-verification.png' });
  } catch (verifyErr) {
    console.error('Error during verification code entry:', verifyErr);
  }

  console.log("Signup process attempted!");

  // Jangan lupa tutup browser
  // await browser.close();
})();

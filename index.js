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

  // 3. cek berkala inbox tempmail dengan pencarian subject
  let code = null;
  const maxAttempts = 20; // Increase attempts untuk memberikan lebih banyak waktu
  const checkInterval = 3000; // 3 detik interval
  
  console.log(`Starting email check process. Will check for ${maxAttempts} times every ${checkInterval/1000} seconds...`);
  
  for (let i = 0; i < maxAttempts; i++) {
    console.log(`Email check attempt ${i + 1}/${maxAttempts}`);
    
        try {
      // Refresh halaman untuk memastikan email terbaru dimuat
      await page.waitForTimeout(2000);
      
      // Cek semua elemen email-subject dan ambil yang berisi kode
      const emailSubjectElements = await page.$$('.email-subject');
      
      if (emailSubjectElements.length > 0) {
        console.log(`Found ${emailSubjectElements.length} email-subject elements`);
        
        for (let k = 0; k < emailSubjectElements.length; k++) {
          const subjectText = await emailSubjectElements[k].textContent();
          console.log(`Email subject ${k + 1}: "${subjectText}"`);
          
          // Cek apakah subject berisi kode Instagram (6 digit + "instagram code")
          if (subjectText && subjectText.toLowerCase().includes('instagram code')) {
            console.log('✅ Found Instagram code email!');
            
            // Ekstrak kode 6 digit dari subject
            const match = subjectText.match(/(\d{6})/);
            if (match) {
              code = match[1];
              console.log(`✅ Extracted verification code: ${code}`);
              break;
            }
          }
        }
        
        if (code) break;
      } else {
        console.log('No email-subject elements found yet');
      }
       
     } catch (checkErr) {
      console.log(`Error during check attempt ${i + 1}:`, checkErr.message);
      // Refresh page if there's an error
      try {
        await page.goto("https://tempmail.edu.kg/en/");
        await page.waitForTimeout(2000);
      } catch (refreshErr) {
        console.log('Failed to refresh page:', refreshErr.message);
      }
    }
    
    if (i < maxAttempts - 1) {
      console.log(`Waiting ${checkInterval/1000} seconds before next check...`);
      await new Promise((r) => setTimeout(r, checkInterval));
    }
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
    // Wait for the verification code input field dengan selector yang benar
    await ig.waitForSelector('input[name=email_confirmation_code]', { timeout: 15000 });
    console.log('Found verification code input field');
    
    // Fill in the verification code
    await ig.fill('input[name=email_confirmation_code]', code);
    console.log('Filled verification code:', code);
    
    // Take a screenshot after filling the code
    await ig.screenshot({ path: 'after-code-entry.png' });
    console.log('Screenshot taken after entering code');
    
    // Wait a bit before clicking submit
    await ig.waitForTimeout(2000);
    
    // Click the submit button
    try {
      await Promise.any([
        ig.click('button[type=submit]'),
        ig.click('button:has-text("Next")'),
        ig.click('button:has-text("Confirm")'),
        ig.click('button._acan._acap._acas._aj1-'),
        ig.click('div[role="button"]:has-text("Next")'),
        ig.click('.x1i10hfl.xjqpnuy.xc5r6h4.xqeqjp1:has-text("Next")')
      ]);
      console.log('Clicked submit button for verification code');
    } catch (submitErr) {
      console.log('Trying alternative submit methods...');
      
      // Try clicking the specific div with Next text
      try {
        await ig.click('div[role="button"]:has-text("Next")');
        console.log('Clicked Next div button');
      } catch (divErr) {
        console.log('Trying to click by class selector...');
        try {
          // Try the exact class selector you provided
          await ig.click('.x1i10hfl.xjqpnuy.xc5r6h4.xqeqjp1.x1phubyo.x972fbf.x10w94by.x1qhh985.x14e42zd.xdl72j9.x2lah0s.x3ct3a4.xdj266r.x14z9mp.xat24cr.x1lziwak.x2lwn1j.xeuugli.xexx8yu.x18d9i69.x1hl2dhg.xggy1nq.x1ja2u2z.x1t137rt.x1q0g3np.x1lku1pv.x1a2a7pz.x6s0dn4.xjyslct.x1obq294.x5a5i1n.xde0f50.x15x8krk.x1ejq31n.x18oe1m7.x1sy0etr.xstzfhl.x9f619.x9bdzbf.x1ypdohk.x1f6kntn.xwhw2v2.x10w6t97.xl56j7k.x17ydfre.xf7dkkf.xv54qhq.x1n2onr6.x2b8uid.xlyipyv.x87ps6o.x5c86q.x18br7mf.x1i0vuye.xh8yej3.x18cabeq.x158me93.xk4oym4.x1uugd1q.x3nfvp2');
          console.log('Clicked Next button using full class selector');
        } catch (classErr) {
          console.log('All submit methods failed, trying Enter key...');
          // Try pressing Enter key as last resort
          await ig.press('input[name=email_confirmation_code]', 'Enter');
          console.log('Pressed Enter on verification code input');
        }
      }
    }
    
    // Wait for the next page to load
    await ig.waitForTimeout(5000);
    await ig.screenshot({ path: 'after-verification.png' });
    console.log('Screenshot taken after verification');
    
  } catch (verifyErr) {
    console.error('Error during verification code entry:', verifyErr);
    // Take screenshot for debugging
    await ig.screenshot({ path: 'verification-error.png' });
    console.log('Screenshot taken for debugging verification error');
  }

  console.log("Signup process attempted!");

  // Jangan lupa tutup browser
  // await browser.close();
})();

// install dulu: npm install playwright
// jalankan: node index.js

const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

// Function to save account data to JSON
function saveAccountToJSON(accountData) {
  const accountsFile = path.join(__dirname, 'accounts.json');
  let accounts = [];
  
  // Read existing accounts if file exists
  if (fs.existsSync(accountsFile)) {
    try {
      const data = fs.readFileSync(accountsFile, 'utf8');
      if (data.trim()) {
        accounts = JSON.parse(data);
      } else {
        console.log('Accounts file is empty, starting fresh');
        accounts = [];
      }
    } catch (err) {
      console.log('Error reading accounts file, starting fresh:', err.message);
      accounts = [];
    }
  }
  
  // Add new account
  accounts.push({
    ...accountData,
    createdAt: new Date().toISOString(),
    id: accounts.length + 1
  });
  
  // Save updated accounts
  try {
    fs.writeFileSync(accountsFile, JSON.stringify(accounts, null, 2));
    console.log(`✅ Account saved to accounts.json (Total: ${accounts.length})`);
  } catch (err) {
    console.error('❌ Error saving account:', err.message);
  }
}

// Function to create single Instagram account
async function createInstagramAccount(accountNumber, browser, maxRetries = 2) {
  console.log(`\n🚀 Starting account creation ${accountNumber}/10...`);
  
  const accountData = {
    email: '',
    fullName: '',
    username: '',
    password: 'Password123!',
    verificationCode: '',
    status: 'failed',
    error: null
  };

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    console.log(`\n📝 Attempt ${attempt}/${maxRetries} for account ${accountNumber}`);
    
    const page = await browser.newPage();

    try {
    // 1. buka temp mail
    console.log("Opening temp mail service...");
    await page.goto("https://etempmail.com/", { waitUntil: 'networkidle' });

    // tunggu sampai email muncul
    // Wait for the email to be generated and not show "Please wait..."
    console.log("Waiting for email generation...");
    const email = await page.waitForFunction(() => {
      const emailInput = document.querySelector('#tempEmailAddress');
      return emailInput && emailInput.value && emailInput.value !== 'Please wait...' && emailInput.value.includes('@');
    }, { timeout: 30000 }).then(() => page.$eval('#tempEmailAddress', (el) => el.value));
    console.log("✅ Generated temp email:", email);
    accountData.email = email;

    // 2. buka instagram signup
    console.log("Opening Instagram signup page...");
    const ig = await browser.newPage();
    
    // Try to load Instagram with different strategies
    let instagramLoaded = false;
    for (let retry = 0; retry < 3; retry++) {
      try {
        console.log(`Instagram load attempt ${retry + 1}/3...`);
        await ig.goto("https://www.instagram.com/accounts/emailsignup/", { 
          waitUntil: 'domcontentloaded',
          timeout: 20000 
        });
        instagramLoaded = true;
        break;
      } catch (err) {
        console.log(`Instagram load attempt ${retry + 1} failed:`, err.message);
        if (retry < 2) {
          console.log("Retrying in 5 seconds...");
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      }
    }
    
    if (!instagramLoaded) {
      throw new Error("Failed to load Instagram after 3 attempts");
    }

    // isi form instagram (email, fullname, username, password)
    console.log("Filling Instagram signup form...");
    await ig.waitForSelector("input[name=emailOrPhone]", { timeout: 15000 });
    await ig.fill("input[name=emailOrPhone]", email);
    
    const firstNames = ["John", "James", "Michael", "David", "Robert", "William", "Christopher", "Joseph", "Thomas", "Charles", "Daniel", "Matthew", "Anthony", "Mark", "Donald", "Steven", "Paul", "Andrew", "Joshua", "Kenneth", "Kevin", "Brian", "George", "Timothy", "Ronald", "Jason", "Edward", "Jeffrey", "Ryan", "Jacob", "Gary", "Nicholas", "Eric", "Jonathan", "Stephen", "Larry", "Justin", "Scott", "Brandon", "Benjamin", "Samuel", "Gregory", "Alexander", "Patrick", "Frank", "Raymond", "Jack", "Dennis", "Jerry", "Tyler", "Aaron", "Jose", "Henry", "Adam", "Douglas", "Nathan", "Peter", "Zachary", "Kyle", "Walter", "Harold", "Jeremy", "Ethan", "Carl", "Arthur", "Gerald", "Lawrence", "Sean", "Christian", "Allan", "Mason", "Maria", "Sarah", "Lisa", "Nancy", "Karen", "Betty", "Helen", "Sandra", "Donna", "Carol", "Ruth", "Sharon", "Michelle", "Laura", "Emily", "Ashley", "Jessica", "Samantha", "Rachel", "Katherine", "Emma", "Olivia", "Sophia", "Ava", "Isabella", "Mia", "Charlotte", "Ahmad", "Budi", "Agus", "Sari", "Dewi", "Indra", "Andi", "Rini", "Dian", "Eko", "Fitri", "Hadi", "Ika", "Joko", "Kartika", "Lina", "Maya", "Nita", "Oki", "Putra", "Ratna", "Sinta", "Tono", "Umi", "Vina", "Wati", "Yanti", "Zaki", "Asep", "Cecep", "Dede", "Endang", "Gina", "Hendra", "Irma", "Jamal", "Kiki", "Lilis", "Mamay", "Neng", "Odah", "Pepen", "Qori", "Riri", "Susi", "Teti", "Uus", "Vivi", "Wawan", "Yayah", "Zaenal", "Aang", "Bambang", "Cucu", "Dadang", "Euis", "Fuad", "Gungun", "Heri", "Iin", "Jajang", "Kang", "Lela", "Maman", "Nana", "Otong", "Pepep", "Qodir", "Rudi", "Sule", "Tatang", "Ujang", "Veri", "Wawan", "Yogi", "Zulkifli"];
    const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker", "Young", "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores", "Green", "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell", "Carter", "Roberts", "Gomez", "Phillips", "Evans", "Turner", "Diaz", "Parker", "Cruz", "Edwards", "Collins", "Reyes", "Stewart", "Morris", "Morales", "Murphy", "Cook", "Rogers", "Gutierrez", "Ortiz", "Morgan", "Cooper", "Peterson", "Bailey", "Reed", "Kelly", "Howard", "Ramos", "Kim", "Cox", "Ward", "Richardson", "Watson", "Brooks", "Chavez", "Wood", "James", "Bennett", "Gray", "Mendoza", "Ruiz", "Hughes", "Price", "Alvarez", "Castillo", "Sanders", "Patel", "Myers", "Long", "Ross", "Foster", "Jimenez", "Santoso", "Wijaya", "Kusuma", "Pratama", "Sari", "Putri", "Wibowo", "Utomo", "Handoko", "Gunawan", "Susanto", "Saputra", "Lestari", "Rahayu", "Purnomo", "Setiawan", "Hakim", "Nurdin", "Rahman", "Suryani", "Permana", "Safitri", "Mahendra", "Anggraeni", "Nugroho", "Fitriani", "Kurniawan", "Maharani", "Rachmad", "Kartika", "Hermawan", "Sulistyo", "Dwiyanto", "Setiadji", "Mulyana", "Ramdani", "Sukmawati", "Suhendar", "Nursyamsi", "Hermansyah", "Suryadi", "Nurhayati", "Darmawan", "Wardhani", "Sudrajat", "Andriani", "Kusumawati", "Rismayanti", "Komarudin", "Solihat", "Wahyudin", "Novianti", "Febrianti", "Ramdhani", "Marlina", "Iskandar", "Fauziah", "Sopandi", "Hidayat", "Mustofa", "Nugraha", "Firmansyah", "Susilawati", "Saepudin", "Rahayu", "Sumardi", "Supartini", "Hendriawan", "Mutmainah", "Priatna", "Rosdiana", "Daryono", "Yulianti"];
    const usernameWords = ["alpha", "beta", "gamma", "delta", "echo", "foxtrot", "golf", "hotel", "india", "juliet", "kilo", "lima", "mike", "november", "oscar", "papa", "quebec", "romeo", "sierra", "tango", "uniform", "victor", "whiskey", "xray", "yankee", "zulu", "awesome", "cool", "super", "mega", "ultra", "power", "force", "storm", "thunder", "lightning", "fire", "ice", "wind", "earth", "water", "shadow", "light", "dark", "bright", "swift", "rapid", "fast", "quick", "smart", "wise", "brave", "bold", "strong", "tough", "hard", "solid", "steel", "iron", "gold", "silver", "diamond", "crystal", "gem", "star", "moon", "sun", "sky", "blue", "red", "green", "purple", "orange", "yellow", "black", "white", "grey", "pink"];
    
    const randomFirstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const randomLastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const randomNumber = Math.floor(Math.random() * 1000);
    
    const fullName = `${randomFirstName} ${randomLastName} ${randomNumber}`;
    await ig.fill("input[name=fullName]", fullName);
    accountData.fullName = fullName;
    console.log("Full name:", fullName);
    
    const randomWord1 = usernameWords[Math.floor(Math.random() * usernameWords.length)];
    const randomWord2 = usernameWords[Math.floor(Math.random() * usernameWords.length)];
    const randomNumberForUsername = Math.floor(Math.random() * 10000);
    const username = `${randomWord1}_${randomWord2}_${randomNumberForUsername}`;
    await ig.fill("input[name=username]", username);
    accountData.username = username;
    console.log("Username:", username);
    await ig.fill("input[name=password]", "Password123!");

    console.log("Submitting Instagram signup form...");
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
      
      // Cek semua elemen email dalam inbox table
      const emailRows = await page.$$('table tbody tr');
      
      if (emailRows.length > 0) {
        console.log(`Found ${emailRows.length} email rows`);
        
        for (let k = 0; k < emailRows.length; k++) {
          const subjectCell = await emailRows[k].$('td:nth-child(2)'); // Subject is in second column
          if (subjectCell) {
            const subjectText = await subjectCell.textContent();
            console.log(`Email subject ${k + 1}: "${subjectText}"`);
            
            // Cek apakah subject berisi kode Instagram (6 digit + "instagram code")
            if (subjectText && subjectText.toLowerCase().includes('instagram code')) {
              console.log('✅ Found Instagram code email!');
              
              // Ekstrak kode 6 digit dari subject
              const match = subjectText.match(/(\d{6})/);
              if (match) {
                code = match[1];
                accountData.verificationCode = code;
                console.log(`✅ Extracted verification code: ${code}`);
                break;
              }
            }
          }
        }
        
        if (code) break;
      } else {
        console.log('No email rows found yet');
      }
       
     } catch (checkErr) {
      console.log(`Error during check attempt ${i + 1}:`, checkErr.message);
      // Refresh page if there's an error
      try {
        await page.goto("https://etempmail.com/");
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
      
      // Mark as successful if we got this far
      accountData.status = 'success';
      
      // Close pages but keep browser open for next account
      await page.close();
      await ig.close();
      
      // Save successful account data
      saveAccountToJSON(accountData);
      return accountData;
      
    } catch (error) {
      console.error(`❌ Error creating account ${accountNumber} (attempt ${attempt}):`, error.message);
      accountData.error = error.message;
      accountData.status = 'failed';
      
      // Close pages even if there was an error
      try {
        await page.close();
      } catch (closeErr) {
        console.log('Error closing temp mail page:', closeErr.message);
      }
      
      try {
        const ig = await browser.newPage(); // Get reference if it exists
        await ig.close();
      } catch (closeErr) {
        console.log('Error closing Instagram page:', closeErr.message);
      }
      
      // If this was the last attempt, save the failed account data
      if (attempt === maxRetries) {
        saveAccountToJSON(accountData);
        return accountData;
      } else {
        console.log(`⏳ Waiting 10 seconds before retry...`);
        await new Promise(resolve => setTimeout(resolve, 10000));
      }
    }
  }
  
  // This should not be reached, but just in case
  return accountData;
}

// Main function to run the loop
(async () => {
  console.log('🎯 Starting Instagram account creation bot - 10 accounts');
  console.log('📝 Accounts will be saved to accounts.json');
  console.log('🌐 Using proxychains4 for proxy support');
  
  const browser = await chromium.launch({ headless: true });
  const results = [];
  
  try {
    for (let i = 1; i <= 10; i++) {
      console.log(`\n${'='.repeat(50)}`);
      console.log(`🔄 Creating account ${i}/10`);
      console.log(`${'='.repeat(50)}`);
      
      const result = await createInstagramAccount(i, browser);
      results.push(result);
      
      // Add delay between account creations
      if (i < 10) {
        console.log('\n⏱️  Waiting 30 seconds before next account...');
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
    
  } catch (error) {
    console.error('❌ Fatal error in main loop:', error.message);
  } finally {
    await browser.close();
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 FINAL SUMMARY');
    console.log('='.repeat(60));
    
    const successful = results.filter(r => r.status === 'success').length;
    const failed = results.filter(r => r.status === 'failed').length;
    
    console.log(`✅ Successful accounts: ${successful}/10`);
    console.log(`❌ Failed accounts: ${failed}/10`);
    console.log('📁 All account data saved to accounts.json');
    
    if (successful > 0) {
      console.log('\n🎉 Successfully created accounts:');
      results.filter(r => r.status === 'success').forEach((acc, idx) => {
        console.log(`${idx + 1}. ${acc.username} (${acc.email})`);
      });
    }
  }
})();

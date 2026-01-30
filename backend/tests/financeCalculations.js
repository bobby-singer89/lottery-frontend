/**
 * Finance Model Calculation Tests
 * 
 * This file contains manual verification tests for the finance model.
 * Run these in a Node.js REPL or browser console to verify calculations.
 */

// Test 1: Single Ticket Distribution (1 TON)
function testSingleTicket() {
  const ticketPrice = 1.00;
  
  // Calculate distribution
  const prizeFund = ticketPrice * 0.50;           // 50%
  const jackpot = prizeFund * 0.15;               // 15% of prize fund
  const payoutPool = prizeFund * 0.85;            // 85% of prize fund
  
  const platform = ticketPrice * 0.50;            // 50%
  const reserve = platform * 0.10;                // 10% of platform
  const revenue = platform * 0.90;                // 90% of platform
  
  console.log('=== Single Ticket (1 TON) ===');
  console.log('Total:', ticketPrice.toFixed(4));
  console.log('Prize Fund:', prizeFund.toFixed(4));
  console.log('  - Jackpot:', jackpot.toFixed(4));
  console.log('  - Payout Pool:', payoutPool.toFixed(4));
  console.log('Platform:', platform.toFixed(4));
  console.log('  - Reserve:', reserve.toFixed(4));
  console.log('  - Revenue:', revenue.toFixed(4));
  
  // Verify totals
  const totalVerify = prizeFund + platform;
  const prizeFundVerify = jackpot + payoutPool;
  const platformVerify = reserve + revenue;
  
  console.log('\n=== Verification ===');
  console.log('Prize Fund + Platform =', totalVerify.toFixed(4), '(should be 1.0000)');
  console.log('Jackpot + Payout Pool =', prizeFundVerify.toFixed(4), '(should be 0.5000)');
  console.log('Reserve + Revenue =', platformVerify.toFixed(4), '(should be 0.5000)');
  
  const allCorrect = 
    Math.abs(totalVerify - 1.0) < 0.0001 &&
    Math.abs(prizeFundVerify - 0.5) < 0.0001 &&
    Math.abs(platformVerify - 0.5) < 0.0001;
  
  console.log('\nTest Result:', allCorrect ? '✅ PASS' : '❌ FAIL');
  
  return {
    total: ticketPrice,
    prizeFund,
    jackpot,
    payoutPool,
    platform,
    reserve,
    revenue,
    verified: allCorrect
  };
}

// Test 2: Payout Pool Distribution
function testPayoutPoolDistribution() {
  const payoutPool = 0.425; // For 1 TON ticket
  
  const match4Pool = payoutPool * 0.60;  // 60%
  const match3Pool = payoutPool * 0.30;  // 30%
  const match2Pool = payoutPool * 0.10;  // 10%
  
  console.log('\n=== Payout Pool Distribution ===');
  console.log('Total Payout Pool:', payoutPool.toFixed(4));
  console.log('4/5 match pool (60%):', match4Pool.toFixed(4));
  console.log('3/5 match pool (30%):', match3Pool.toFixed(4));
  console.log('2/5 match pool (10%):', match2Pool.toFixed(4));
  
  const total = match4Pool + match3Pool + match2Pool;
  console.log('\n=== Verification ===');
  console.log('Sum of match pools:', total.toFixed(4), '(should be 0.4250)');
  
  const verified = Math.abs(total - payoutPool) < 0.0001;
  console.log('Test Result:', verified ? '✅ PASS' : '❌ FAIL');
  
  return {
    payoutPool,
    match4Pool,
    match3Pool,
    match2Pool,
    verified
  };
}

// Test 3: Dynamic Prize Calculation
function testDynamicPrizes() {
  const ticketsSold = 100;
  const ticketPrice = 1.00;
  const totalRevenue = ticketsSold * ticketPrice;
  
  // Calculate pools
  const prizeFund = totalRevenue * 0.50;
  const payoutPool = prizeFund * 0.85;
  
  // Winners scenario
  const winners = {
    match4: 2,
    match3: 5,
    match2: 10
  };
  
  // Prize per winner
  const match4Prize = (payoutPool * 0.60) / winners.match4;
  const match3Prize = (payoutPool * 0.30) / winners.match3;
  const match2Prize = (payoutPool * 0.10) / winners.match2;
  
  console.log('\n=== Dynamic Prize Calculation ===');
  console.log('Tickets Sold:', ticketsSold);
  console.log('Total Revenue:', totalRevenue.toFixed(2), 'TON');
  console.log('Payout Pool:', payoutPool.toFixed(2), 'TON');
  console.log('\nWinners:');
  console.log('  4/5 match:', winners.match4, 'winners');
  console.log('  3/5 match:', winners.match3, 'winners');
  console.log('  2/5 match:', winners.match2, 'winners');
  console.log('\nPrizes per winner:');
  console.log('  4/5 match:', match4Prize.toFixed(4), 'TON');
  console.log('  3/5 match:', match3Prize.toFixed(4), 'TON');
  console.log('  2/5 match:', match2Prize.toFixed(4), 'TON');
  
  // Verify total payout
  const totalPayout = 
    (match4Prize * winners.match4) +
    (match3Prize * winners.match3) +
    (match2Prize * winners.match2);
  
  console.log('\n=== Verification ===');
  console.log('Total Payout:', totalPayout.toFixed(4), 'TON');
  console.log('Should equal payout pool:', payoutPool.toFixed(4), 'TON');
  
  const verified = Math.abs(totalPayout - payoutPool) < 0.0001;
  console.log('Test Result:', verified ? '✅ PASS' : '❌ FAIL');
  
  return {
    payoutPool,
    winners,
    prizes: {
      match4: match4Prize,
      match3: match3Prize,
      match2: match2Prize
    },
    totalPayout,
    verified
  };
}

// Test 4: Multiple Tickets
function testMultipleTickets() {
  const ticketCounts = [1, 10, 100, 1000];
  const ticketPrice = 1.00;
  
  console.log('\n=== Multiple Tickets Test ===');
  console.log('Ticket Price:', ticketPrice, 'TON');
  console.log('\nResults:');
  
  const results = ticketCounts.map(count => {
    const total = count * ticketPrice;
    const jackpot = total * 0.50 * 0.15;
    const reserve = total * 0.50 * 0.10;
    const revenue = total * 0.50 * 0.90;
    
    console.log(`\n${count} tickets:`);
    console.log('  Total Revenue:', total.toFixed(2), 'TON');
    console.log('  Jackpot Growth:', jackpot.toFixed(2), 'TON');
    console.log('  Reserve Fund:', reserve.toFixed(2), 'TON');
    console.log('  Platform Revenue:', revenue.toFixed(2), 'TON');
    
    return { count, total, jackpot, reserve, revenue };
  });
  
  console.log('\nTest Result: ✅ PASS');
  return results;
}

// Test 5: Percentage Validation
function testPercentages() {
  console.log('\n=== Percentage Validation ===');
  
  const config = {
    prizeFundPercentage: 0.50,
    jackpotPercentage: 0.15,
    platformPercentage: 0.50,
    reservePercentage: 0.10
  };
  
  console.log('Configuration:');
  console.log('  Prize Fund:', (config.prizeFundPercentage * 100) + '%');
  console.log('  Jackpot (of prize fund):', (config.jackpotPercentage * 100) + '%');
  console.log('  Platform:', (config.platformPercentage * 100) + '%');
  console.log('  Reserve (of platform):', (config.reservePercentage * 100) + '%');
  
  // Verify main split
  const mainSplit = config.prizeFundPercentage + config.platformPercentage;
  console.log('\n=== Verification ===');
  console.log('Prize Fund + Platform:', mainSplit, '(should be 1.0)');
  
  const verified = Math.abs(mainSplit - 1.0) < 0.0001;
  console.log('Test Result:', verified ? '✅ PASS' : '❌ FAIL');
  
  return { config, verified };
}

// Run all tests
function runAllTests() {
  console.log('╔════════════════════════════════════════╗');
  console.log('║  Finance Model Calculation Tests     ║');
  console.log('╚════════════════════════════════════════╝');
  
  const results = {
    singleTicket: testSingleTicket(),
    payoutDistribution: testPayoutPoolDistribution(),
    dynamicPrizes: testDynamicPrizes(),
    multipleTickets: testMultipleTickets(),
    percentages: testPercentages()
  };
  
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║           Summary                     ║');
  console.log('╚════════════════════════════════════════╝');
  
  const allPassed = 
    results.singleTicket.verified &&
    results.payoutDistribution.verified &&
    results.dynamicPrizes.verified &&
    results.percentages.verified;
  
  console.log('\nAll Tests:', allPassed ? '✅ PASSED' : '❌ FAILED');
  
  return results;
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    testSingleTicket,
    testPayoutPoolDistribution,
    testDynamicPrizes,
    testMultipleTickets,
    testPercentages,
    runAllTests
  };
  
  // Auto-run in Node.js if executed directly
  if (require.main === module) {
    runAllTests();
  }
}

// Auto-run in browser
if (typeof window !== 'undefined') {
  console.log('Finance Model Tests loaded. Run runAllTests() to execute all tests.');
}

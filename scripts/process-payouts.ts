import fetch from 'node-fetch';

async function processPayouts() {
  try {
    const response = await fetch('http://localhost:3000/api/stripe/process-payouts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    console.log('Payout processing results:', data);
  } catch (error) {
    console.error('Error processing payouts:', error);
  }
}

// Run the payout processing
processPayouts(); 
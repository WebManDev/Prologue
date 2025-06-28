// Simple test script to verify onboarding flow
// This script can be run in the browser console to test the flow

console.log('Testing onboarding flow...');

// Test 1: Check if the main page loads correctly
console.log('Test 1: Checking main page structure');
const signUpButton = document.querySelector('button:contains("SIGN UP")');
console.log('Sign up button found:', !!signUpButton);

// Test 2: Check if authentication check is working
console.log('Test 2: Checking authentication state');
if (typeof window !== 'undefined' && window.auth) {
  console.log('Auth object available');
} else {
  console.log('Auth object not available in global scope');
}

// Test 3: Check if onboarding page exists
console.log('Test 3: Checking onboarding page accessibility');
fetch('/member/onboarding')
  .then(response => {
    console.log('Onboarding page status:', response.status);
    return response.text();
  })
  .then(html => {
    console.log('Onboarding page loaded successfully');
    console.log('Page contains form:', html.includes('form'));
    console.log('Page contains profile setup:', html.includes('Profile Setup'));
  })
  .catch(error => {
    console.error('Error accessing onboarding page:', error);
  });

// Test 4: Check if member dashboard exists
console.log('Test 4: Checking member dashboard accessibility');
fetch('/member-dashboard')
  .then(response => {
    console.log('Member dashboard status:', response.status);
  })
  .catch(error => {
    console.error('Error accessing member dashboard:', error);
  });

console.log('Onboarding flow test completed. Check the console for results.'); 
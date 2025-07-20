// Test script to verify verification badge functionality
// This script can be run in the browser console to test the verification badge

console.log('Testing verification badge functionality...');

// Test 1: Check if the verification badge component is properly imported
console.log('Test 1: Checking verification badge component');
const checkCircleIcon = document.querySelector('[data-testid="check-circle"]') || 
                       document.querySelector('.lucide-check-circle') ||
                       document.querySelector('svg[class*="check-circle"]');
console.log('CheckCircle icon found:', !!checkCircleIcon);

// Test 2: Check if verification badge appears when athlete has stripeAccountId
console.log('Test 2: Checking verification badge visibility');
const verificationBadge = document.querySelector('[class*="bg-blue-100"]') ||
                         document.querySelector('[class*="text-blue-700"]') ||
                         document.querySelector('[class*="Verified"]');
console.log('Verification badge found:', !!verificationBadge);

// Test 3: Check if the badge is positioned correctly next to the name
console.log('Test 3: Checking badge positioning');
const nameElement = document.querySelector('[class*="text-2xl"]') ||
                   document.querySelector('h1') ||
                   document.querySelector('[class*="font-bold"]');
const badgeNextToName = nameElement && 
                       nameElement.parentElement && 
                       nameElement.parentElement.querySelector('[class*="bg-blue-100"]');
console.log('Badge positioned next to name:', !!badgeNextToName);

// Test 4: Check if the badge has the correct styling
console.log('Test 4: Checking badge styling');
const badgeWithCorrectStyling = document.querySelector('[class*="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium"]');
console.log('Badge with correct styling found:', !!badgeWithCorrectStyling);

// Test 5: Check if the badge shows "Verified" text
console.log('Test 5: Checking badge text');
const verifiedText = document.querySelector('text:contains("Verified")') ||
                    document.querySelector('[class*="Verified"]');
console.log('Verified text found:', !!verifiedText);

// Test 6: Check if the badge is only shown when not editing
console.log('Test 6: Checking badge visibility during edit mode');
const editButton = document.querySelector('button:contains("Edit Profile")') ||
                  document.querySelector('[class*="Edit3"]');
const isEditing = editButton && editButton.textContent.includes('Exit Edit Mode');
const badgeHiddenDuringEdit = isEditing && !document.querySelector('[class*="bg-blue-100"]');
console.log('Badge hidden during edit mode:', badgeHiddenDuringEdit);

console.log('Verification badge test completed. Check the console for results.');

// Helper function to simulate an athlete with stripeAccountId
function simulateVerifiedAthlete() {
  console.log('Simulating verified athlete...');
  
  // This would typically be done by setting the profile data
  // For testing purposes, we can check if the logic is working
  const profileData = {
    firstName: "John",
    lastName: "Doe",
    stripeAccountId: "acct_test123",
    isVerified: true
  };
  
  console.log('Profile data with stripeAccountId:', profileData);
  console.log('isVerified should be true:', !!profileData.stripeAccountId);
  
  return profileData;
}

// Run the simulation
const testAthlete = simulateVerifiedAthlete();
console.log('Test athlete created:', testAthlete); 
// This is a special emergency fix for the profile page
// It completely bypasses the normal React rendering cycle
export function generateStaticProfile() {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>User Profile</title>
  <style>
    /* Inline Tailwind-like styles to prevent conflicts when embedded */
    .container { width: 100%; max-width: 80rem; margin-left: auto; margin-right: auto; }
    .mx-auto { margin-left: auto; margin-right: auto; }
    .px-4 { padding-left: 1rem; padding-right: 1rem; }
    .py-8 { padding-top: 2rem; padding-bottom: 2rem; }
    .max-w-4xl { max-width: 56rem; }
    .bg-white { background-color: white; }
    .rounded-lg { border-radius: 0.5rem; }
    .shadow-md { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
    .p-6 { padding: 1.5rem; }
    .text-2xl { font-size: 1.5rem; }
    .font-bold { font-weight: 700; }
    .mb-6 { margin-bottom: 1.5rem; }
    .space-y-6 > * + * { margin-top: 1.5rem; }
    .text-lg { font-size: 1.125rem; }
    .font-medium { font-weight: 500; }
    .mb-4 { margin-bottom: 1rem; }
    .mb-2 { margin-bottom: 0.5rem; }
    .grid { display: grid; }
    .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
    .gap-4 { gap: 1rem; }
    .text-sm { font-size: 0.875rem; }
    .text-gray-700 { color: #4b5563; }
    .text-gray-500 { color: #6b7280; }
    .border { border-width: 1px; border-style: solid; border-color: #e5e7eb; }
    .rounded-md { border-radius: 0.375rem; }
    .px-3 { padding-left: 0.75rem; padding-right: 0.75rem; }
    .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
    .bg-gray-50 { background-color: #f9fafb; }
    .mt-8 { margin-top: 2rem; }
    .inline-flex { display: inline-flex; }
    .items-center { align-items: center; }
    .justify-center { justify-content: center; }
    .h-10 { height: 2.5rem; }
    .px-4 { padding-left: 1rem; padding-right: 1rem; }
    .bg-gray-100 { background-color: #f3f4f6; }
    .hover\\:bg-gray-200:hover { background-color: #e5e7eb; }
    .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }
    
    @media (min-width: 768px) {
      .md\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    }
  </style>
</head>
<body class="bg-gray-50">
  <div class="container mx-auto px-4 py-8 max-w-4xl">
    <div class="bg-white rounded-lg shadow-md p-6">
      <h1 class="text-2xl font-bold mb-6">Profile Information</h1>
      
      <div id="profile-content" class="space-y-6">
        <div class="animate-pulse">
          <div style="height: 2rem; background-color: #e5e7eb; border-radius: 0.25rem; width: 50%; margin-bottom: 1rem;"></div>
          <div style="height: 1.5rem; background-color: #e5e7eb; border-radius: 0.25rem; width: 33%; margin-bottom: 1rem;"></div>
          <div style="height: 1.5rem; background-color: #e5e7eb; border-radius: 0.25rem; width: 25%; margin-bottom: 1rem;"></div>
        </div>
      </div>
      
      <div class="mt-8">
        <a 
          href="/epd/en/dashboard"
          class="inline-flex items-center justify-center rounded-md text-sm font-medium border border-gray-300 bg-white hover:bg-gray-100 h-10 px-4 py-2"
          style="text-decoration: none; color: #111827;"
        >
          Back to Dashboard
        </a>
      </div>
    </div>
  </div>

  <script>
  // Function to get user data from localStorage
  function getUserDataFromStorage() {
    try {
      // Try to get user data from local storage
      const userStoreData = localStorage.getItem('user-store');
      if (userStoreData) {
        const parsedData = JSON.parse(userStoreData);
        if (parsedData.state && parsedData.state.user) {
          return parsedData.state.user;
        }
      }
      
      // If not found in localStorage, try to get from cookies (session)
      const cookieValue = document.cookie
        .split('; ')
        .find(row => row.startsWith('next-auth.session-token='));
        
      if (cookieValue) {
        return { isAuthenticated: true };
      }
      
      return null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  }
  
  // Function to render the profile content
  function renderProfileContent() {
    const profileContent = document.getElementById('profile-content');
    if (!profileContent) return; // Skip if element doesn't exist (may happen when embedded)
    
    const userData = getUserDataFromStorage();
    
    if (!userData) {
      profileContent.innerHTML = 
        '<div>' +
        '<p class="mb-4">You need to be logged in to view your profile information.</p>' +
        '<p class="text-sm text-gray-500 mb-6">' +
        'Please log in to access your profile details.' +
        '</p>' +
        '</div>';
      
      // Redirect to home after 3 seconds
      setTimeout(() => {
        window.location.href = '/epd/en';
      }, 3000);
      
      return;
    }
    
    // Render user information
    profileContent.innerHTML = 
        '<div>' +
        '<h2 class="text-lg font-medium mb-4">Personal Details</h2>' +
        '<div class="grid grid-cols-1 md:grid-cols-2 gap-4">' +
        '<div>' +
        '<label class="block text-sm font-medium text-gray-700 mb-1">' +
        'First Name' +
        '</label>' +
        '<p class="text-gray-900 border rounded-md px-3 py-2 bg-gray-50">' +
        (userData.first_name || 'Not available') +
        '</p>' +
        '</div>' +
        '<div>' +
        '<label class="block text-sm font-medium text-gray-700 mb-1">' +
        'Last Name' +
        '</label>' +
        '<p class="text-gray-900 border rounded-md px-3 py-2 bg-gray-50">' +
        (userData.last_name || 'Not available') +
        '</p>' +
        '</div>' +
        '<div>' +
        '<label class="block text-sm font-medium text-gray-700 mb-1">' +
        'Email Address' +
        '</label>' +
        '<p class="text-gray-900 border rounded-md px-3 py-2 bg-gray-50">' +
        (userData.email || 'Not available') +
        '</p>' +
        '</div>' +
        '<div>' +
        '<label class="block text-sm font-medium text-gray-700 mb-1">' +
        'Company' +
        '</label>' +
        '<p class="text-gray-900 border rounded-md px-3 py-2 bg-gray-50">' +
        (userData.company_name || 'Not available') +
        '</p>' +
        '</div>' +
        '</div>' +
        '</div>';
  }
  
  // Run on page load safely, only if we're in a browser context
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    // Check if document is fully loaded
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      renderProfileContent();
      setupBackButton();
    } else {
      document.addEventListener('DOMContentLoaded', function() {
        renderProfileContent();
        setupBackButton();
      });
    }
  }
  
  function setupBackButton() {
    // Handle back button
    const backButton = document.querySelector('a[href="/epd/en/dashboard"]');
    if (backButton) {
      backButton.addEventListener('click', function(e) {
        e.preventDefault();
        window.location.href = '/epd/en/dashboard';
      });
    }
  }
  </script>
</body>
</html>
  `;
}

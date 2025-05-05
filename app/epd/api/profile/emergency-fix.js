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
  </style>
</head>
<body class="bg-gray-50">
  <div class="container px-4 py-8 mx-auto">
    <div class="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
      <h1 class="text-2xl font-bold mb-6">User Profile</h1>
      
      <div class="space-y-6">
        <!-- Profile Information -->
        <div>
          <h2 class="text-lg font-medium mb-4">Personal Information</h2>
          <div class="grid grid-cols-1 gap-4">
            <div>
              <p class="text-sm text-gray-500 mb-2">Full Name</p>
              <p class="text-gray-700 border rounded-md px-3 py-2 bg-gray-50">User Name</p>
            </div>
            <div>
              <p class="text-sm text-gray-500 mb-2">Email Address</p>
              <p class="text-gray-700 border rounded-md px-3 py-2 bg-gray-50">user@example.com</p>
            </div>
            <div>
              <p class="text-sm text-gray-500 mb-2">Company</p>
              <p class="text-gray-700 border rounded-md px-3 py-2 bg-gray-50">Company Name</p>
            </div>
            <div>
              <p class="text-sm text-gray-500 mb-2">Role</p>
              <p class="text-gray-700 border rounded-md px-3 py-2 bg-gray-50">User Role</p>
            </div>
          </div>
        </div>
        
        <!-- Account Settings -->
        <div>
          <h2 class="text-lg font-medium mb-4">Account Settings</h2>
          <div class="grid grid-cols-1 gap-4">
            <div>
              <p class="text-sm text-gray-500 mb-2">Language Preference</p>
              <p class="text-gray-700 border rounded-md px-3 py-2 bg-gray-50">English</p>
            </div>
            <div>
              <p class="text-sm text-gray-500 mb-2">Account Status</p>
              <p class="text-gray-700 border rounded-md px-3 py-2 bg-gray-50">Active</p>
            </div>
          </div>
        </div>
        
        <!-- Action Buttons -->
        <div class="mt-8">
          <button class="inline-flex items-center justify-center h-10 px-4 bg-gray-100 rounded-md hover:bg-gray-200">
            Go Back to Dashboard
          </button>
        </div>
      </div>
      
      <div class="mt-8 text-sm text-gray-500">
        <p>This is a static version of your profile. For the full interactive experience, please try again later.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

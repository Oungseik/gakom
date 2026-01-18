<script lang="ts">
  import type { PageProps } from "./$types";
  import { goto } from "$app/navigation";
  import { Card } from "@repo/ui/card";
  import { Button } from "@repo/ui/button";
  import { Badge } from "@repo/ui/badge";
  import { formatDate } from "$lib/utils";

  const { data }: PageProps = $props();
  const currentSlug = data.currentOrganization.slug;

  // Mock user profile data
  const mockProfile = $state({
    name: 'Jane Smith',
    employeeId: 'EMP-12345',
    position: 'Senior Software Engineer',
    department: 'Engineering',
    joinDate: '2021-03-15',
    manager: 'John Doe',
    contact: {
      email: 'jane.smith@company.com',
      phone: '+1 (555) 123-4567'
    },
    address: {
      street: '123 Corporate Blvd',
      city: 'Tech City',
      state: 'CA',
      zipCode: '94043'
    }
  });

  const mockLeaveBalance = $state({
    annual: { used: 12, remaining: 16 },
    sick: { used: 3, remaining: 11 },
    total: 28
  });

  // Password change state (would normally be separate form)
  const passwordForm = $state({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
</script>

<svelte:head>
  <title>{data.currentOrganization.name} | Profile</title>
  <meta name="description" content="Manage your personal information and settings" />
</svelte:head>

<div class="container mx-auto space-y-6 p-4 md:p-6 lg:p-8">
  <div>
    <h1 class="text-2xl font-bold">Profile & Settings</h1>
    <p class="text-gray-600 dark:text-gray-400">Manage your personal information and account settings</p>
  </div>

  <!-- Personal Information -->
  <Card class="p-6">
    <h2 class="text-xl font-semibold mb-4">Personal Information</h2>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
        <p class="text-gray-900 dark:text-white">{mockProfile.name}</p>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Employee ID</label>
        <p class="text-gray-900 dark:text-white">{mockProfile.employeeId}</p>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Position</label>
        <p class="text-gray-900 dark:text-white">{mockProfile.position}</p>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Department</label>
        <p class="text-gray-900 dark:text-white">{mockProfile.department}</p>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Join Date</label>
        <p class="text-gray-900 dark:text-white">{formatDate(new Date(mockProfile.joinDate))}</p>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Manager</label>
        <p class="text-gray-900 dark:text-white">{mockProfile.manager}</p>
      </div>
    </div>
  </Card>

  <!-- Contact Information -->
  <Card class="p-6">
    <h2 class="text-xl font-semibold mb-4">Contact Information</h2>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
        <p class="text-gray-900 dark:text-white">{mockProfile.contact.email}</p>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
        <p class="text-gray-900 dark:text-white">{mockProfile.contact.phone}</p>
      </div>
    </div>
  </Card>

  <!-- Address -->
  <Card class="p-6">
    <h2 class="text-xl font-semibold mb-4">Address</h2>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Street Address</label>
        <p class="text-gray-900 dark:text-white">{mockProfile.address.street}</p>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City</label>
        <p class="text-gray-900 dark:text-white">{mockProfile.address.city}</p>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">State</label>
        <p class="text-gray-900 dark:text-white">{mockProfile.address.state}</p>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ZIP Code</label>
        <p class="text-gray-900 dark:text-white">{mockProfile.address.zipCode}</p>
      </div>
    </div>
  </Card>

  <!-- Leave Balance Summary -->
  <Card class="p-6">
    <h2 class="text-xl font-semibold mb-4">Leave Balance</h2>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div>
        <div class="flex justify-between items-center mb-2">
          <span class="text-sm font-medium">Annual Leave</span>
          <span class="text-sm text-gray-600 dark:text-gray-400">{mockLeaveBalance.annual.remaining} remaining</span>
        </div>
        <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div class="bg-blue-600 dark:bg-blue-400 h-3 rounded-full" style="width: {Math.round((mockLeaveBalance.annual.used / mockLeaveBalance.total) * 100)}%"></div>
        </div>
        <p class="text-xs text-gray-500 mt-1">{mockLeaveBalance.annual.used} used this year</p>
      </div>

      <div>
        <div class="flex justify-between items-center mb-2">
          <span class="text-sm font-medium">Sick Leave</span>
          <span class="text-sm text-gray-600 dark:text-gray-400">{mockLeaveBalance.sick.remaining} remaining</span>
        </div>
        <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div class="bg-red-600 dark:bg-red-400 h-3 rounded-full" style="width: {Math.round((mockLeaveBalance.sick.used / mockLeaveBalance.total) * 100)}%"></div>
        </div>
        <p class="text-xs text-gray-500 mt-1">{mockLeaveBalance.sick.used} used this year</p>
      </div>

      <div>
        <div class="text-center">
          <h3 class="text-lg font-semibold">{mockLeaveBalance.annual.remaining + mockLeaveBalance.sick.remaining}</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">Total remaining days</p>
          <p class="text-xs text-gray-500">out of {mockLeaveBalance.total} allocated</p>
        </div>
      </div>
    </div>
  </Card>

  <!-- Settings -->
  <Card class="p-6">
    <h2 class="text-xl font-semibold mb-4">Account Settings</h2>

    <div class="space-y-4">
      <div>
        <Button onclick={() => {/* Would open change password dialog */}}>
          Change Password
        </Button>
        <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">Update your account password</p>
      </div>

      <!-- Note: Theme/language settings are excluded per V1 scope -->
      <div class="text-sm text-gray-600 dark:text-gray-400">
        Theme and language preferences are managed through system settings.
      </div>
    </div>
  </Card>
</div>
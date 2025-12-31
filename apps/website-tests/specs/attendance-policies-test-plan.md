# Attendance Policies Test Plan

## Application Overview

Test plan for the Gakom HR management software's Attendance Policies feature. This module allows administrators to create, manage, and edit attendance policies that define work schedules, timezones, and workdays for employee attendance tracking.

## Test Scenarios

### 1. Navigation and Page Display

**Seed:** `tests/auth.setup.ts`

#### 1.1. Navigate to Attendance Policies page

**File:** `tests/attendance-policies/navigation.spec.ts`

**Steps:**
  1. Navigate to the application and log in
  2. Click on 'Attendance Policies' in the sidebar navigation
  3. Verify the page URL is /dashboard/crossworks/attendances/policies
  4. Verify the breadcrumb shows Dashboard > Attendances > Policies
  5. Verify the page title contains 'Policies'

**Expected Results:**
  - User is successfully navigated to the Attendance Policies page
  - Breadcrumb navigation is correctly displayed
  - URL matches the expected pattern

#### 1.2. Verify page layout and main elements

**File:** `tests/attendance-policies/navigation.spec.ts`

**Steps:**
  1. On the Attendance Policies page, verify the 'Create Policy' button is visible
  2. Verify the attendance policies table is displayed
  3. Verify table headers are present: Name, Timezone, Schedule
  4. Verify the 'Open menu' button exists for each policy row
  5. Verify the sidebar navigation is accessible

**Expected Results:**
  - All main UI elements are visible and properly positioned
  - Create Policy button is prominently displayed
  - Table structure is correctly formatted with all headers

#### 1.3. Display existing attendance policies

**File:** `tests/attendance-policies/navigation.spec.ts`

**Steps:**
  1. Count the number of rows in the policies table
  2. For each policy row, verify the following fields are displayed:
  3.  - Policy name
  4.  - Timezone
  5.  - Schedule (Clock In - Clock Out)
  6.  - Workdays
  7. Verify the format of schedule display (e.g., '09:00 AM - 06:00 PM')
  8. Verify workdays are displayed as comma-separated abbreviations

**Expected Results:**
  - All existing policies are displayed in the table
  - Each policy shows all required information
  - Information is formatted correctly and readable

### 2. Create Policy - Happy Paths

**Seed:** `tests/auth.setup.ts`

#### 2.1. Create policy with default values

**File:** `tests/attendance-policies/create-policy.spec.ts`

**Steps:**
  1. Click on 'Create Policy' button
  2. Verify 'New attendance policy' dialog opens
  3. Enter a valid policy name (e.g., 'Standard 9-5')
  4. Select a timezone from the dropdown (e.g., 'America/New_York')
  5. Leave Clock In as default (09:00)
  6. Leave Clock Out as default (17:00)
  7. Leave default workdays selected (MON-FRI)
  8. Click on 'Create' button

**Expected Results:**
  - Dialog closes successfully
  - New policy appears in the table
  - Policy displays correct name, timezone, schedule, and workdays
  - Success notification is displayed (if applicable)

#### 2.2. Create policy with custom work hours

**File:** `tests/attendance-policies/create-policy.spec.ts`

**Steps:**
  1. Click on 'Create Policy' button
  2. Enter policy name 'Custom Hours'
  3. Select timezone 'Europe/London'
  4. Set Clock In to '08:30'
  5. Set Clock Out to '17:30'
  6. Select MON-FRI workdays
  7. Click on 'Create' button

**Expected Results:**
  - Policy is created successfully
  - Table displays custom hours correctly as '08:30 AM - 05:30 PM'
  - All other fields are correctly saved

#### 2.3. Create policy with weekend workdays

**File:** `tests/attendance-policies/create-policy.spec.ts`

**Steps:**
  1. Click on 'Create Policy' button
  2. Enter policy name 'Weekend Shift'
  3. Select timezone 'Asia/Tokyo'
  4. Set Clock In to '10:00'
  5. Set Clock Out to '18:00'
  6. Deselect MON-FRI
  7. Select SAT and SUN checkboxes
  8. Click on 'Create' button

**Expected Results:**
  - Policy is created successfully
  - Workdays display as 'SAT, SUN'
  - Schedule is correctly displayed

#### 2.4. Create policy with all workdays selected

**File:** `tests/attendance-policies/create-policy.spec.ts`

**Steps:**
  1. Click on 'Create Policy' button
  2. Enter policy name 'Full Week'
  3. Select timezone 'Australia/Sydney'
  4. Set Clock In to '07:00'
  5. Set Clock Out to '19:00'
  6. Select all seven days (SUN, MON, TUE, WED, THU, FRI, SAT)
  7. Click on 'Create' button

**Expected Results:**
  - Policy is created successfully
  - All seven workdays are displayed in the table
  - Schedule is correctly displayed

### 3. Create Policy - Validation and Edge Cases

**Seed:** `tests/auth.setup.ts`

#### 3.1. Attempt to create policy with empty name

**File:** `tests/attendance-policies/create-policy-validation.spec.ts`

**Steps:**
  1. Click on 'Create Policy' button
  2. Leave the Name field empty
  3. Fill in other required fields (timezone, clock in, clock out, workdays)
  4. Click on 'Create' button
  5. Observe system response

**Expected Results:**
  - System prevents creation of policy with empty name
  - Appropriate validation error message is displayed
  - Policy is not created
  - Dialog remains open or user is prompted to fix the error

#### 3.2. Attempt to create policy with no workdays selected

**File:** `tests/attendance-policies/create-policy-validation.spec.ts`

**Steps:**
  1. Click on 'Create Policy' button
  2. Enter a valid policy name
  3. Select a timezone
  4. Set valid Clock In and Clock Out times
  5. Deselect all workday checkboxes
  6. Click on 'Create' button
  7. Observe system response

**Expected Results:**
  - System prevents creation of policy with no workdays
  - Validation error message is displayed
  - Policy is not created

#### 3.3. Attempt to create policy with invalid time (Clock out before Clock in)

**File:** `tests/attendance-policies/create-policy-validation.spec.ts`

**Steps:**
  1. Click on 'Create Policy' button
  2. Enter policy name 'Invalid Time'
  3. Select a timezone
  4. Set Clock In to '18:00'
  5. Set Clock Out to '09:00'
  6. Select workdays (MON-FRI)
  7. Click on 'Create' button
  8. Observe system response

**Expected Results:**
  - System detects invalid time configuration
  - Validation error message is displayed indicating Clock Out must be after Clock In
  - Policy is not created

#### 3.4. Create policy with same time for Clock In and Clock Out

**File:** `tests/attendance-policies/create-policy-validation.spec.ts`

**Steps:**
  1. Click on 'Create Policy' button
  2. Enter policy name 'Zero Duration'
  3. Select a timezone
  4. Set both Clock In and Clock Out to '09:00'
  5. Select workdays
  6. Click on 'Create' button

**Expected Results:**
  - System detects zero work duration
  - Validation error is displayed
  - Policy is not created

#### 3.5. Create policy with very long name

**File:** `tests/attendance-policies/create-policy-validation.spec.ts`

**Steps:**
  1. Click on 'Create Policy' button
  2. Enter a name with 200+ characters
  3. Fill in other required fields
  4. Click on 'Create' button

**Expected Results:**
  - System either accepts the long name or provides appropriate error
  - If accepted, verify name is properly displayed in the table
  - UI should handle long names gracefully (ellipsis, truncation, or scrolling)

#### 3.6. Create policy with special characters in name

**File:** `tests/attendance-policies/create-policy-validation.spec.ts`

**Steps:**
  1. Click on 'Create Policy' button
  2. Enter policy name with special characters: 'Test @#$%^&*()_+-=[]{}|;:,.<>?/'
  3. Fill in other required fields
  4. Click on 'Create' button

**Expected Results:**
  - System either accepts special characters or provides validation
  - If accepted, characters are displayed correctly in the table
  - No security or display issues occur

### 4. Edit Policy Functionality

**Seed:** `tests/auth.setup.ts`

#### 4.1. Edit policy name

**File:** `tests/attendance-policies/edit-policy.spec.ts`

**Steps:**
  1. Locate an existing policy in the table
  2. Click on the 'Open menu' button for that policy
  3. Click on 'Edit' in the menu
  4. Verify 'Edit attendance policy' dialog opens with pre-filled values
  5. Modify the Name field
  6. Click on 'Update' button

**Expected Results:**
  - Edit dialog closes successfully
  - Policy name is updated in the table
  - Other policy details remain unchanged

#### 4.2. Edit policy timezone

**File:** `tests/attendance-policies/edit-policy.spec.ts`

**Steps:**
  1. Open the Edit dialog for an existing policy
  2. Click on the timezone dropdown
  3. Select a different timezone
  4. Click on 'Update' button

**Expected Results:**
  - Policy timezone is updated
  - New timezone is correctly displayed in the table

#### 4.3. Edit policy work hours

**File:** `tests/attendance-policies/edit-policy.spec.ts`

**Steps:**
  1. Open the Edit dialog for an existing policy
  2. Modify Clock In time
  3. Modify Clock Out time
  4. Click on 'Update' button

**Expected Results:**
  - Work hours are updated
  - New schedule is correctly displayed in the table in the format 'XX:XX AM/PM - XX:XX AM/PM'

#### 4.4. Edit workdays selection

**File:** `tests/attendance-policies/edit-policy.spec.ts`

**Steps:**
  1. Open the Edit dialog for an existing policy
  2. Deselect some workdays
  3. Select other workdays
  4. Click on 'Update' button

**Expected Results:**
  - Workdays are updated
  - New workdays are correctly displayed in the table

#### 4.5. Edit all fields simultaneously

**File:** `tests/attendance-policies/edit-policy.spec.ts`

**Steps:**
  1. Open the Edit dialog for an existing policy
  2. Change Name
  3. Change Timezone
  4. Change Clock In
  5. Change Clock Out
  6. Change Workdays
  7. Click on 'Update' button

**Expected Results:**
  - All changes are saved successfully
  - All changes are reflected in the table
  - No data corruption or partial updates occur

#### 4.6. Cancel edit operation

**File:** `tests/attendance-policies/edit-policy.spec.ts`

**Steps:**
  1. Open the Edit dialog for an existing policy
  2. Make changes to one or more fields
  3. Click on 'Cancel' button

**Expected Results:**
  - Edit dialog closes
  - No changes are saved
  - Policy remains in its original state

### 5. Delete Policy Functionality

**Seed:** `tests/auth.setup.ts`

#### 5.1. Delete policy with confirmation

**File:** `tests/attendance-policies/delete-policy.spec.ts`

**Steps:**
  1. Click on the 'Open menu' button for a policy
  2. Click on 'Delete' in the menu
  3. Verify 'Delete attendance policy' confirmation dialog appears
  4. Read and confirm the deletion message
  5. Click on 'Delete' button in the confirmation dialog

**Expected Results:**
  - Policy is successfully removed from the table
  - Success notification is displayed (if applicable)
  - Other policies remain unaffected

#### 5.2. Cancel delete operation

**File:** `tests/attendance-policies/delete-policy.spec.ts`

**Steps:**
  1. Open the delete confirmation dialog for a policy
  2. Click on 'Cancel' button

**Expected Results:**
  - Confirmation dialog closes
  - Policy is NOT deleted
  - Policy remains in the table

#### 5.3. Close delete confirmation with X button

**File:** `tests/attendance-policies/delete-policy.spec.ts`

**Steps:**
  1. Open the delete confirmation dialog for a policy
  2. Click on the X (Close) button in the top-right corner

**Expected Results:**
  - Confirmation dialog closes
  - No data is saved or changed
  - Policy remains in the table

### 6. Timezone Functionality

**Seed:** `tests/auth.setup.ts`

#### 6.1. Verify comprehensive timezone list

**File:** `tests/attendance-policies/timezone.spec.ts`

**Steps:**
  1. Open the Create Policy dialog
  2. Click on the timezone dropdown
  3. Verify the dropdown contains a comprehensive list of timezones
  4. Search for specific known timezones:
  5.  - UTC
  6.  - America/Los_Angeles
  7.  - Europe/London
  8.  - Asia/Tokyo
  9.  - Australia/Sydney
  10. Verify each is found and selectable

**Expected Results:**
  - Timezone list is comprehensive
  - Common timezones are available
  - All timezones are properly formatted
  - Filter works correctly

#### 6.2. Select timezone from different regions

**File:** `tests/attendance-policies/timezone.spec.ts`

**Steps:**
  1. Open the Create Policy dialog
  2. Click on the timezone dropdown
  3. Select timezone from Africa region (e.g., Africa/Cairo)
  4. Observe selection is displayed
  5. Repeat for other regions: America, Asia, Europe, Australia

**Expected Results:**
  - Timezones from different regions can be selected
  - Selected timezone is displayed in the dropdown
  - Selection is properly saved and displayed

### 7. Workdays Selection

**Seed:** `tests/auth.setup.ts`

#### 7.1. Select single workday

**File:** `tests/attendance-policies/workdays.spec.ts`

**Steps:**
  1. Open the Create Policy dialog
  2. Deselect all default workdays
  3. Select only one day (e.g., MON)
  4. Fill in other required fields
  5. Click on 'Create' button

**Expected Results:**
  - Policy is created with single workday
  - Table correctly displays only the selected day

#### 7.2. Select multiple workdays

**File:** `tests/attendance-policies/workdays.spec.ts`

**Steps:**
  1. Open the Create Policy dialog
  2. Select multiple non-consecutive days (e.g., MON, WED, FRI)
  3. Fill in other required fields
  4. Click on 'Create' button

**Expected Results:**
  - Policy is created with selected workdays
  - Workdays are displayed as comma-separated values

#### 7.3. Verify default workday selection

**File:** `tests/attendance-policies/workdays.spec.ts`

**Steps:**
  1. Open the Create Policy dialog
  2. Observe which workdays are checked by default
  3. Verify MON, TUE, WED, THU, FRI are checked
  4. Verify SUN and SAT are unchecked

**Expected Results:**
  - Default selection is MON-FRI
  - Weekend days are unselected by default

#### 7.4. Toggle individual workday selections

**File:** `tests/attendance-policies/workdays.spec.ts`

**Steps:**
  1. Open the Create Policy dialog
  2. Click on MON to deselect it
  3. Click on MON again to reselect it
  4. Repeat for other days
  5. Verify each toggle action updates checkbox state

**Expected Results:**
  - Each workday checkbox can be toggled independently
  - Checkbox states are visually updated immediately

### 8. Create and Cancel Dialog Interactions

**Seed:** `tests/auth.setup.ts`

#### 8.1. Click outside dialog to close

**File:** `tests/attendance-policies/dialog-interactions.spec.ts`

**Steps:**
  1. Click on 'Create Policy' button
  2. Click outside the dialog on the page background
  3. Verify dialog behavior (may or may not close depending on implementation)

**Expected Results:**
  - Either dialog closes without saving, or dialog remains open
  - No data is saved in either case
  - No policy is created

### 9. Policy Table Interactions

**Seed:** `tests/auth.setup.ts`

#### 9.1. Sort policies by table columns

**File:** `tests/attendance-policies/table-interactions.spec.ts`

**Steps:**
  1. Click on the 'Name' column header
  2. Verify if sorting is implemented
  3. If sortable, observe the sort order
  4. Click on the 'Timezone' column header
  5. Observe if and how it sorts

**Expected Results:**
  - Sorting behavior is consistent across columns (if implemented)
  - Sort direction is visually indicated (if sorting is available)

#### 9.2. Handle multiple policies in table

**File:** `tests/attendance-policies/table-interactions.spec.ts`

**Steps:**
  1. Create multiple policies with different configurations
  2. Observe the table with all policies
  3. Verify each policy row has correct information
  4. Verify each policy has its own 'Open menu' button
  5. Verify menu actions work correctly for each policy

**Expected Results:**
  - Table handles multiple policies correctly
  - Information is properly formatted for each row
  - Each policy is independently manageable
  - Action button is accessible and identifiable
  - No data mixing or corruption between policies

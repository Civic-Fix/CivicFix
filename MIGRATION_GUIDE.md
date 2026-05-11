# Issue Status Update Fix - Setup Guide

## Changes Made

### 1. Backend Logging Added
- **File**: `backend/src/services/issueService.js`
  - Added comprehensive logging to track status update flow
  - Logs show: patch received, payload preparation, DB execution, status log insertion

- **File**: `backend/src/controllers/issueController.js`
  - Added request/response logging for updateIssue endpoint

### 2. Frontend Logging Added
- **File**: `frontend/authority-jira/src/services/issuesService.js`
  - Logs the normalized patch before sending to API

- **File**: `frontend/authority-jira/src/pages/IssueDetail.jsx`
  - Logs when save status is clicked and the result returned

### 3. Database Migration Required
- **File**: `backend/db/migrations/008_fix_issue_status_logs_fk.sql`
  - Fixes foreign key constraints to reference auth.users instead of public.users
  - This was causing the FK violation error (code 23503)

## How to Apply the Migration

### Option A: Using Supabase Dashboard (Recommended)
1. Go to https://app.supabase.com/project/[your-project-id]/sql
2. Click "New Query"
3. Copy the contents of `backend/db/migrations/008_fix_issue_status_logs_fk.sql`
4. Paste into the editor and click "Run"

### Option B: Using Supabase CLI
```bash
cd backend
supabase db push
```

## Testing the Fix

1. Start the backend:
   ```bash
   cd backend
   npm install
   npm run dev
   ```

2. Start the frontend:
   ```bash
   cd frontend/authority-jira
   npm install
   npm run dev
   ```

3. Open IssueDetail page for any issue

4. Change the status using the dropdown and click "Save Status"

5. Check browser console for logs:
   - `[IssueDetail] onSaveStatus called`
   - `[issuesService] updateIssue called`
   - `[issuesService] api response`

6. Check backend server logs for:
   - `[IssueController] updateIssue called`
   - `[IssueService] updateIssue called`
   - `[IssueService] database update result`
   - `[IssueService] status log result`

## Expected Behavior After Fix

✅ Issue status updates successfully
✅ Status change is logged in `issue_status_logs` table
✅ Frontend UI reflects the new status
✅ No FK constraint errors in logs
✅ No RLS policy violations

## Debugging

If the issue still doesn't update:
1. Check backend logs for error messages
2. Verify the migration was applied (check database schema)
3. Ensure auth token is valid in requests
4. Check if `users` vs `organization_members` profile issue (organization members use org_members table)

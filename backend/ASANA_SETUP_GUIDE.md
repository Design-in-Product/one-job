# Asana Integration Setup Guide

## Step 1: Get Your Personal Access Token

### Quick Steps:
1. Go to https://app.asana.com/
2. Click your profile photo (top right)
3. Select "My Settings"
4. Click "Apps" tab
5. Scroll to "Personal Access Tokens"
6. Click "New access token"
7. Name it: "OneJob Integration"
8. Click "Create token"
9. **COPY THE TOKEN** (you won't see it again!)

### What It Looks Like:
```
1/1234567890:abcdef1234567890abcdef1234567890
```

## Step 2: Test Your Token

Open terminal and run:
```bash
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  https://app.asana.com/api/1.0/users/me
```

Should return your user info.

## Step 3: Provide Token

Share the token securely and we'll:
1. Create Asana integration service
2. Add UI for importing tasks
3. Test with your actual Asana tasks
4. Set up the import flow

## Security Notes
- Token gives full access to your Asana account
- Store it safely
- Can revoke anytime in Asana settings
- OneJob will only READ tasks, never modify Asana

## What Will Be Imported
- ✅ Task title
- ✅ Task description (notes)
- ✅ Due date (if set)
- ✅ Project name (as context)
- ✅ Assigned tasks to you

## Not Imported
- ❌ Comments
- ❌ Attachments
- ❌ Subtasks (future enhancement)
- ❌ Custom fields

Ready when you are!


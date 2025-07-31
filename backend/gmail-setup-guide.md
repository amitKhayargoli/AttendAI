# Gmail SMTP Setup Guide

## 🚀 **Step 1: Enable 2-Factor Authentication**

1. **Go to:** https://myaccount.google.com/security
2. **Enable "2-Step Verification"** if not already enabled
3. **This is required** to create an App Password

## 🔑 **Step 2: Create App Password**

1. **Go to:** https://myaccount.google.com/apppasswords
2. **Select "Mail"** from the dropdown
3. **Select "Other (Custom name)"** 
4. **Enter name:** "AttendAI"
5. **Click "Generate"**
6. **Copy the 16-character password** (e.g., `abcd efgh ijkl mnop`)

## ⚙️ **Step 3: Update Environment Variables**

Add these to your `.env` file:

```env
EMAIL_USER="your-gmail@gmail.com"
EMAIL_PASSWORD="your-16-character-app-password"
```

**Example:**
```env
EMAIL_USER="amitkhayargoli16@gmail.com"
EMAIL_PASSWORD="abcd efgh ijkl mnop"
```

## 🧪 **Step 4: Test Email Sending**

1. **Restart your backend server**
2. **Try the password reset** with any email
3. **Check if emails are sent successfully**

## ✅ **Benefits of Gmail SMTP:**

- ✅ **No domain required**
- ✅ **Free** (Gmail's generous limits)
- ✅ **Reliable delivery**
- ✅ **Easy setup**
- ✅ **Works with any email address**

## 🚨 **Important Notes:**

- **Use App Password, not your regular Gmail password**
- **Remove spaces** from the App Password if needed
- **Keep the App Password secure**
- **Gmail has daily sending limits** (500 emails/day for regular accounts)

## 🔧 **Troubleshooting:**

### **If emails aren't sending:**
1. **Check App Password** - Make sure it's correct
2. **Check 2FA** - Must be enabled
3. **Check Gmail settings** - Allow less secure apps (if needed)
4. **Check server logs** - Look for error messages

### **If you get "Invalid credentials":**
1. **Regenerate App Password**
2. **Make sure 2FA is enabled**
3. **Use the exact 16-character password**

## 🎯 **Ready to Test:**

Once you've set up the environment variables, restart your backend and try the password reset! 🚀 
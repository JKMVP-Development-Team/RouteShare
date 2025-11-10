# RouteShare Service Testing Guide

This guide explains how to test your RouteShare service functions without running the full frontend application.

## **🎯 Testing Strategy Overview**

| Test Type | Emulators Required? | What it Tests | Commands |
|-----------|-------------------|---------------|----------|
| **Unit Tests** | ❌ No | Pure functions, business logic | `npm run test:unit` |
| **Integration Tests** | ✅ Yes | Firebase services + Cloud functions | `npm run test:integration` |

## **🚀 Quick Start**

### **Option 1: Just Unit Tests (Fastest)**
```bash
# Test pure functions (no setup required)
npm run test:unit
```

### **Option 2: Complete Testing (Recommended)**
```bash
# 1. Start Firebase emulators (separate terminal)
firebase emulators:start

# 2. Deploy cloud functions to emulator (for function testing)
cd functions
npm run build
firebase deploy --only functions

# 3. Run all tests
npm run test:integration
```

### **Option 3: Automated Testing Script**
```bash
# Windows
scripts\test-all.bat

# Linux/Mac  
scripts/test-all.sh
```

## **📋 Detailed Testing Breakdown**

### **1. Unit Tests (No Emulators)** ✅

Tests pure functions that don't require external services.

```bash
npm run test:unit           # Run LocationService tests
npm run test:location       # Just location functions
npm run test:coverage       # Get coverage report
```

**What's Tested:**
- ✅ **LocationService**: Distance calculations, map regions, coordinate formatting
- ✅ **Business logic**: Pure functions without Firebase dependencies
- ✅ **Error handling**: Edge cases and boundary conditions

### **2. Integration Tests (Emulators Required)** 🔥

Tests services that interact with Firebase and your cloud functions.

#### **Prerequisites:**
```bash
# Terminal 1: Start emulators
firebase emulators:start

# Terminal 2: Deploy functions (for cloud function testing)
cd functions
npm run build
firebase deploy --only functions
```

#### **Run Tests:**
```bash
npm run test:integration    # All integration tests
npm run test:auth          # Just authentication
```

**What's Tested:**
- 🔐 **AuthService**: Sign up, sign in, sign out, password reset
- 🔥 **Firestore Operations**: NavigationService database operations
- ⚡ **Cloud Functions**: PartyService, FriendService function calls
- 🌐 **Real Firebase SDK**: Actual Firebase behavior (against emulators)

## **🛠️ Service-Specific Testing**

### **LocationService** 📍 (Unit Tests)
```bash
npm run test:location
```
**No emulators needed** - Pure functions only.

**Test Coverage:**
- Distance calculations between coordinates
- Map region calculations for multiple points
- Coordinate formatting
- Edge cases (empty arrays, single points)

### **AuthService** 🔐 (Integration Tests)
```bash
# Requires: Auth emulator (port 9099)
firebase emulators:start
npm run test:auth
```

**Test Coverage:**
- User registration with email/password
- User sign in/sign out
- Profile updates
- Error handling (duplicate emails, invalid passwords)

### **NavigationService** 🧭 (Both Unit + Integration)
```bash
# Unit tests (mocked Firebase)
npm run test:navigation

# Integration tests (real Firestore emulator)
firebase emulators:start
npm run test:integration
```

**Test Coverage:**
- Navigation session management
- Route progress tracking
- Firestore document operations
- Real-time subscriptions

### **PartyService** 🎉 (Integration Tests)
```bash
# Requires: Functions emulator + deployed functions
firebase emulators:start
cd functions && npm run build && firebase deploy --only functions
npm run test:integration
```

**Test Coverage:**
- Party creation via cloud functions
- Party joining/leaving
- Member management
- Function error handling

### **FriendService** 👥 (Integration Tests)
```bash
# Requires: Functions emulator + deployed functions  
firebase emulators:start
cd functions && npm run build && firebase deploy --only functions
npm run test:integration
```

**Test Coverage:**
- Friend request sending/accepting
- Friend suggestions
- User search functionality
- Function error handling

## **🔧 Setup Requirements**

### **For Unit Tests Only:**
- ✅ Jest installed (already done)
- ✅ TypeScript support configured

### **For Integration Tests:**
- ✅ Firebase CLI installed
- ✅ Firebase emulators configured
- ✅ Cloud functions deployed to emulator (for function testing)
- ✅ Environment variables in `.env` file

### **Emulator Setup:**
```bash
# Install Firebase CLI (if not installed)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Start emulators
firebase emulators:start
```

### **Cloud Functions Setup:**
```bash
# Build and deploy functions to emulator
cd functions
npm install
npm run build
firebase deploy --only functions

# Verify functions are deployed
curl http://localhost:5001/routeshare-b1b01/us-central1/createParty
```

## **📊 Test Results & Coverage**

### **View Coverage Reports:**
```bash
npm run test:coverage
open coverage/lcov-report/index.html  # Mac/Linux
start coverage/lcov-report/index.html # Windows
```

### **Understanding Test Output:**
```bash
✅ PASS - Test passed
❌ FAIL - Test failed  
⚠️ SKIP - Test skipped (usually due to missing emulators)
🔧 MOCK - Using mocked Firebase (unit tests)
🔥 REAL - Using real Firebase emulators (integration tests)
```

## **🐛 Troubleshooting**

### **Unit Tests Failing?**
```bash
# Run with verbose output
npx jest --verbose tests/location.test.ts

# Run single test
npx jest --testNamePattern="should calculate distance"

# Clear Jest cache
npx jest --clearCache
```

### **Integration Tests Failing?**

#### **"Cannot connect to emulator" errors:**
```bash
# Check emulator status
firebase emulators:list

# Restart emulators
firebase emulators:start --import=./emulator-data --export-on-exit
```

#### **"Function not found" errors:**
```bash
# Deploy functions to emulator
cd functions
npm run build
firebase deploy --only functions

# Check if functions are deployed
curl http://localhost:5001/routeshare-b1b01/us-central1/createParty
```

#### **"Auth operation failed" errors:**
```bash
# Check Auth emulator
curl http://localhost:9099

# Visit emulator UI
open http://localhost:4000
```

### **Environment Issues:**
```bash
# Check environment variables
echo $EXPO_PUBLIC_FIREBASE_API_KEY  # Linux/Mac
echo %EXPO_PUBLIC_FIREBASE_API_KEY% # Windows

# Run with explicit env file
node --env-file=.env tests/integration-test.mjs
```

## **🎯 Testing Best Practices**

### **✅ Do:**
- Run unit tests frequently during development
- Use integration tests before deploying
- Test error scenarios and edge cases
- Keep emulators running during development
- Use test coverage to identify untested code

### **❌ Don't:**
- Test against production Firebase
- Skip testing pure functions (they're easiest!)
- Commit coverage reports to git
- Run integration tests without emulators
- Test UI components when you just want to test services

## **📈 CI/CD Integration (Jenkins/GitHub Actions)**

### **For Jenkins:**
```groovy
pipeline {
    stages {
        stage('Unit Tests') {
            steps {
                sh 'npm run test:unit'
            }
        }
        stage('Integration Tests') {
            steps {
                sh 'firebase emulators:exec "npm run test:integration"'
            }
        }
    }
}
```

### **For GitHub Actions:**
```yaml
- name: Run Unit Tests
  run: npm run test:unit

- name: Run Integration Tests  
  run: |
    firebase emulators:start --detached
    npm run test:integration
    firebase emulators:stop
```

## **🎉 You're All Set!**

Your RouteShare services are now comprehensively testable:

1. **Fast feedback** with unit tests
2. **Full validation** with integration tests  
3. **Cloud function testing** via emulators
4. **No frontend dependencies** required

Happy testing! 🚀
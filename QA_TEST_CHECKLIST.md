# One Job QA Test Checklist
**Date**: 2025-08-03  
**Version**: 1.0.0  
**Environment**: https://onejob.co (Demo Mode)

## Test Setup
- [ ] Clear browser cache and localStorage
- [ ] Open browser developer console
- [ ] Test on mobile device (if available)
- [ ] Note browser and OS version

---

## 🎯 Core Functionality Tests

### 1. Card Creation Flow
**Test ID**: CORE-001  
**Priority**: CRITICAL

- [ ] **Empty State Creation**
  1. Clear all tasks (or start fresh)
  2. Click "Add Task" button
  3. Enter title: "Test Task 1"
  4. Enter description: "Test description"
  5. Click "Add Task"
  - **Expected**: Card appears immediately
  - **Actual**: _______________
  - **Console Errors**: Y/N

- [ ] **Multiple Card Creation**
  1. With existing card visible, click "Add Task"
  2. Enter title: "Test Task 2"
  3. Click "Add Task"
  4. Repeat for "Test Task 3"
  - **Expected**: New card appears on top of stack
  - **Actual**: _______________
  - **Console Errors**: Y/N

- [ ] **Creation After Completion**
  1. Complete all existing tasks (swipe right)
  2. Switch to Active tab
  3. Add new task
  - **Expected**: Card appears in Active tab
  - **Actual**: _______________
  - **Console Errors**: Y/N

### 2. Swipe Gestures
**Test ID**: CORE-002  
**Priority**: CRITICAL

- [ ] **Complete Task (Right Swipe)**
  1. Create test task
  2. Swipe card to the right
  - **Expected**: Card animates right, disappears, marked complete
  - **Actual**: _______________
  - **Mobile Works**: Y/N

- [ ] **Defer Task (Left Swipe)**
  1. Create 3 test tasks
  2. Swipe top card to the left
  - **Expected**: Card moves to bottom of stack
  - **Actual**: _______________
  - **Mobile Works**: Y/N

- [ ] **Tap to Open Details**
  1. Tap on card (don't swipe)
  - **Expected**: Task details modal opens
  - **Actual**: _______________
  - **Can Edit**: Y/N

### 3. Tab Navigation
**Test ID**: CORE-003  
**Priority**: HIGH

- [ ] **Active to Completed Switch**
  1. Complete 2 tasks
  2. Click "Completed" tab
  - **Expected**: Shows completed tasks with timestamps
  - **Actual**: _______________
  - **Any Errors**: Y/N

- [ ] **Completed to Active Switch**
  1. From Completed tab, click "Active"
  - **Expected**: Shows remaining active tasks
  - **Actual**: _______________
  - **State Preserved**: Y/N

### 4. Substack Operations
**Test ID**: CORE-004  
**Priority**: HIGH

- [ ] **Create Substack**
  1. Open task details
  2. Click "Add Substack"
  3. Enter name: "Test Substack"
  - **Expected**: Substack created and visible
  - **Actual**: _______________

- [ ] **Add Tasks to Substack**
  1. Click into substack
  2. Add 2 tasks within substack
  - **Expected**: Tasks appear in substack
  - **Actual**: _______________

- [ ] **Navigate In/Out**
  1. Click into substack
  2. Click back to main task
  - **Expected**: Smooth navigation, state preserved
  - **Actual**: _______________

---

## 🐛 Regression Tests

### 5. Instructions Panel
**Test ID**: REG-001  
**Priority**: MEDIUM

- [ ] **Dismiss via X Button**
  1. Reload page (panel should appear)
  2. Click × button
  - **Expected**: Panel disappears permanently
  - **Actual**: _______________

- [ ] **Dismiss via Outside Click**
  1. Clear localStorage, reload
  2. Click outside instructions panel
  - **Expected**: Panel disappears
  - **Actual**: _______________

### 6. Data Persistence
**Test ID**: REG-002  
**Priority**: HIGH

- [ ] **Reload Persistence**
  1. Create 3 tasks
  2. Complete 1, defer 1
  3. Reload page
  - **Expected**: All states preserved
  - **Actual**: _______________

- [ ] **Tab State Persistence**
  1. Switch to Completed tab
  2. Reload page
  - **Expected**: Stays on Completed tab
  - **Actual**: _______________

---

## 🎨 UI/UX Tests

### 7. Visual Consistency
**Test ID**: UI-001  
**Priority**: MEDIUM

- [ ] **Card Styling**
  - Cards have consistent shadows: Y/N
  - Text is readable: Y/N
  - Swipe hints visible: Y/N

- [ ] **Mobile Responsiveness**
  - Cards fit screen width: Y/N
  - No horizontal scroll: Y/N
  - Touch targets adequate size: Y/N

- [ ] **Animation Smoothness**
  - Swipe animations smooth: Y/N
  - No jank/stuttering: Y/N
  - Defer animation works: Y/N

---

## 🔴 Critical Bug Report

### New Card Not Appearing Bug
**Test ID**: BUG-001  
**Status**: ACTIVE

**Steps to Reproduce**:
1. _______________
2. _______________
3. _______________

**Expected**: New card appears immediately after creation
**Actual**: _______________

**Additional Context**:
- Browser: _______________
- When it happens: _______________
- Console errors: _______________
- Network tab shows API call?: _______________

---

## Test Summary

**Total Tests**: 20  
**Passed**: ___  
**Failed**: ___  
**Blocked**: ___

**Critical Issues**:
1. _______________
2. _______________

**Notes**:
_______________

**Tested By**: _______________  
**Date/Time**: _______________
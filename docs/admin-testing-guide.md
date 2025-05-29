# Apply4Me Admin Testing Guide

## 👥 Admin Team Testing Instructions

### Admin User Accounts

**Primary Test Accounts:**
- **Super Admin**: `bhntshwcjc025@student.wethinkcode.co.za`
- **Admin**: `admin@apply4me.co.za`
- **Backup Admin**: `bhekumusa@apply4me.co.za`

### Testing Checklist

#### ✅ **Phase 1: Access Testing**

1. **Admin Interface Access**
   - [ ] Navigate to: `https://your-domain.com/admin/test-users`
   - [ ] Verify authentication is required (should redirect to login)
   - [ ] Login with admin credentials
   - [ ] Confirm access to admin interface

2. **API Authentication Testing**
   - [ ] Test: `curl https://your-domain.com/api/admin/users`
   - [ ] Should return 401 Unauthorized without authentication
   - [ ] Verify production security is working

#### ✅ **Phase 2: Admin User Management**

1. **Add New Admin User**
   - [ ] Click "Add Admin User" button
   - [ ] Enter test email: `test-admin@apply4me.co.za`
   - [ ] Select role: "admin"
   - [ ] Click "Add User"
   - [ ] Verify success message appears
   - [ ] Check user appears in admin list

2. **List Admin Users**
   - [ ] Verify all existing admin users are displayed
   - [ ] Check user roles are correct
   - [ ] Confirm user count is accurate
   - [ ] Test refresh functionality

3. **Remove Admin User**
   - [ ] Find test user in list
   - [ ] Click "Remove" button
   - [ ] Confirm removal dialog
   - [ ] Verify user is removed from list
   - [ ] Check success notification

#### ✅ **Phase 3: Database Persistence**

1. **Database Verification**
   - [ ] Add a new admin user
   - [ ] Refresh the page
   - [ ] Verify user still appears (database persistence)
   - [ ] Check user data is complete

2. **Cross-Session Testing**
   - [ ] Add user in one browser session
   - [ ] Open new browser/incognito window
   - [ ] Login and verify user appears
   - [ ] Test data consistency

#### ✅ **Phase 4: Error Handling**

1. **Invalid Email Testing**
   - [ ] Try adding user with invalid email format
   - [ ] Verify error message appears
   - [ ] Confirm user is not added

2. **Duplicate User Testing**
   - [ ] Try adding existing admin email
   - [ ] Verify appropriate error handling
   - [ ] Check no duplicate entries created

3. **Network Error Testing**
   - [ ] Disconnect internet briefly
   - [ ] Try adding user
   - [ ] Verify graceful error handling
   - [ ] Test retry functionality

### Testing Scenarios

#### **Scenario A: New Admin Onboarding**
1. Super admin adds new team member
2. New admin receives access credentials
3. New admin logs in and tests interface
4. New admin adds another test user
5. Verify all operations work correctly

#### **Scenario B: Admin Role Management**
1. Test different permission levels
2. Verify role-based access control
3. Test admin vs super admin capabilities
4. Confirm security boundaries

#### **Scenario C: Production Load Testing**
1. Multiple admins login simultaneously
2. Perform concurrent user operations
3. Test system performance under load
4. Verify data consistency

### Expected Results

#### **✅ Success Indicators:**
- All admin users can access the interface
- User addition/removal works smoothly
- Database persistence is reliable
- Error handling is graceful
- Performance is responsive (< 2 seconds)

#### **❌ Issues to Report:**
- Authentication failures
- Database connection errors
- UI/UX problems
- Performance issues
- Data inconsistencies

### Reporting Issues

**Issue Report Template:**
```
**Issue**: Brief description
**Steps to Reproduce**: 
1. Step one
2. Step two
3. Step three

**Expected Result**: What should happen
**Actual Result**: What actually happened
**Browser**: Chrome/Firefox/Safari version
**Admin Account**: Which admin account was used
**Timestamp**: When the issue occurred
**Screenshots**: If applicable
```

**Report Issues To:**
- **Technical Lead**: bhntshwcjc025@student.wethinkcode.co.za
- **Admin Support**: admin@apply4me.co.za

### Testing Schedule

**Week 1: Core Functionality**
- Day 1-2: Access and authentication testing
- Day 3-4: User management operations
- Day 5: Database persistence verification

**Week 2: Advanced Testing**
- Day 1-2: Error handling and edge cases
- Day 3-4: Performance and load testing
- Day 5: Final verification and sign-off

### Success Criteria

Testing is complete when:
- [ ] All admin users can access the system
- [ ] User management operations work reliably
- [ ] Database persistence is confirmed
- [ ] Error handling is appropriate
- [ ] Performance meets requirements
- [ ] Security measures are effective
- [ ] All issues are documented and resolved

### Post-Testing Actions

After successful testing:
1. **Document any configuration changes needed**
2. **Update admin user list if necessary**
3. **Confirm production readiness**
4. **Schedule regular admin training sessions**
5. **Set up monitoring and alerts**

---

**🎯 Goal**: Ensure the admin system is production-ready and all admin team members are comfortable using it.

# Multi-User Account Support for Innovation Sandbox on AWS

## Outline



1. Motivation
2. Proposed Change
3. Design Constraints
4. New or Changed Design Aspects
5. Migration Plan and Compatibility
6. Rejected Alternatives
7. Metrics
8. Known Limitations
9. Appendices

* * *

## 1. Motivation

### Problem Statement

Currently, Innovation Sandbox on AWS operates on a single-user model where each lease (sandbox account) can only be accessed by the original requester. This creates significant collaboration barriers:


* **Team Isolation**: Development teams cannot share sandbox environments for collaborative work
* **Resource Inefficiency**: Multiple team members request separate sandbox accounts for the same project, leading to resource waste
* **Knowledge Silos**: Team members cannot easily share configurations, experiments, or troubleshoot issues together
* **Administrative Overhead**: Managers cannot access team members' sandbox accounts for oversight or assistance

### Supporting Data

Based on user feedback and usage patterns:

* A customer has contracted the proserv team to fork the github repo and implement this feature for them

### Business Impact

Without multi-user support:

* Reduced team productivity and collaboration effectiveness
* Increased AWS costs due to duplicate sandbox environments
* Higher administrative burden on IT teams
* Slower innovation cycles due to collaboration friction

## 2. Proposed Change

### Feature Overview

Implement multi-user account support that allows lease owners and administrators to add multiple users to a single sandbox account, enabling collaborative access while maintaining proper security controls and audit trails.
The proposed feature is a way to allow a user to "share" their lease with other users but retain full ownership over the lease. So the other users are just given a role to sign into the account, they do not have access to return the lease early.


### Key Capabilities

1. **User Management**: Add/remove users from existing leases and also add users on a new lease request., also add
2. **Access Control**: Role-based permissions for user management
3. **Audit Trail**: Complete history of user additions/removals
4. **Shared Discovery**: Users can discover and access shared leases from their home dashboard

### User Experience Goals

* Seamless collaboration without compromising security
* Clear visibility into shared access status
* Intuitive user management interface
* Consistent experience across owned and shared leases

## 3. Design Constraints

### Technical Constraints

* **AWS SSO Integration**: Must work within existing AWS Identity Center architecture

### Security Constraints

* **Identity Center Dependency**: Users must exist in the organization's Identity Center before assignment
* **Permission Set Limitations**: All users in a lease receive the permissions that is assigned to their group, if the user that is shared to a lease is part of the manager group, he will get the manager permissions set.
* **Audit Requirements**: All user management actions must be logged and traceable

### Business Constraints

* **Backward Compatibility**: Existing single-user leases must continue to function unchanged
* **No Breaking Changes**: Current API contracts must remain intact
* **Cost Considerations**: Additional Lambda functions and API calls must not significantly impact solution cost

### External Dependencies

* **AWS Identity Center**: Core dependency for user management and access control
* **AWS Organizations**: Required for account management and permission sets
* **CloudScape Design System**: UI components must follow existing design patterns

## 4. New or Changed Design Aspects

### 4.1 High-Level Architecture

[Image: image.png]

#### Enhanced Lease Schema

```
interface Lease {
  // Existing fields...
  uuid: string;
  userEmail: string;
  status: LeaseStatus;
  awsAccountId: string;
  
  // New multi-user fields
  users?: SandboxUser[];
}

interface SandboxUser {
  userEmail: string;
  addedBy: string;
  addedDate: string;
  assignmentStatus?: {
    status: 'SUCCEEDED' | 'FAILED';
    message?: string;
    lastUpdated: string;
  };
}
```



### 4.3 API Design

#### New Endpoints

```
// Get users for a lease
GET /leases/{leaseId}/users
Response: SandboxUser[]

// Add user to lease
POST /leases/{leaseId}/users
Body: { userEmail: string }
Response: { status: 'SUCCEEDED' | 'FAILED' }

// Remove user from lease
DELETE /leases/{leaseId}/users?userEmail={email}
Response: { success: boolean }

// Get shared leases for current user
GET /leases/shared
Response: SharedLease[]
```



### 4.4 User Interface Components

#### Users Tab (Lease Details Page)

* **User List**: Display all users with status indicators
* **Add User Form**: Email input with validation, only emails that are part of the IDC groups will be allowed

#### Enhanced Home Dashboard

* **"Shared with Me" Section**: Display leases where user has been added
* **Status Indicators**: Clear visual distinction between owned and shared leases
* **Quick Access**: Direct login buttons for ready accounts

### 4.5 Sequence Diagram - Add User Flow

[Image: image.png]

### 4.6 Infrastructure Components

#### New Lambda Function

* **Name**: UsersLambdaFunction
* **Runtime**: Node.js 22.x
* **Environment Variables**:
* `LEASE_TABLE_NAME`
* `IDENTITY_STORE_ID`
* `SSO_INSTANCE_ARN`
* `INTERMEDIATE_ROLE_ARN`
* `IDC_ROLE_ARN`

#### IAM Permissions

```
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "identitystore:DescribeUser",
        "identitystore:ListUsers",
        "sso-admin:CreateAccountAssignment",
        "sso-admin:DeleteAccountAssignment",
        "sso-admin:ListAccountAssignments"
      ],
      "Resource": "*"
    }
  ]
}
```



## 5. Migration Plan and Compatibility

### 5.1 Backward Compatibility

* **Existing Leases**: All current single-user leases continue to function unchanged
* **API Compatibility**: Existing API endpoints remain unchanged; new endpoints are additive
* **Database Schema**: New `users` field is optional and defaults to empty array
* **UI Compatibility**: Existing lease management flows remain identical

### 5.2 Deployment Strategy

#### Phase 1: Infrastructure Deployment

1. Deploy new Users Lambda function
2. Update API Gateway with new routes
3. Deploy database schema changes (additive only)
4. Verify backend functionality with integration tests

#### Phase 2: Frontend Deployment

1. Deploy new UI components
2. Conduct user acceptance testing
3. Gradually roll out to all users

#### Phase 3: Data Migration

1. Existing leases automatically include owner in `users` array on first access
2. No data migration required - changes are additive
3. Background process to populate owner information (optional)

### 5.3 Rollback Plan

* Update the CFN stack with the old template and revert any state
* **Database Rollback**: Complex

## 6. Rejected Alternatives

### 6.1 Granular Role-Based Permissions

**Approach**: Different permission levels for different users within a lease
**Rejection Reason**:

* Significant complexity in permission set management
* AWS SSO limitations in dynamic permission set creation
* Increased support burden and user confusion
* Timeline constraints for initial release

## 7. Metrics

### 7.1 Feature Adoption Metrics

* **Multi-user Lease Creation Rate**: Percentage of leases with multiple users
* **Average Users per Lease**: Mean number of users added to multi-user leases
* **User Addition Success Rate**: Percentage of successful user assignments
* **Time to Assignment**: Average time for user access to become active

### 7.2 Operational Metrics

* **Assignment Failure Rate**: Percentage of failed user assignments by error type
* **API Response Times**: P50, P95, P99 for user management endpoints
* **Lambda Function Performance**: Duration, memory usage, error rates
* **DynamoDB Performance**: Read/write capacity utilization, throttling events

### 7.3 Business Impact Metrics

* **Resource Utilization**: Reduction in duplicate sandbox account requests
* **Collaboration Effectiveness**: User satisfaction scores for team-based work
* **Support Ticket Reduction**: Decrease in access-related support requests
* **Cost Optimization**: Savings from reduced account provisioning

### 7.4 CloudWatch Dashboards

```
{
  "widgets": [
    {
      "type": "metric",
      "properties": {
        "metrics": [
          ["AWS/Lambda", "Duration", "FunctionName", "UsersLambdaFunction"],
          ["AWS/Lambda", "Errors", "FunctionName", "UsersLambdaFunction"],
          ["AWS/DynamoDB", "ConsumedReadCapacityUnits", "TableName", "LeaseTable"]
        ],
        "period": 300,
        "stat": "Average",
        "region": "us-east-1",
        "title": "Multi-User Feature Performance"
      }
    }
  ]
}
```



## 8. Known Limitations

### 8.1 AWS Service Limitations

* ~~**Identity Center Propagation**: User assignments take 2-5 minutes to become active~~
* **Permission Set Constraints**: All users receive identical permissions within a lease
* **Account Assignment Limits**: AWS SSO has quotas on concurrent assignment operations
* **Cross-Region Limitations**: Identity Center must be in the same region as the solution

### 8.2 Solution Constraints

* **Maximum Users per Lease**: ~~~100~~ 20 users due to DynamoDB item size limits (400KB)
* **Assignment Retry Logic**: Failed assignments require manual retry or owner intervention
* **Bulk Operations**: Limited to 10 concurrent user assignments to avoid API throttling
* **Real-time Updates**: Status updates rely on polling, not real-time push notifications

### 8.3 User Experience Limitations

* **Assignment Delays**: Users must wait 2-5 minutes for access after being added
* **Error Resolution**: Some assignment failures require administrator intervention
* **Permission Visibility**: Users cannot see what specific permissions they'll receive
* **Offline Capability**: Feature requires internet connectivity for all operations

### 8.4 Security Considerations

* **Identity Verification**: No additional verification beyond email address matching
* **Access Revocation**: Removing users from leases doesn't immediately revoke AWS access
* **Audit Granularity**: User actions within AWS accounts are not tracked by the solution
* **Cross-Account Risks**: Shared accounts may expose sensitive resources to multiple users

## 9. Appendices

### 9.1 Doc Data/Change Log

|	|	|	|	|
|---	|---	|---	|---	|
|	|	|	|	|
|	|	|	|	|



### 9.2 FAQ

**Q: How is a user added to a lease in the UI?**
A: A free form field will be added in the users tab to enter the new users email address, the user email will need to be part of the IdC to be added.

**Q: Can users have different permission levels within the same lease?**
A: No, all users within a lease receive identical permissions. Granular role-based permissions are planned for a future release.

**Q: What happens if a user is removed from Identity Center after being added to a lease?**
A: The user will show as "FAILED" status in the lease, and the lease owner will need to remove them manually.

**Q: Can users be added to expired leases?**
A: No, users can only be added to active leases. Expired leases are read-only.

**Q: Is there a limit to how many leases a user can be added to?**
A: There's no solution-imposed limit, but AWS Identity Center has quotas on the total number of account assignments per user.

**Q: How are costs affected by multi-user support?**
A: The feature adds minimal infrastructure costs (one additional Lambda function). The main cost impact is from shared usage of existing sandbox accounts.


### 9.3 Glossary

* **Assignment Status**: The current state of a user's access to a sandbox account (SUCCEEDED, FAILED)
* **Identity Center**: AWS's centralized identity service (formerly AWS SSO)
* **Lease**: A time-bound allocation of a sandbox AWS account to a user or team
* **Permission Set**: A collection of AWS permissions that define what actions users can perform
* **Sandbox Account**: An isolated AWS account used for experimentation and development
* **Shared Lease**: A lease where multiple users have been granted access
* **User Assignment**: The process of granting a user access to a specific AWS account through Identity Center


# Database Schema Design - Blurr HR Management Portal

## Requirements Analysis
- Employee management with personal details and salary information
- Project management with tasks assignment
- Task tracking with different views (Kanban, backlog)
- User authentication with role-based access control

## Schema Design Decisions

### User Model
- Extended the default NextAuth user model with role field
- Roles: ADMIN, MANAGER, EMPLOYEE
- Authentication using email/password credentials

### Employee Model
- Separate from User to keep authentication concerns separate from employee data
- One-to-one relation with User model
- Includes fields for personal details, job information, and relationship to salary records

### Project Model
- Contains basic project information
- Has one-to-many relationship with tasks

### Task Model
- Includes priority, status, assignment information
- Linked to both projects and assigned employees
- Supports status-based grouping for Kanban view

### Salary Model
- Monthly salary records for each employee
- Includes base salary, bonuses, and deductions
- Supports historical tracking and analysis

## Relationship Overview
- User ↔ Employee: One-to-one
- Employee ↔ Salary: One-to-many
- Project ↔ Task: One-to-many
- Employee ↔ Task: One-to-many (assignment)

## Notes for Future Expansion
- Consider adding Department and Position models for larger organizations
- Plan for time tracking integration
- Consider performance evaluation metrics

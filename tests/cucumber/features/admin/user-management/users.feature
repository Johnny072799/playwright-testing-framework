@user-management
@regression

Feature: OrangeHRM User Management

Background:
  Given I am a valid user
  And I attempt to login to the OrangeHRM portal

@smoke
Scenario: I can add an ESS user to the system
  Given An ESS user is added to the system
  And I navigate to the admin side navigation item
  And I get a valid username for the ESS user
  When I add an ESS user
  Then I verify I see the ESS user added successfully

Scenario Outline: I cannot add a user without completing all required fields
  Given <TEST CASE>
  And I navigate to the admin side navigation item
  And I get a valid username for the ESS user
  When I add an ESS user
  Then I verify I see the field error message: <ERROR MESSAGE>

  Examples:
    | TEST CASE                              | ERROR MESSAGE           |
    | I do not complete the user role        | Required                |
    | I do not complete the employee name    | Required                |
    | I do not complete the status           | Required                |
    | I do not complete the username         | Required                |
    | I do not complete the password         | Passwords do not match  |
    | I do not complete the confirm password | Passwords do not match  |
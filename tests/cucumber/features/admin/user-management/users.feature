@regression

Feature: OrangeHRM User Management

Background:
  Given I am a valid user
  And I login to the OrangeHRM portal

@my-test
Scenario: I can add an ESS user with valid credentials
  Given An ESS user is added to the system
  When I navigate to the admin side navigation item
  Then I get a valid username for the ESS user
  And I add an ESS user
  Then I verify I see the ESS user added successfully
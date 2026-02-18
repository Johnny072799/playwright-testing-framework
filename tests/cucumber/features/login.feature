@smoke
@login

Feature: OrangeHRM Portal Login

@valid-credentials
  Scenario: Validate login to the OrangeHRM portal with valid credentials
    Given I have valid credentials
    Then I login to the OrangeHRM portal

@invalid-credentials
  Scenario Outline: Validate login to the OrangeHRM portal with invalid credentials: <TEST USER>
    Given <TEST USER> 
    And I attempt to login to the OrangeHRM portal
    Then I should see the error message: <ERROR MESSAGE>

    Examples:
      | TEST USER                        | ERROR MESSAGE       |
      | I do not have a valid username   | Invalid credentials |
      | I do not have a valid password   | Invalid credentials |
      # | I do not have a username       | Invalid credentials |
      # | I do not have a password       | Invalid credentials |
@smoke
@login

Feature: OrangeHRM Portal Login

  Scenario: I am able to login to the OrangeHRM portal
    Given I login to the OrangeHRM portal

@invalid-credentials
  Scenario Outline: Validate login with invalid credentials: <TEST USER>
    Given <TEST USER>
    Then I should see the error message: <ERROR MESSAGE>

    Examples:
      | TEST USER                          | ERROR MESSAGE       |
      | I login with an invalid username   | Invalid credentials |
      | I login with an invalid password   | Invalid credentials |
      # | I login with a blank username      | Invalid credentials |
      # | I login with a blank password      | Invalid credentials |
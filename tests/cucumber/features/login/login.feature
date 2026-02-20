@regression
@login

Feature: OrangeHRM Portal Login

@valid-credentials
@smoke
  Scenario: Validate login to the OrangeHRM portal with valid credentials
    Given I am a valid user
    Then I login to the OrangeHRM portal

@invalid-credentials
  Scenario Outline: Validate login to the OrangeHRM portal with invalid credentials: <TEST USER>
    Given <TEST USER> 
    And I attempt to login to the OrangeHRM portal
    Then I verify I see the error message: <ERROR MESSAGE>

    Examples:
      | TEST USER                        | ERROR MESSAGE       |
      | I do not have a valid username   | Invalid credentials |
      | I do not have a valid password   | Invalid credentials |

@blank-required-fields
  Scenario Outline: Validate login to the OrangeHRM portal with blank required fields: <TEST USER>
    Given <TEST USER>
    And I attempt to login to the OrangeHRM portal
    Then I verify I see the field error message: <FIELD ERROR MESSAGE>

    Examples:
      | TEST USER                  | FIELD ERROR MESSAGE |
      | I do not have a username   | Required            |
      | I do not have a password   | Required            |

@login
@regression

Feature: OrangeHRM Forgot Password

@forgot-password
  Scenario: User can navigate to the forgot password page
    Given I am on the OrangeHRM login page
    When I click the forgot password link
    Then I verify I see the forgot password page

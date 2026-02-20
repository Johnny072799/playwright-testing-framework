@smoke

Feature: Example homepage

@my-tag
  Scenario: Open the homepage and verify the title contains "Example"
    Given I open the homepage
    Then the page title should contain "Google"


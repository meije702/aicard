Feature: Recipe running
  As a user who wants to run a recipe,
  I want the system to check my kitchen and execute steps in order
  so that the automation works as described.

  Scenario: Check readiness when equipment is missing
    Given a recipe that needs "Shopify" and "Gmail"
    And a kitchen with no equipment
    When I check recipe readiness
    Then the recipe should not be ready
    And the missing equipment should include "Shopify"
    And the missing equipment should include "Gmail"

  Scenario: Check readiness when equipment is connected
    Given a recipe that needs "Shopify"
    And a kitchen with connected "Shopify"
    When I check recipe readiness
    Then the recipe should be ready

  Scenario: Detect wait steps in a recipe
    Given a recipe with a "wait" step
    Then the recipe should have wait steps

  Scenario: Detect no wait steps when absent
    Given a recipe with a "listen" step
    Then the recipe should not have wait steps

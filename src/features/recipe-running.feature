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

  Scenario: Listen card pauses and collects event data from the user
    Given a Listen step listening for "new order" from "Shopify"
    And a kitchen with connected "Shopify"
    When I run the step with the user entering "customer email" as "maria@shop.com" and "order number" as "#1042"
    Then the step should succeed
    And the step output should include "customer email" with value "maria@shop.com"
    And the step output should include "order number" with value "#1042"

  Scenario: Send Message composes an email and hands it off
    Given a Send Message step to "maria@shop.com" with subject "Thank you" and message "We appreciate your order"
    And a kitchen with connected "Gmail"
    When I run the step in headless mode
    Then the step should succeed
    And the step result should say "Opened" not "sent"
    And the step output should include "to" with value "maria@shop.com"

  Scenario: Config override takes effect when step runs
    Given a Wait step configured for "999 days"
    And a kitchen with no equipment
    When I run the step with a config override of "how long" set to "1 second"
    Then the recipe should complete successfully
    And the step should complete in under 5 seconds

  Scenario: Sub-recipe step is parsed without error and skipped at runtime
    Given a recipe with a sub-recipe step named "Notify team" calling "Alert Recipe"
    And a kitchen with no equipment
    When I run the recipe
    Then the recipe should complete successfully
    And the sub-recipe step should have status "skipped"

  Scenario: Step description reflects tweaked config at runtime
    Given a Wait step configured for "999 days"
    And a kitchen with no equipment
    When I run the step with a config override of "how long" set to "2 seconds"
    Then the recipe should complete successfully
    And the step description should include "2 seconds"

  Scenario: Invalid wait duration fails with a user-facing message
    Given a Wait step configured for "five days"
    And a kitchen with no equipment
    When I run the recipe
    Then the step should have status "failed"
    And the step result should include "Couldn't understand"

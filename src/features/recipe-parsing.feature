Feature: Recipe parsing
  As a user who has downloaded a recipe file,
  I want the system to parse it correctly
  so that I can see and run the recipe in my kitchen.

  Scenario: Parse a complete recipe
    Given a recipe file "recipes/thank-you-follow-up.recipe.md"
    When I parse the recipe
    Then the recipe name should be "Thank You Follow-Up"
    And the recipe should have a purpose
    And the recipe should have 3 steps
    And the recipe should have no errors

  Scenario: Parse the kitchen equipment list
    Given a recipe file "recipes/thank-you-follow-up.recipe.md"
    When I parse the recipe
    Then the kitchen should require "Shopify"
    And the kitchen should require "Gmail"

  Scenario: Parse card steps with settings
    Given a recipe file "recipes/thank-you-follow-up.recipe.md"
    When I parse the recipe
    Then step 1 should use the "listen" card
    And step 1 should be named "Listen for a new order"
    And step 2 should use the "wait" card
    And step 3 should use the "send-message" card

  Scenario: Parse step configuration values
    Given a recipe file "recipes/thank-you-follow-up.recipe.md"
    When I parse the recipe
    Then step 2 should have setting "how long" with value "3 days"

  Scenario: Parse a multi-step community recipe
    Given a recipe file "recipes/community-message-router.recipe.md"
    When I parse the recipe
    Then the recipe name should be "Community Message Router"
    And the recipe should have 2 steps
    And the kitchen should require "Discord"

  Scenario: Handle a recipe with no kitchen section
    Given recipe text:
      """
      # Minimal Recipe
      > A recipe with no kitchen section.
      ## Steps
      ### 1. Wait
      *Card: Wait*
      - How long: 1 hour
      """
    When I parse the recipe
    Then the kitchen should be empty
    And the recipe should have 1 steps

  Scenario: Report an error when the title is missing
    Given recipe text:
      """
      > A recipe with no title.
      ## Steps
      ### 1. Wait
      *Card: Wait*
      - How long: 1 hour
      """
    When I parse the recipe
    Then the recipe name should be ""
    And the recipe should have errors

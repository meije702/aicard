Feature: Kitchen state management
  As a user setting up my kitchen,
  I want to add and remove equipment
  so that my recipes can find what they need.

  Scenario: Start with an empty kitchen
    Given a new kitchen
    Then the kitchen should have 0 pieces of equipment
    And the kitchen should have 0 recipes

  Scenario: Add equipment to the kitchen
    Given a new kitchen
    When I add equipment "Shopify" of type "shopify"
    Then the kitchen should have 1 pieces of equipment

  Scenario: Update existing equipment
    Given a new kitchen
    When I add equipment "Shopify" of type "shopify"
    And I add equipment "Shopify" of type "shopify-plus"
    Then the kitchen should have 1 pieces of equipment

  Scenario: Remove equipment from the kitchen
    Given a new kitchen
    When I add equipment "Shopify" of type "shopify"
    And I add equipment "Gmail" of type "gmail"
    And I remove equipment "Shopify"
    Then the kitchen should have 1 pieces of equipment

  Scenario: Add a recipe to the kitchen
    Given a new kitchen
    And a recipe file "recipes/thank-you-follow-up.recipe.md"
    When I parse the recipe
    And I add the recipe to the kitchen
    Then the kitchen should have 1 recipes

Feature: Equipment setup wizard
  As a user connecting equipment to my kitchen,
  I want a step-by-step guided setup experience
  so that I can connect services without needing technical knowledge.

  # --- Equipment definition parsing ---

  Scenario: Shopify equipment has three setup steps
    Given an equipment file "equipment/shopify.equipment.md"
    When I parse the equipment definition
    Then the equipment name should be "Shopify"
    And the equipment mode should be "api-key"
    And the equipment should have 3 steps
    And the equipment should have a technique

  Scenario: Gmail equipment uses compose mode
    Given an equipment file "equipment/gmail.equipment.md"
    When I parse the equipment definition
    Then the equipment name should be "Gmail"
    And the equipment mode should be "compose"
    And the equipment should have 1 steps

  Scenario: Shopify equipment has a config field with validation
    Given an equipment file "equipment/shopify.equipment.md"
    When I parse the equipment definition
    Then the equipment should have 1 config fields
    And the config field "Access token" should have validation "starts-with shpat_"

  Scenario: Gmail equipment has no config fields
    Given an equipment file "equipment/gmail.equipment.md"
    When I parse the equipment definition
    Then the equipment should have 0 config fields

  Scenario: Shopify equipment has documentation links
    Given an equipment file "equipment/shopify.equipment.md"
    When I parse the equipment definition
    Then the equipment should have 2 documentation links

  # --- Fallback wizard step rendering ---

  Scenario: Fallback renders the first step as info-only
    Given an equipment file "equipment/shopify.equipment.md"
    When I parse the equipment definition
    And I build a fallback step response for step 1
    Then the wizard step should have 0 fields
    And the wizard step instruction should contain "Shopify admin"

  Scenario: Fallback renders the last step with config fields
    Given an equipment file "equipment/shopify.equipment.md"
    When I parse the equipment definition
    And I build a fallback step response for step 3
    Then the wizard step should have 1 fields
    And the wizard step should have a password field

  # --- Wizard response parsing ---

  Scenario: Valid JSON response is parsed correctly
    Given a valid wizard JSON response
    When I parse the wizard response
    Then the wizard step instruction should contain "Enter your token"
    And the wizard step should have 1 fields

  Scenario: Malformed response falls back gracefully
    Given a malformed wizard response
    When I parse the wizard response
    Then the wizard step should have 0 fields

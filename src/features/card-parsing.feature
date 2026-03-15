Feature: Card definition parsing
  As a contributor adding new card types to the pantry,
  I want card definition files to be parsed correctly
  so that the system knows what each card does and needs.

  Scenario: Parse the Listen card definition
    Given a card file "pantry/listen.card.md"
    When I parse the card definition
    Then the card name should be "Listen"
    And the card type should be "listen"
    And the card should have a purpose

  Scenario: Parse card equipment requirements
    Given a card file "pantry/listen.card.md"
    When I parse the card definition
    Then the card should have 1 equipment requirements

  Scenario: Parse card configuration fields
    Given a card file "pantry/listen.card.md"
    When I parse the card definition
    Then the card should have a config field "listen for"
    And the card should have a config field "from"

  Scenario: Parse the Wait card definition
    Given a card file "pantry/wait.card.md"
    When I parse the card definition
    Then the card name should be "Wait"
    And the card type should be "wait"

  Scenario: Parse the Send Message card definition
    Given a card file "pantry/send-message.card.md"
    When I parse the card definition
    Then the card name should be "Send Message"
    And the card type should be "send-message"

# Seven Principles of Engineering Thinking

Apply these to every technical decision in AICard.

---

## 1. Blame systems, not people

When a design doesn't work, ask what allowed it to fail — not who caused the failure. If a user misunderstands a feature, the feature is unclear. If a bug made it to production, the process didn't catch it. Fix the system.

**Applied**: if Maria can't figure out how to connect equipment, the onboarding flow failed — not Maria.

---

## 2. Solve problems, not implement solutions

Start with the user need. Work backward to the code. Don't build a feature because it's interesting to build. Build it because it solves a real problem for a real person.

**Applied**: before writing a card executor, ask: what does the user need to happen when this card runs? What do they need to *see*?

---

## 3. Define "done" before you start

Write a test or a clear description of success before writing implementation. If you don't know what done looks like, you don't know what you're building.

**Applied**: the recipe parser is done when `parseRecipe(thankyouFixture)` returns the correct structure with zero errors. That's the test. Write it first.

---

## 4. Writing forces thinking

If you can't name a function clearly, you don't understand what it does yet. If a comment is confusing, the concept is confusing. Write the name, the comment, the description first. Code second.

**Applied**: if you can't write a one-sentence description of a card's `describe()` output, you don't know what the card does for the user yet.

---

## 5. Clarity beats cleverness

A readable 20-line function beats a clever 5-line one. Other people have to read this code. You will be that other person in six months.

**Applied**: the parser should be straightforward to follow. Every structural marker maps to one code path. No regex wizardry unless the alternative is worse.

---

## 6. Work small, learn fast

The parser before the executor. The executor before the UI. Fixtures before real data. Each step produces something testable before the next begins. Don't build a bridge to something that doesn't exist yet.

**Applied**: write the fixture file, then the test, then the parser. In that order.

---

## 7. Embrace trade-offs

Every simplifying assumption is a trade-off. Name it. Leave a comment. Don't pretend a limitation isn't there — make it visible. The Wait card requires the tab to stay open. Say so in the code and in the UI.

**Applied**: `// TRADE-OFF: The Wait card requires the browser tab to stay open.`

---

## How to use these

When you're stuck: apply Principle 2. What is the actual problem?

When something is getting complicated: apply Principle 5. Is there a clearer way?

When you're about to ship: apply Principle 3. Did you define done? Did you reach it?

When you make a simplification: apply Principle 7. Name what you're giving up.

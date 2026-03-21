# L1 test findings

## Finding 1

There's no recipe to open. Maria arrives with an empty kitchen and no way to get a recipe. The fixture exists inside the codebase but not anywhere a user would find it. The app needs either a bundled starter recipe that's already in your kitchen when you first open it, or the sous chef should offer one during first setup.

## Finding 2

Recipes demand specific brands, but should demand capabilities. The recipe says "Shopify" but Maria has Etsy. The recipe format should describe what kind of equipment is needed and what it does, not which specific service. The kitchen maps capabilities to Maria's actual services. The sous chef bridges the gap.

## Finding 3

"Connected" overpromises for compose-mode equipment. Gmail shows a green dot and says "Connected" but AICard can't actually send email. It prepares a message and hands it off. The UI should distinguish between "fully connected" equipment (can act on your behalf) and "hand-off mode" equipment (prepares things for you to send yourself). The language and status indicators need to be honest about which mode each piece of equipment is in.

## Finding 4

Raw template references visible to the user. Step 3 shows {step 1: customer email} in its description before step 1 has completed. Maria should never see internal reference syntax.

## Finding 5

Card type badges show machine names. "send-message" instead of "Send Message". The UI should use the human-facing card type names from the card definitions.

## Finding 6

Can't tweak a step that's already running. The Wait step started immediately after Listen completed. Maria had no chance to change "3 days" to something shorter. Level 2 needs either: (a) a way to tweak a running Wait step (restart the timer with the new value), or (b) a pause-before-each-step moment where Maria can review and adjust before the step begins.

## Finding 7

No way to cancel or restart a running recipe. Maria is stuck waiting 3 days. There's no "Stop" button, no "Start over." Her only option is closing the tab — which the banner told her not to do.

## Finding 8

Doubled word in Listen result. "Picked up a new new order" — the describe template has a bug.

## Finding 9

The entire kitchen disappears when the dev server stops. Maria doesn't have a dev server. In the real world, AICard needs to survive being closed, reopened, and interrupted. Right now the app only exists while deno task dev is running. This is fine for development, but it's a reminder that the "offline first" promise from the manifesto is still just a promise.

## Finding 10

TheSous chef setup dominates the kitchen after first configuration. The provider row, expanded config panel, model name, and URL take up prime screen real estate for something Maria will touch once. After initial setup, this should collapse to a compact status line. The full setup UI should only expand when explicitly editing.

## Finding 11

Paused recipe shows ambiguous state. After recovery, the UI shows completed steps, a running step, and a "Run recipe" button simultaneously. Maria can't tell if she should continue or start over. The recovery state should be clearer: either offer to resume from where it stopped, or show everything as reset with the option to start fresh. Not both at once.

## Finding 12

Tweaked config isn't reflected in the step's visible description. After changing "3 days" to "5 seconds," the step still reads "Wait a few days" with no indication the tweak was applied. Maria needs visual confirmation that her change took effect — either the description updates, or a small "tweaked" indicator appears on the step.

## Finding 13

The description in the send the thank you message card still shows the raw template. "Sending a message to {step 1: customer email}..." is visible even though the actual To field below it correctly shows your email. The describe() method ran before resolution, but the executor resolved it fine. This is the same Finding 4 — the description needs to resolve references or use generic language.

## Finding 14

The message is the recipe's static text, not a personalised one. "We really appreciate your support. Your order is on its way!" — this is the literal message from the recipe fixture. In the manifesto's vision, the AI inside the Send Message card would compose something personalised based on the "Message idea" config. But v1 uses the literal text, and that's the right trade-off for now.

## Finding 15

Browser blocks mailto: link as a popup. The window.open() call for the mailto: URL triggers the browser's popup blocker. Maria sees a security warning in her system language and has to click "Allow." This breaks the flow and feels unsafe even though it's doing exactly the right thing. The fix might be using a regular <a href="mailto:..."> link that Maria clicks herself instead of programmatically opening it — browsers treat user-initiated link clicks differently from window.open().

## Finding 16

"Keep this tab open" warning persists after recipe completion. The warning is relevant during the run but should disappear once the recipe is complete. Leaving it up after completion contradicts the "Recipe complete" banner.

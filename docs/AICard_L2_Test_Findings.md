# L2 test findings

## Finding 1

After Maria tweaks Step 2 from "3 days" to "5 days" and clicks Save, the step card still shows the original description — "Waiting 3 days..." — until Step 2 actually starts running. The change was saved, but there is nothing in the UI to confirm it. Maria has no way to know her tweak took effect until the step begins.

## Finding 2

If Maria clicks "Tweak" on a step while its pre-step review panel is counting down (5 seconds before auto-advancing), the countdown timer keeps running silently behind the open CardConfig panel. If she takes more than 5 seconds to edit the value, the timer fires and the step starts with the original config — discarding her change without warning. The step runs as if she never tweaked it.

## Finding 4

After Maria saves a tweak to a pending step, the description updates correctly in place. But when another step completes and the runner pushes a new run state, the pending step's description reverts to the original value for the duration of the pre-step review panel. The execution still uses the tweaked value — only the display is wrong. Maria sees "Waiting 3 days…" in the review panel even though she changed it to "5 days." The description corrects itself the moment the step starts running, but the review panel is precisely the moment she is most likely to be looking at it.

## Finding 3

The CardConfig field label for the Wait step shows "How long" — the raw config key, capitalised by CSS. The card definition has a human-readable field description that is never consulted. For "how long" this is acceptable, but config keys with hyphens or abbreviations (e.g. a future "msg-template" key) would render poorly. Currently there is no mechanism for CardConfig to use the card definition's field descriptions.

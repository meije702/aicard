# AICard Personas

Every feature decision is tested against these three people.

---

## Maria — The Shopkeeper

**Who she is**: Maria runs a small online gift shop. She's been in business for six years. She's comfortable with email, Shopify, and spreadsheets. She is not a technical person and does not want to be.

**What she wants**: Things to happen automatically so she can focus on her shop. She wants to send thank-you messages to new customers, follow up with people who haven't ordered in a while, and keep her team informed without remembering to do it herself.

**What she doesn't want**: To learn a new platform. To think about APIs or webhooks. To feel stupid. To wonder if she set something up correctly.

**How she uses AICard**: Maria opens a recipe someone recommended. The sous chef checks her kitchen. She connects her Shopify account. She runs the recipe. It works. She tweaks the waiting period from 3 days to 5 days. It still works. She feels capable.

**The test**: Could Maria use this feature without knowing what is happening under the hood? If not, it's not ready.

---

## Jun — The Curious Builder

**Who he is**: Jun works in operations at a mid-sized company. He's technical enough to figure things out — he's comfortable with Google Sheets formulas, has set up a few Zapier automations, and once read half a Python tutorial. He likes solving problems but doesn't want a new job.

**What he wants**: To build things that work. To understand what a recipe does before he runs it. To be able to modify it when the business changes. To share it with colleagues without explaining everything from scratch.

**What he doesn't want**: Black boxes. Automations that break mysteriously. Things he can't audit.

**How he uses AICard**: Jun reads through a recipe before running it. He checks the kitchen section to confirm he has the right equipment. He reads the steps and understands the logic. He modifies the config to match his team's process. He shares the recipe file with a colleague.

**The test**: Can Jun read a recipe file in a text editor and understand exactly what it will do? If not, the format is too opaque.

---

## Sam — The Developer

**Who she is**: Sam is a software engineer. She found AICard because she was curious. She wants to know how it works. She might want to build a new card type. She will notice if something is technically sloppy.

**What she wants**: Substance. Real capabilities. A format that is actually well-designed, not just friendly labels on a mess. If she's going to use this, she wants it to be worth using.

**What she doesn't want**: Marketing language. Fake simplicity that hides real complexity. Having to fight the tool to do something it should support.

**How she uses AICard**: Sam opens the `.card.md` format spec. She builds a new card type. She runs the tests. She contributes it back.

**The test**: Is there real substance here, or just a friendly label on a technical operation? If it's the latter, Sam will see through it — and so will everyone else eventually.

---

## Priority

Build for Maria first. Then Jun. Sam will find value if Maria and Jun are well served.

When Maria and Sam want different things, build for Maria. When Jun and Sam want different things, build for Jun. Sam can fork.

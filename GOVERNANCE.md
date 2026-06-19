# Governance

This document explains how AICard is run: who decides what, how, and why the
project's "open source, forever" promise is a structural guarantee rather than
a slogan. It exists because the manifesto commits AICard to permanence (see
*Open source, forever* in `docs/MANIFESTO.md`), and permanence requires a plan
that outlives any one contributor.

> **This is a draft.** It proposes sensible defaults for an early-stage project.
> A few choices are genuinely the maintainer's to make and are marked
> **Decision needed** — please confirm or change them before AICard takes its
> first external contribution.

---

## Principles

These are not up for negotiation; everything else serves them.

- **Permanence over ownership.** No individual or company can buy AICard, bury
  it, or put it behind a paywall. The MIT license guarantees it can always be
  used, modified, and forked.
- **Build for Maria first.** Governance decisions are judged against the
  personas (`docs/AICard_Personas.md`), in that priority order.
- **The fence holds.** v1 scope and the roadmap (`docs/ROADMAP.md`) are the
  shared agreement about what we are and aren't building. Changing scope is a
  deliberate, documented decision, not drift.

---

## Roles

- **Maintainers** review and merge changes, set direction within the manifesto
  and roadmap, and are responsible for keeping `main` green and the vocabulary
  consistent.
- **Contributors** are anyone who opens an issue or a pull request. No formal
  status is required to contribute — see `CONTRIBUTING.md`.

> **Decision needed:** name the current maintainer(s) and a contact point here.
> Until then, the repository owner is the sole maintainer.

---

## How decisions are made

Most decisions are made in the open, on issues and pull requests, by **lazy
consensus**: a proposal that draws no sustained objection within a reasonable
window is accepted. The maintainers break ties.

Decisions that would be expensive to reverse — a new module or pattern, a
dependency, a change to a file format, anything that moves the v1 fence — are
recorded as an **Architecture Decision Record** in `docs/adr/` (immutable once
accepted; superseded, never edited). Smaller decisions live in the pull request
that makes them.

Open questions that aren't ready to decide live on the **kitchen counter**
(`docs/kitchen-counter.md`) until they graduate into the roadmap.

---

## Becoming a maintainer

The path is earned through sustained, trusted contribution, not appointed:

1. Contribute changes that respect the domain language, the seven principles,
   and the scope fence.
2. Help review others' work and triage issues.
3. An existing maintainer proposes you; the others agree by lazy consensus.

The aim is always to have more than one active maintainer, so the project never
depends on a single person.

---

## The "forever" guarantee

This is the mechanism behind the manifesto's promise:

- The **MIT license** means anyone can fork AICard at any time, for any reason.
  If the maintainers ever stop, disappear, or go in a direction the community
  rejects, the work continues in a fork. Nothing here can be locked away.
- The project stays **buildable from source with no proprietary services** — a
  fork must never require a key, an account, or a server we control to run the
  core loop.
- If the current maintainers step away, the most active contributors may
  continue the project — including the name and repository where practical, and
  always the code via a fork.

---

## Funding and sustainability

AICard is free to use, free to modify, and free to share. It does not sell a
product or run a paid service.

> **Decision needed:** choose a sustainability stance and state it here.
> Reasonable options:
>
> - **No funding** — a volunteer project; set expectations accordingly.
> - **Donations** — accept optional contributions (e.g. a sponsor link) with a
>   public statement that they never buy influence over direction.
> - **Grants** — pursue project grants for specific, scoped work.
>
> Whatever the choice, the principle holds: money may sustain the work, but it
> never buys ownership or the right to close the project.

---

## Conduct and security

- All participation is bound by `CODE_OF_CONDUCT.md`.
- Security issues follow the process in `SECURITY.md` — please do not file them
  as public issues.

---

## Changing this document

Amendments to this document are themselves decisions: propose the change as a
pull request, link the reasoning, and let it reach consensus. Changes to the
**Principles** section require maintainer agreement and should be rare — they
are the part that is meant to be hard to change.

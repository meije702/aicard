# AICard

**If you can follow a recipe, you can build with AI.**

AICard is an open-source platform that lets ordinary people build automations using a recipe-and-ingredient metaphor. No code, no APIs, no flowcharts. You open a recipe, the sous chef checks your kitchen, and things happen.

> Read the full philosophy in [docs/MANIFESTO.md](docs/MANIFESTO.md).

## Status

AICard is pre-v1. We are building **Level 1** (Following a recipe) and **Level 2** (Tweaking a setting). These must be solid before anything else. See [What Not to Build Yet](#what-not-to-build-yet).

## Quick start

Requires [Deno](https://deno.com/).

```bash
deno install                # install dependencies
deno task dev               # start dev server (http://localhost:5173)
deno task test              # run the test suite
deno task build             # build frontend + compile binary → ./aicard
deno check src/             # type-check all source files
```

## The kitchen metaphor

| Term | Meaning | Not this |
|------|---------|----------|
| **recipe** | A sequence of steps toward a purpose (`.recipe.md` file) | workflow, pipeline, automation |
| **card** | A type of action a step can perform (`.card.md` definition) | node, action, trigger |
| **step** | A single item in a recipe's Steps section | — |
| **kitchen** | The user's workspace (equipment + pantry + recipes) | workspace, environment, project |
| **equipment** | A connected service (shop, email, calendar) | integration, connector, service |
| **pantry** | The collection of card types available | library, marketplace, registry |
| **sous chef** | The AI collaborator — quiet, helpful, speaks kitchen language | assistant, agent, copilot, bot |
| **purpose** | A one-sentence description of what a recipe does | description, summary |

Use these terms in code, comments, UI, and documentation. The full vocabulary is in [docs/AICard_Domain_Language.md](docs/AICard_Domain_Language.md).

## Who this is for

- **Maria** (shopkeeper) — wants things to happen automatically without learning a platform. Build for her first.
- **Jun** (curious builder) — wants to understand what a recipe does and modify it. Build for him second.
- **Sam** (developer) — wants substance and real capabilities. She'll find value if Maria and Jun are well served.

Full persona details in [docs/AICard_Personas.md](docs/AICard_Personas.md).

## Project structure

```text
aicard/
  docs/              ← project documents (read-only reference)
  src/
    parser/          ← recipe and card file parsers
    cards/           ← card type executors (Listen, Wait, Send Message)
    kitchen/         ← kitchen state and equipment
    runner/          ← wires everything together
    sous-chef/       ← the AI collaborator
    ui/              ← React components
    fixtures/        ← example recipes and card definitions
    types.ts         ← shared domain types
  AGENTS.md          ← instructions for AI coding agents
  CLAUDE.md          ← Claude Code-specific instructions
  deno.json          ← Deno config
  vite.config.ts     ← Vite config (browser bundle)
```

## What not to build yet

- User accounts or authentication
- Recipe sharing mechanics
- The full pantry (8 card types) — v1 has 3: Listen, Wait, Send Message
- Level 3, 4, or 5 features
- A mobile-specific UI
- Any backend server

When tempted, ask: **"Does Level 1 work yet?"**

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for how to contribute — whether you're a human or an AI agent.

## Documentation

| Document | What it covers |
|----------|---------------|
| [MANIFESTO.md](docs/MANIFESTO.md) | The vision and philosophy |
| [AICard_Domain_Language.md](docs/AICard_Domain_Language.md) | The shared vocabulary (source of truth) |
| [AICard_Personas.md](docs/AICard_Personas.md) | Maria, Jun, Sam — every decision is tested against them |
| [AICard_User_Journeys.md](docs/AICard_User_Journeys.md) | Step-by-step user experiences |
| [AICard_Recipe_Format.md](docs/AICard_Recipe_Format.md) | The `.recipe.md` file format |
| [AICard_Card_Format.md](docs/AICard_Card_Format.md) | The `.card.md` file format |
| [Seven_Principles_of_Engineering_Thinking.md](docs/Seven_Principles_of_Engineering_Thinking.md) | The mindset for every technical decision |
| [kitchen-counter.md](docs/kitchen-counter.md) | Open questions and things to figure out |

## License

[MIT](LICENSE)

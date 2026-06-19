# Self-improving micro-models in composable multi-agent systems

**Small, specialized AI models (1B–7B parameters) can now be fine-tuned on consumer hardware in under an hour, composed into multi-agent workflows, and — with careful architecture — made to improve themselves over time.** This represents a genuine inflection point for projects like AICard. Fine-tuned 4B models routinely match or exceed 120B+ teacher models on narrow tasks, QLoRA enables 7B fine-tuning on a single 12GB GPU, and the ecosystem of orchestration frameworks (LangGraph, CrewAI, Google ADK) has matured to production-readiness. The concept of self-improving workflow nodes that learn from their own execution, however, remains largely unimplemented — making it AICard's most significant differentiator in a rapidly growing market projected to reach **$47B by 2030**.

The research that follows covers six dimensions: fine-tuning small models, continuous self-improvement, local execution, multi-agent composition, the competitive landscape, and practical architecture patterns. Each section focuses on what actually works today and what remains aspirational.

---

## 1. Fine-tuned micro-experts now rival models 30× their size

The most important finding for AICard's architecture is that **fine-tuning matters more than base model choice**. Systematic benchmarks from Distil Labs (July 2025) across 12 models and 8 tasks showed that a fine-tuned Qwen3-4B matched or exceeded a 120B+ teacher model on 7 of 8 benchmarks, and a well-tuned 1B model outperformed a prompted 8B model. Smaller models (1B–3B) show the **largest relative gains** from fine-tuning — a property called inverse tunability that directly favors AICard's micro-expert approach.

For AICard's specific task types, the minimum viable model sizes are well-established. **Event classification and data filtering work reliably at 1B parameters** with as few as 200 labeled examples. Summarization requires 3B parameters for quality output, with Llama 3.2 3B outperforming several larger models on this task. Message composition is the most demanding card type, requiring **3B–7B parameters** and 500–2,000 high-quality training examples for natural-sounding, domain-specific output. The leading model families as of early 2026 are Qwen3 (best fine-tuned performance), Llama 3.2 (most tunable), and Mistral 7B (best for structured extraction).

### The toolchain is mature and consumer-accessible

The fine-tuning ecosystem has consolidated around five major frameworks, each serving a distinct use case:

- **Unsloth** (53.9K GitHub stars): 2–5× faster training, up to 80% less VRAM. Best for single-GPU consumer hardware. Just launched Unsloth Studio (March 2026) with a no-code web UI. Supports 500+ models including Qwen 3.5, Llama 4, and DeepSeek-R1.
- **Axolotl** (11.4K stars): YAML-driven, reproducible configs with multi-GPU support via DeepSpeed and FSDP. The framework serious practitioners use for production pipelines.
- **TRL** (17.6K stars): HuggingFace's reference implementation for alignment training — DPO, GRPO, PPO, KTO. Essential for the self-improvement dimension.
- **LLaMA-Factory** (68.4K stars): Lowest barrier to entry with a web UI. Supports 100+ LLMs. Best for exploration and prototyping.
- **Torchtune**: PyTorch-native, deep customization, clean multi-node scaling.

**QLoRA** (4-bit quantized base model with 16-bit LoRA adapters) is the enabling technique for consumer hardware. It reduces memory requirements by **75–80%** compared to standard LoRA, enabling 7B model fine-tuning in **8–10GB VRAM**. On an RTX 4090, a QLoRA fine-tune of a 7B model with Unsloth completes in **1–2 hours** on 10K examples. On an Apple M-series Mac with 16GB unified memory, MLX enables QLoRA fine-tuning of 7B models in under 30 minutes for smaller datasets. LoRA adapters are typically **10–100MB** — trivially version-controlled in Git, which matters enormously for AICard's card versioning strategy.

---

## 2. Self-improvement is real but bounded — here's what actually works

### Karpathy's autoresearch: the proof of concept

In March 2026, Andrej Karpathy released **autoresearch** (github.com/karpathy/autoresearch), an open-source system where an AI agent (Claude Code or Codex) autonomously reads training code, forms hypotheses, modifies the code, runs 5-minute experiments, evaluates results, and iterates. In one overnight run it executed **126 experiments**, driving validation loss from 0.9979 to 0.9697. Over two days, ~700 experiments discovered 20 additive improvements that transferred to larger models, yielding an **11% speedup** on the "Time to GPT-2" leaderboard.

Shopify CEO Tobias Lütke validated the approach externally: 37 experiments overnight produced a **19% performance gain**, with a 0.8B model outperforming his hand-tuned 1.6B model. Applied to Shopify's Liquid templating engine, autoresearch produced **53% faster rendering** and **61% fewer memory allocations** from 93 automated commits.

The critical caveat: **the agent is not improving itself** — it optimizes a separate, smaller model's training code. Karpathy explicitly acknowledged this isn't true recursive self-improvement but called it "the seed" for such systems. His vision is "asynchronously massively collaborative agent swarms" where "any metric you care about that is reasonably efficient to evaluate can be autoresearched."

### Practical self-improvement techniques for micro-models

For AICard's use case — individual cards learning from user corrections — three alignment techniques are directly applicable:

**KTO (Kahneman-Tversky Optimization)** is the most promising for incremental learning. Unlike DPO which requires pairwise preference data, KTO only needs **binary feedback** (thumbs up/thumbs down). It matches or exceeds DPO performance at scales from 1B to 30B parameters, has natural robustness to noisy feedback, and is available in HuggingFace TRL with a ready-to-use KTOTrainer. For AICard, this means a card could improve from simple accept/reject signals on its outputs.

**DPO (Direct Preference Optimization)** is the standard post-training algorithm, treating alignment as a classification task on chosen/rejected response pairs. Even ~2K preference pairs with 3 epochs produces meaningful improvements on small models. **ORPO** unifies SFT and preference alignment into a single training stage, reducing compute costs — recommended when resources are limited.

**Self-play fine-tuning (SPIN)** demonstrated genuine self-improvement on Mistral-7B: average benchmark accuracy rose from 58.14% to **63.16%** after 3 iterations, with >10% improvement on GSM8k and TruthfulQA. **DeepSeek-R1** showed that reasoning abilities can emerge through pure reinforcement learning (GRPO) without supervised fine-tuning, and these capabilities were successfully distilled to models as small as **1.5B parameters**.

### The forgetting problem and how to mitigate it

**Catastrophic forgetting** remains the central challenge for continuously learning models. Full fine-tuning on new data causes **89% performance degradation** on previous tasks. LoRA reduces this to ~71% (it "learns less and forgets less" by freezing base weights). The most promising 2025 advance is **sparse memory layers** (Jessy Lin et al., October 2025) — replacing FFN layers with sparse attention lookups into millions of learned key-value pairs — which reduces forgetting to just **11%**.

For AICard, the honest reading as of mid-2026 is that forgetting is *mitigated, not solved* — sparse memory layers are a promising single research result, not a shipping, battle-tested technique. So per-card "self-improvement" should mean periodic, offline, *evaluated* batch fine-tunes (train, hold out, regression-check against earlier tasks, promote only if it doesn't regress) — not online weight updates that learn continuously in production. The append-only event ledger (Section 6) is exactly the substrate that makes that batch approach safe; it does not make online continual learning safe.

**Goodhart's Law** poses a fundamental risk: for any true reward function, it is mathematically impossible to create a non-trivial proxy reward guaranteed to be unhackable. Real-world examples in 2025 include LLM reasoning models that learned to hack chess games by modifying game state files rather than playing better, and OpenAI models that explicitly planned to hack evaluation tests. The practical defenses are multi-metric evaluation, KL penalty constraints, early stopping, and human oversight at critical decision points.

Self-play methods reliably **plateau after ~3 iterations** — they cannot achieve infinite capability gains through iteration alone. Research has shown these algorithms are bounded by their imitation targets.

---

## 3. Consumer hardware is now sufficient for both inference and training

### The local inference landscape has matured

Three frameworks dominate local LLM execution, each optimized for different hardware:

**llama.cpp** remains the gold standard for portable, edge-optimized inference. It supports 1.5-bit to 8-bit quantization in GGUF format, runs on everything from Raspberry Pi to H100, and achieves **30–50 tok/s** for 7B Q4 models on consumer GPUs. The ik_llama.cpp fork adds FlashMLA-3 for significantly faster MoE inference.

**MLX** (Apple's framework) achieves **6–10× throughput versus Ollama** on Apple Silicon — up to ~230 tok/s on M2 Ultra versus Ollama's 20–40 tok/s. The M5 chip (2025) adds GPU Neural Accelerators with up to **4× TTFT speedup** over M4. Crucially, unified memory on Mac Studio/Pro (64–192GB) enables running 70B models locally — impossible on any single consumer NVIDIA GPU.

**Ollama** is the "Docker for LLMs" — one-command install, OpenAI-compatible REST API, 100+ models. It wraps llama.cpp with 10–30% overhead but offers the best developer experience. It now supports native tool calling, structured outputs, and cloud model fallback.

For AICard specifically, the sweet spot is **7–14B parameter models at Q4_K_M quantization**. A 7B model uses ~5–6GB of RAM and runs at 30–50 tok/s on consumer hardware. A 14B model provides a "dramatic quality jump" and fits in 24GB VRAM at ~60–70 tok/s on RTX 4080/4090.

### Browser-based inference is viable for small cards

**WebLLM** (MLC-AI, 17.6K GitHub stars) delivers up to **80% of native performance** in the browser via WebGPU. On an M3 Max, it runs Llama 3.1 8B (4-bit) at 41 tok/s and Phi 3.5 mini at 71 tok/s. **Transformers.js v4** (February 2026) was rewritten in C++ with WebGPU, achieving 3–10× speedups over v3 — Llama 3.2 3B at ~60 tok/s. WebGPU now ships by default across Chrome, Firefox, Edge, and Safari with ~83% desktop coverage.

For AICard's browser story, **1–3B parameter models quantized to INT4** are reliable for in-browser execution. Classification and filtering cards (1B) are excellent candidates. Message composition cards (3B+) are feasible on high-end machines. The practical limit is ~8B at 4-bit quantization (~4–5GB download).

### Local fine-tuning is practical today

The table below summarizes what's achievable on consumer hardware:

| Model Size | Method | VRAM Required | Hardware | Training Time |
|:---|:---|:---|:---|:---|
| 1B | QLoRA | 2–4 GB | RTX 3060 (12GB) | 20–45 min |
| 3B | QLoRA + Unsloth | 5–8 GB | RTX 3060 or M-series 16GB | 30–60 min |
| 7B | QLoRA + Unsloth | 8–10 GB | RTX 4090 or M-series 32GB | 1–2 hours |
| 7B | LoRA via MLX | ~14 GB | M-series 16GB+ | ~30 min (small dataset) |
| 30B MoE | QLoRA + Unsloth | 17.5 GB | RTX 4090 | ~50 min |

The practical 2026 workflow for AICard: develop and prototype on local hardware, use Unsloth + QLoRA for single-GPU training, and scale to cloud only for models >13B or production throughput requirements. LoRA adapters (10–100MB) are trivially stored, versioned, and swapped — enabling the "adapter-per-card" pattern where a single base model serves multiple specialized cards by swapping LoRA weights.

---

## 4. Multi-agent orchestration has reached production maturity

### The framework landscape has consolidated

**LangGraph** (v1.0, late 2025) is the most production-ready framework, running at LinkedIn, Uber, and 400+ companies. Its graph-based state machine architecture — nodes as agents, edges as control flow with conditional routing, parallel execution, and cycles — maps naturally to AICard's recipe/workflow concept. It provides durable execution with checkpointing, human-in-the-loop support, and best-in-class observability through LangSmith.

**CrewAI** (44.6K GitHub stars, $18M funding) offers the fastest prototyping with its role-based "crew" metaphor and YAML-driven configuration. It claims to power agents for 60% of Fortune 500 companies but has limited async/parallel support.

**Microsoft Agent Framework** (RC February 2026, GA expected end of Q1 2026) merged AutoGen and Semantic Kernel into a unified platform with enterprise-grade features — SOC 2, HIPAA compliance, Azure integration. **Google ADK** (Apache 2.0) provides hierarchical agent trees with native A2A protocol support and multi-language SDKs.

### Two protocols are becoming standards

**MCP (Model Context Protocol)** by Anthropic standardizes how agents connect to external tools, databases, and APIs. It has been contributed to the Linux Foundation and has thousands of integrations. **A2A (Agent-to-Agent Protocol)** by Google (v0.3, 150+ supporting organizations) defines how agents from different vendors communicate — built on HTTP, SSE, and JSON-RPC. Together, MCP handles agent-to-tool and A2A handles agent-to-agent communication. **AICard should adopt both protocols** to ensure interoperability.

### Deterministic orchestration of non-deterministic agents

The fundamental challenge — LLM outputs are inherently non-deterministic but production systems need reliability guarantees — has a clear solution: **separate deterministic workflow logic from non-deterministic execution**.

**Temporal.io** has emerged as the leading reliability layer for AI agents. Workflows (deterministic orchestration code) define structure and control flow. Activities (non-deterministic LLM calls) run once, with results recorded in event history. On crash, the workflow replays from history using recorded results without re-running completed activities. Temporal now integrates with OpenAI Agents SDK, PydanticAI, and LangGraph.

Research validates the multi-agent approach: a January 2026 study (arXiv 2511.15755) found that multi-agent orchestration achieves **100% actionable recommendation rate versus 1.7% for single-agent** in incident response, with zero quality variance across 348 trials.

### Mixture of Agents extends specialization to the model level

The **Mixture of Agents (MoA)** approach (Wang et al., 2024, ICLR 2025 Spotlight) achieved **65.1% on AlpacaEval 2.0** versus GPT-4 Omni's 57.5% using only open-source LLMs. It uses a layered architecture where proposer agents generate diverse responses and aggregator agents synthesize them. Several 2025 variants improve efficiency: **RouteMoA** uses dynamic routing without requiring all models to run, and **Faster-MoA** achieves up to **90% latency reduction** with tree-structured routing and adaptive early exit. This validates AICard's core thesis — composing specialized small models can exceed monolithic large models.

---

## 5. AICard occupies genuine whitespace in a crowded market

### The competitive landscape and where AICard is different

The visual AI workflow builder market is large and growing. **n8n** (180K+ GitHub stars) leads in general automation with 70+ AI nodes and SOC 2 compliance, but its nodes are static connectors — no learning capability. **Dify** (119K+ stars) is the most comprehensive all-in-one LLM platform with built-in feedback loops, but these operate at the platform level, not individual node/model level. **Langflow**, **Flowise**, and **Rivet** are all static workflow builders with no self-improvement mechanisms. **ComfyUI** (50K+ stars) is the best existing example of composable micro-model visual workflows for image generation — LoRAs, VAEs, and samplers chained together — but nodes don't evolve.

AICard's concept differs from all existing tools in three fundamental ways:

**First, nodes ARE the models.** Existing tools orchestrate API calls to large, general-purpose LLMs. AICard's cards are small, specialized expert models — a microservices architecture for AI, not a workflow wrapper around LLM APIs. **Second, individual cards self-improve.** No existing open-source workflow builder has nodes that learn from their own execution. Beam AI (closed-source, enterprise) approaches this at the agent level, and Dify has platform-level feedback loops, but node-level self-improvement is absent from the market. **Third, composability of actual models** — each independently trainable, optimizable, and improvable — rather than composability of prompts and API calls.

### Academic research validates the approach

Recent papers demonstrate that multi-agent co-evolution is technically feasible. "Multi-Agent Evolve" (2025) showed LLMs self-improving through co-evolution without human annotation using self-play with LLM-as-Judge, demonstrated on Qwen2.5-3B. "CoMAS" (2025) enables autonomous agent co-evolution by generating intrinsic rewards from inter-agent discussions. "Language Agents as Optimizable Graphs" (Zhuge et al., 2024) treats agent workflows as optimizable computational graphs — conceptually the closest academic work to AICard's vision. Federated learning approaches like FedMKT (2025, COLING) enable selective mutual knowledge transfer between large and small models, potentially allowing AICard cards to benefit from collective learning.

---

## 6. Architecture patterns that make progressive AI evolution safe

### The strangler fig pattern enables gradual card evolution

The most robust approach for upgrading deterministic cards to AI-backed micro-experts is the **Strangler Fig pattern**: build new AI implementations around existing rule-based components, route traffic gradually via a façade layer, and retire the deterministic version only after validation. Both implementations conform to the same interface contract — the system doesn't know or care whether a card is rule-based or AI-powered.

For AICard specifically, this means every card should implement a common `TaskExecutor` interface. AI-backed cards can extend this with optional metadata (confidence scores, explanations). Feature flags control percentage-based routing between deterministic and AI implementations. **Dark launches** (shadow mode) run AI cards on production data without returning results to users, comparing outputs against deterministic baselines.

### Event sourcing is the natural foundation

**Event sourcing** — capturing "what happened" rather than "what is" — provides four benefits simultaneously for AICard's architecture:

**Auditability**: every AI decision becomes an immutable event (`AIDecisionMade { input, model_version, confidence, output, reasoning_trace, timestamp }`), enabling compliance teams to reconstruct exactly how any card reached a conclusion. **Training data**: events serve as naturally labeled training data — user actions after AI suggestions indicate whether suggestions were good. **Drift detection**: comparing event patterns over time against model predictions reveals when cards begin degrading. **Reproducibility**: point-in-time state reconstruction ensures training AI models with historically accurate data.

The pipeline from events to self-improvement closes the loop: Domain Events → Feature Engineering → Model Training → Inference → Actions → New Domain Events. Combined with **CQRS** (Command Query Responsibility Segregation), AI cards propose actions as commands that are validated against business rules before becoming events. Human approval can gate command execution at any point.

### Consent-driven evolution: the pull request model for AI behavior

AICard should implement **confidence-based escalation** as its default human-in-the-loop pattern: cards operate autonomously until their confidence drops below a threshold, then escalate to human review. This means fewer than 10% of decisions typically need human intervention while maintaining safety.

The "pull request model" for AI behavior changes works as follows: card improvements (new LoRA adapters, updated parameters) are proposed as versioned artifacts in Git. A/B testing or shadow deployment validates the improvement against the current version. Promotion from staging to production happens through merge requests with approval gates, managed via GitOps tools like ArgoCD. Every deployment and rollback is recorded, and structured output contracts (JSON Schema) ensure that AI card outputs remain compatible with downstream cards regardless of model changes.

**LaunchDarkly AI Configs** now specifically supports managing AI model configurations at runtime, separating model configuration from application deployment. This enables percentage-based rollouts (5% → 25% → 100%), automated rollback when error rates exceed thresholds, and tenant-specific AI card versions.

### Testing AI-backed cards requires a multi-layered approach

Anthropic's guidance on agent evaluation recommends combining three approaches: **deterministic checks** (format validation, JSON Schema conformance), **LLM-as-judge** (rubric-based scoring of output quality), and **periodic human annotation** for calibration. Open-source frameworks like **DeepEval** provide 50+ metrics including task completion, hallucination detection, and answer relevancy, with pytest-style integration for CI/CD pipelines.

The critical pattern is a **production-to-test flywheel**: problematic production traces are converted into regression test cases with one click (via LangSmith or similar). Once a bug is fixed, it stays fixed. Model versions are pinned explicitly — model providers update silently, and "model drift causes 40% of production agent failures." Everything is versioned as a composite: model weights + LoRA adapter + prompt template + tool definitions + guardrails = one versioned "card release."

---

## Conclusion: what this means for AICard's roadmap

The research reveals several non-obvious insights that should shape AICard's architecture decisions.

**Start cards at 1B–3B, not 7B.** The inverse tunability finding — smaller models gain more from fine-tuning — means 1B classification cards and 3B summarization cards will likely outperform 7B models on narrow tasks while running faster and enabling browser deployment. Reserve 7B for generative cards that require natural language fluency.

**KTO is the right self-improvement mechanism — but not the first thing to build.** When the time comes, binary feedback (thumbs up/thumbs down) is the lowest-friction way for users to improve cards, and KTO was designed for exactly this signal; it works on models as small as 0.5B and is available today in HuggingFace TRL. But "first" is a tested Level 1–2: a real non-technical user following and tweaking a recipe without help. Self-improvement is a longer-horizon layer that gets its data and its meaning *from* that working base — it can't substitute for it. Collect the feedback in the ledger now; train on it later, offline and evaluated.

**Adopt MCP now; A2A is for later.** MCP is the connectivity layer AICard already depends on for equipment, it has won the category, and it now sits under the Linux Foundation — adopt it now. A2A (agent-to-agent) is complementary, not competing: it handles agents talking to *other* agents, which is irrelevant to Level 1–2. Note it for the roadmap; don't build for it in v1.

**Event sourcing isn't optional — it's the architectural foundation** that makes self-improvement, auditability, drift detection, and consent-driven evolution all possible through a single pattern. Every card execution should produce immutable events, and those events become the training data for the next generation of each card.

**The self-improving node concept is AICard's strongest *longer-horizon* differentiator — not its near-term moat.** No existing open-source tool — not n8n, not Dify, not Langflow, not ComfyUI — has cards that learn from their own execution, and the foundations (Multi-Agent Evolve, CoMAS, SPIN, sparse memory layers) plus the toolchain (Unsloth + QLoRA + KTO + MLX) make it feasible on consumer hardware. But the thing that wins users *first* is the inspectable, shareable recipe and the local-first ownership — the HyperCard inheritance — which a cloud app-builder structurally can't copy. Self-improvement deepens the moat later; it doesn't open it. Treat it as the layer you earn once a Level 1–2 product is real and has usage data in the ledger.
import { useState } from "react";

const theme = {
  light: {
    surfaceLightest: "#FDFAF6",
    surfaceLight: "#F5F0E8",
    surfaceMid: "#E8E0D4",
    surfaceDark: "#D4C9B8",
    surfaceDarkest: "#8C7E6A",
    textPrimary: "#2C2416",
    textSecondary: "#5C5040",
    textTertiary: "#8C7E6A",
    textInverse: "#FDFAF6",
    accentPrimary: "#C17832",
    accentPrimaryHover: "#A86528",
    accentPrimarySubtle: "#F5E6D0",
    accentSecondary: "#5B8C5A",
    accentSecondaryHover: "#4A7A49",
    accentSecondarySubtle: "#E2EDDF",
    statusInfo: "#4A7FA5",
    statusWarning: "#D4943A",
    statusError: "#C45D4A",
    statusSuccess: "#5B8C5A",
  },
  dark: {
    surfaceLightest: "#1C1814",
    surfaceLight: "#2A2420",
    surfaceMid: "#3A3228",
    surfaceDark: "#4A4034",
    surfaceDarkest: "#8C7E6A",
    textPrimary: "#E8E0D4",
    textSecondary: "#B8A88C",
    textTertiary: "#8C7E6A",
    textInverse: "#1C1814",
    accentPrimary: "#D4903E",
    accentPrimaryHover: "#E0A050",
    accentPrimarySubtle: "#3A2E20",
    accentSecondary: "#6FA06E",
    accentSecondaryHover: "#80B07F",
    accentSecondarySubtle: "#2A3428",
    statusInfo: "#5A9FC5",
    statusWarning: "#E0A44A",
    statusError: "#D47060",
    statusSuccess: "#6FA06E",
  },
};

const cardTypeColors = {
  Listen: "#6A9EC0",
  Wait: "#C4A960",
  "Send Message": "#C17832",
  Filter: "#7A9C7A",
  Summarize: "#9C8E78",
  Transform: "#B8704A",
  Decide: "#6A7F96",
  Store: "#8C6A4A",
};

function Swatch({ color, name, token }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 8,
          backgroundColor: color,
          border: `1px solid rgba(0,0,0,0.08)`,
          flexShrink: 0,
        }}
      />
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, fontFamily: "'Source Sans 3', system-ui, sans-serif" }}>{name}</div>
        <div style={{ fontSize: 12, opacity: 0.6, fontFamily: "monospace" }}>
          {token} · {color}
        </div>
      </div>
    </div>
  );
}

function ColorGroup({ title, colors, t }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <h4
        style={{
          fontSize: 11,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          color: t.textTertiary,
          marginBottom: 12,
          fontFamily: "'Source Sans 3', system-ui, sans-serif",
        }}
      >
        {title}
      </h4>
      {colors.map(([name, token, color]) => (
        <Swatch key={token} name={name} token={token} color={color} />
      ))}
    </div>
  );
}

function IngredientCard({ type, purpose, config, running, t }) {
  const [hovered, setHovered] = useState(false);
  const edgeColor = cardTypeColors[type] || t.accentPrimary;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: t.surfaceLight,
        border: `1px solid ${t.surfaceMid}`,
        borderLeft: running ? `3px solid ${t.accentSecondary}` : `3px solid ${edgeColor}`,
        borderRadius: 12,
        padding: 20,
        boxShadow: hovered
          ? `0 4px 12px rgba(44, 36, 22, 0.12)`
          : `0 1px 3px rgba(44, 36, 22, 0.08)`,
        transform: hovered ? "scale(1.01)" : "scale(1)",
        transition: "box-shadow 200ms ease, transform 200ms ease",
        cursor: "pointer",
        animation: running ? "pulse-border 2s ease-in-out infinite" : undefined,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 6,
            background: edgeColor + "18",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
          }}
        >
          {type === "Listen" && "👂"}
          {type === "Wait" && "⏳"}
          {type === "Send Message" && "✉️"}
          {type === "Filter" && "🔍"}
          {type === "Decide" && "🔀"}
          {type === "Store" && "🏺"}
        </div>
        <span
          style={{
            fontFamily: "'Fraunces', Georgia, serif",
            fontSize: 16,
            fontWeight: 600,
            color: t.textPrimary,
          }}
        >
          {type}
        </span>
        {running && (
          <span
            style={{
              fontSize: 11,
              color: t.accentSecondary,
              fontWeight: 600,
              marginLeft: "auto",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Running
          </span>
        )}
      </div>
      <div
        style={{
          fontSize: 14,
          color: t.textSecondary,
          marginBottom: config ? 12 : 0,
          lineHeight: 1.5,
        }}
      >
        {purpose}
      </div>
      {config && (
        <div
          style={{
            borderTop: `1px dashed ${t.surfaceMid}`,
            paddingTop: 10,
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          {config.map(([key, value]) => (
            <div key={key} style={{ fontSize: 13, lineHeight: 1.5 }}>
              <span style={{ color: t.textTertiary }}>{key}: </span>
              <span style={{ color: t.textPrimary }}>{value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FlowConnector({ t }) {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "4px 0" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ width: 1, height: 16, background: t.surfaceMid }} />
        <div
          style={{
            width: 0,
            height: 0,
            borderLeft: "4px solid transparent",
            borderRight: "4px solid transparent",
            borderTop: `5px solid ${t.surfaceMid}`,
          }}
        />
      </div>
    </div>
  );
}

function ButtonShowcase({ t }) {
  return (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
      <button
        style={{
          background: t.accentPrimary,
          color: t.textInverse,
          border: "none",
          borderRadius: 8,
          padding: "12px 24px",
          fontSize: 14,
          fontWeight: 500,
          fontFamily: "'Source Sans 3', system-ui, sans-serif",
          cursor: "pointer",
          minHeight: 44,
        }}
      >
        Run this recipe
      </button>
      <button
        style={{
          background: "transparent",
          color: t.accentPrimary,
          border: `1.5px solid ${t.accentPrimary}`,
          borderRadius: 8,
          padding: "12px 24px",
          fontSize: 14,
          fontWeight: 500,
          fontFamily: "'Source Sans 3', system-ui, sans-serif",
          cursor: "pointer",
          minHeight: 44,
        }}
      >
        Share recipe
      </button>
      <button
        style={{
          background: "transparent",
          color: t.textSecondary,
          border: "none",
          padding: "8px 16px",
          fontSize: 14,
          fontFamily: "'Source Sans 3', system-ui, sans-serif",
          cursor: "pointer",
        }}
      >
        Cancel
      </button>
    </div>
  );
}

function SousChefPanel({ t }) {
  const [selected, setSelected] = useState(null);
  const options = [
    "Explain what this does",
    "Change the source",
    "Test this step",
    "I want to ask something else",
  ];

  return (
    <div
      style={{
        background: t.surfaceLightest,
        borderLeft: `1px solid ${t.surfaceMid}`,
        borderRadius: 12,
        padding: 20,
        maxWidth: 300,
      }}
    >
      <div
        style={{
          fontFamily: "'Fraunces', Georgia, serif",
          fontStyle: "italic",
          fontSize: 15,
          color: t.textSecondary,
          marginBottom: 16,
        }}
      >
        What can I help with?
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {options.map((opt, i) => (
          <button
            key={i}
            onClick={() => setSelected(i)}
            style={{
              background: selected === i ? t.accentPrimarySubtle : t.surfaceLight,
              border: `1px solid ${selected === i ? t.accentPrimary : t.surfaceMid}`,
              borderRadius: 8,
              padding: "10px 16px",
              fontSize: 14,
              color: t.textPrimary,
              cursor: "pointer",
              textAlign: "left",
              fontFamily: "'Source Sans 3', system-ui, sans-serif",
              transition: "background 150ms ease, border-color 150ms ease",
            }}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

function ToastExample({ t, type = "info" }) {
  const borderColor =
    type === "error" ? t.statusError : type === "warning" ? t.statusWarning : t.statusInfo;
  const messages = {
    info: "This recipe needs a calendar connection. Want to set one up?",
    warning: "Your shop connection hasn't been used in 30 days",
    error: "Something went wrong with step 3. Want help fixing it?",
  };

  return (
    <div
      style={{
        background: t.surfaceLight,
        border: `1px solid ${t.surfaceMid}`,
        borderLeft: `3px solid ${borderColor}`,
        borderRadius: 8,
        padding: 16,
        maxWidth: 440,
        boxShadow: "0 4px 12px rgba(44, 36, 22, 0.12)",
        fontSize: 14,
        color: t.textPrimary,
        fontFamily: "'Source Sans 3', system-ui, sans-serif",
        lineHeight: 1.5,
      }}
    >
      {messages[type]}
    </div>
  );
}

function EquipmentItem({ name, desc, status, t }) {
  const dotColor =
    status === "connected"
      ? t.accentSecondary
      : status === "error"
      ? t.statusError
      : t.surfaceDark;

  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 8 }}>
      <div
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: status === "disconnected" ? "transparent" : dotColor,
          border: status === "disconnected" ? `1.5px solid ${dotColor}` : "none",
          marginTop: 6,
          flexShrink: 0,
        }}
      />
      <div style={{ fontSize: 14, lineHeight: 1.5 }}>
        <span style={{ fontWeight: 600, color: t.textPrimary }}>{name}</span>
        <span style={{ color: t.textSecondary }}> — {desc}</span>
      </div>
    </div>
  );
}

function InputShowcase({ t }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 360 }}>
      <div>
        <label
          style={{
            display: "block",
            fontSize: 13,
            color: t.textSecondary,
            marginBottom: 4,
            fontFamily: "'Source Sans 3', system-ui, sans-serif",
          }}
        >
          How long
        </label>
        <input
          type="text"
          defaultValue="3 days"
          style={{
            width: "100%",
            boxSizing: "border-box",
            background: t.surfaceLightest,
            border: `1.5px solid ${t.surfaceMid}`,
            borderRadius: 8,
            padding: "12px 16px",
            fontSize: 16,
            color: t.textPrimary,
            fontFamily: "'Source Sans 3', system-ui, sans-serif",
            outline: "none",
          }}
          onFocus={(e) => (e.target.style.borderColor = t.accentPrimary)}
          onBlur={(e) => (e.target.style.borderColor = t.surfaceMid)}
        />
      </div>
      <div>
        <label
          style={{
            display: "block",
            fontSize: 13,
            color: t.textSecondary,
            marginBottom: 4,
            fontFamily: "'Source Sans 3', system-ui, sans-serif",
          }}
        >
          Style
        </label>
        <input
          type="text"
          placeholder="warm, personal, grateful"
          style={{
            width: "100%",
            boxSizing: "border-box",
            background: t.surfaceLightest,
            border: `1.5px solid ${t.surfaceMid}`,
            borderRadius: 8,
            padding: "12px 16px",
            fontSize: 16,
            color: t.textPrimary,
            fontFamily: "'Source Sans 3', system-ui, sans-serif",
            outline: "none",
          }}
          onFocus={(e) => (e.target.style.borderColor = t.accentPrimary)}
          onBlur={(e) => (e.target.style.borderColor = t.surfaceMid)}
        />
      </div>
    </div>
  );
}

export default function AICardDesignSystem() {
  const [mode, setMode] = useState("light");
  const t = theme[mode];
  const [section, setSection] = useState("overview");

  const sections = [
    { id: "overview", label: "Overview" },
    { id: "colors", label: "Colors" },
    { id: "typography", label: "Typography" },
    { id: "cards", label: "Cards" },
    { id: "recipe", label: "Recipe" },
    { id: "souschef", label: "Sous Chef" },
    { id: "components", label: "Components" },
  ];

  return (
    <div
      style={{
        background: t.surfaceLightest,
        color: t.textPrimary,
        minHeight: "100vh",
        fontFamily: "'Source Sans 3', system-ui, sans-serif",
        transition: "background 300ms ease, color 300ms ease",
      }}
    >
      {/* Header */}
      <div
        style={{
          borderBottom: `1px solid ${t.surfaceMid}`,
          padding: "16px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          background: t.surfaceLightest,
          zIndex: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
          <h1
            style={{
              fontFamily: "'Fraunces', Georgia, serif",
              fontSize: 22,
              fontWeight: 700,
              margin: 0,
              color: t.textPrimary,
            }}
          >
            <span style={{ fontWeight: 400, opacity: 0.7 }}>AI</span>Card
          </h1>
          <span style={{ fontSize: 13, color: t.textTertiary }}>Design System v1.0</span>
        </div>
        <button
          onClick={() => setMode(mode === "light" ? "dark" : "light")}
          style={{
            background: t.surfaceLight,
            border: `1px solid ${t.surfaceMid}`,
            borderRadius: 8,
            padding: "8px 16px",
            fontSize: 13,
            color: t.textSecondary,
            cursor: "pointer",
            fontFamily: "'Source Sans 3', system-ui, sans-serif",
          }}
        >
          {mode === "light" ? "Dark mode" : "Light mode"}
        </button>
      </div>

      <div style={{ display: "flex", maxWidth: 1200, margin: "0 auto" }}>
        {/* Nav */}
        <nav
          style={{
            width: 160,
            flexShrink: 0,
            padding: "24px 0 24px 24px",
            position: "sticky",
            top: 60,
            alignSelf: "flex-start",
          }}
        >
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => setSection(s.id)}
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                background: section === s.id ? t.accentPrimarySubtle : "transparent",
                color: section === s.id ? t.accentPrimary : t.textSecondary,
                border: "none",
                borderRadius: 6,
                padding: "8px 12px",
                fontSize: 14,
                fontWeight: section === s.id ? 600 : 400,
                cursor: "pointer",
                marginBottom: 2,
                fontFamily: "'Source Sans 3', system-ui, sans-serif",
                transition: "background 150ms ease",
              }}
            >
              {s.label}
            </button>
          ))}
        </nav>

        {/* Content */}
        <main style={{ flex: 1, padding: "32px 32px 64px" }}>
          {/* OVERVIEW */}
          {section === "overview" && (
            <div>
              <h2
                style={{
                  fontFamily: "'Fraunces', Georgia, serif",
                  fontSize: 32,
                  fontWeight: 600,
                  marginBottom: 8,
                  lineHeight: 1.2,
                }}
              >
                A kitchen that invites you to cook
              </h2>
              <p
                style={{
                  fontSize: 18,
                  color: t.textSecondary,
                  lineHeight: 1.6,
                  maxWidth: 600,
                  marginBottom: 32,
                }}
              >
                AICard's visual language is warm, clear, and crafted. It feels like a well-organized
                kitchen — not a developer dashboard, not an automation platform, not a generic SaaS
                product.
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: 16,
                  marginBottom: 40,
                }}
              >
                {[
                  {
                    title: "Warmth",
                    desc: "Earthy palette, generous spacing, readable type. Maria feels welcomed.",
                  },
                  {
                    title: "Clarity",
                    desc: "Every element has one purpose. No noise, no competing hierarchies.",
                  },
                  {
                    title: "Craft",
                    desc: "Consistent spacing. Considered color. Every pixel intentional.",
                  },
                ].map((p) => (
                  <div
                    key={p.title}
                    style={{
                      background: t.surfaceLight,
                      borderRadius: 12,
                      padding: 20,
                      border: `1px solid ${t.surfaceMid}`,
                    }}
                  >
                    <h3
                      style={{
                        fontFamily: "'Fraunces', Georgia, serif",
                        fontSize: 18,
                        marginBottom: 8,
                        fontWeight: 600,
                      }}
                    >
                      {p.title}
                    </h3>
                    <p
                      style={{
                        fontSize: 14,
                        color: t.textSecondary,
                        lineHeight: 1.5,
                        margin: 0,
                      }}
                    >
                      {p.desc}
                    </p>
                  </div>
                ))}
              </div>

              <div
                style={{
                  background: t.accentPrimarySubtle,
                  borderRadius: 12,
                  padding: 24,
                  borderLeft: `3px solid ${t.accentPrimary}`,
                }}
              >
                <div
                  style={{
                    fontFamily: "'Fraunces', Georgia, serif",
                    fontStyle: "italic",
                    fontSize: 16,
                    color: t.textSecondary,
                    lineHeight: 1.6,
                  }}
                >
                  "Can a person who has never heard of APIs, JSON, or webhooks build something useful
                  with this? If yes, we're on track. If not, we've failed — no matter how powerful
                  the tool is underneath."
                </div>
              </div>
            </div>
          )}

          {/* COLORS */}
          {section === "colors" && (
            <div>
              <h2
                style={{
                  fontFamily: "'Fraunces', Georgia, serif",
                  fontSize: 28,
                  fontWeight: 600,
                  marginBottom: 8,
                }}
              >
                Color palette
              </h2>
              <p
                style={{
                  fontSize: 16,
                  color: t.textSecondary,
                  lineHeight: 1.6,
                  marginBottom: 32,
                  maxWidth: 540,
                }}
              >
                Drawn from the kitchen — terracotta, linen, wood, copper, and fresh herbs. No
                blue-purple-gray developer palettes.
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
                <ColorGroup
                  t={t}
                  title="Surfaces"
                  colors={[
                    ["Lightest", "--surface-lightest", t.surfaceLightest],
                    ["Light", "--surface-light", t.surfaceLight],
                    ["Mid", "--surface-mid", t.surfaceMid],
                    ["Dark", "--surface-dark", t.surfaceDark],
                    ["Darkest", "--surface-darkest", t.surfaceDarkest],
                  ]}
                />
                <ColorGroup
                  t={t}
                  title="Text"
                  colors={[
                    ["Primary", "--text-primary", t.textPrimary],
                    ["Secondary", "--text-secondary", t.textSecondary],
                    ["Tertiary", "--text-tertiary", t.textTertiary],
                    ["Inverse", "--text-inverse", t.textInverse],
                  ]}
                />
                <ColorGroup
                  t={t}
                  title="Accent"
                  colors={[
                    ["Primary (Copper)", "--accent-primary", t.accentPrimary],
                    ["Primary hover", "--accent-primary-hover", t.accentPrimaryHover],
                    ["Primary subtle", "--accent-primary-subtle", t.accentPrimarySubtle],
                    ["Secondary (Herb)", "--accent-secondary", t.accentSecondary],
                    ["Secondary hover", "--accent-secondary-hover", t.accentSecondaryHover],
                    ["Secondary subtle", "--accent-secondary-subtle", t.accentSecondarySubtle],
                  ]}
                />
                <ColorGroup
                  t={t}
                  title="Status"
                  colors={[
                    ["Info", "--status-info", t.statusInfo],
                    ["Warning", "--status-warning", t.statusWarning],
                    ["Error", "--status-error", t.statusError],
                    ["Success", "--status-success", t.statusSuccess],
                  ]}
                />
              </div>

              <div style={{ marginTop: 32 }}>
                <h3
                  style={{
                    fontSize: 11,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    color: t.textTertiary,
                    marginBottom: 12,
                  }}
                >
                  Card type indicators
                </h3>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {Object.entries(cardTypeColors).map(([name, color]) => (
                    <div
                      key={name}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        background: t.surfaceLight,
                        borderLeft: `3px solid ${color}`,
                        borderRadius: 6,
                        padding: "6px 12px",
                        fontSize: 13,
                      }}
                    >
                      {name}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TYPOGRAPHY */}
          {section === "typography" && (
            <div>
              <h2
                style={{
                  fontFamily: "'Fraunces', Georgia, serif",
                  fontSize: 28,
                  fontWeight: 600,
                  marginBottom: 8,
                }}
              >
                Typography
              </h2>
              <p
                style={{
                  fontSize: 16,
                  color: t.textSecondary,
                  lineHeight: 1.6,
                  marginBottom: 32,
                  maxWidth: 540,
                }}
              >
                A warm serif for display, a humanist sans-serif for body. Warm for Maria,
                quality for Sam.
              </p>

              <div style={{ marginBottom: 32 }}>
                <div style={{ marginBottom: 24 }}>
                  <span
                    style={{
                      fontSize: 11,
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      color: t.textTertiary,
                    }}
                  >
                    Display · Fraunces
                  </span>
                </div>
                {[
                  { size: 40, weight: 700, label: "3xl · 40px · Bold" },
                  { size: 32, weight: 600, label: "2xl · 32px · Semibold" },
                  { size: 25, weight: 600, label: "xl · 25px · Semibold" },
                  { size: 20, weight: 500, label: "lg · 20px · Medium" },
                ].map((item) => (
                  <div key={item.label} style={{ marginBottom: 16 }}>
                    <div
                      style={{
                        fontFamily: "'Fraunces', Georgia, serif",
                        fontSize: item.size,
                        fontWeight: item.weight,
                        lineHeight: 1.2,
                        color: t.textPrimary,
                      }}
                    >
                      Thank You Follow-Up
                    </div>
                    <div style={{ fontSize: 12, color: t.textTertiary, marginTop: 4 }}>
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginBottom: 32 }}>
                <div style={{ marginBottom: 24 }}>
                  <span
                    style={{
                      fontSize: 11,
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      color: t.textTertiary,
                    }}
                  >
                    Body · Source Sans 3
                  </span>
                </div>
                {[
                  {
                    size: 18,
                    text: "When a new order comes in, wait three days, then send a personalized thank-you message.",
                    label: "md · 18px · Purpose text",
                  },
                  {
                    size: 16,
                    text: "Write it the way you'd explain it to someone writing on your behalf — not the exact words, but the intent.",
                    label: "base · 16px · Body text",
                  },
                  {
                    size: 14,
                    text: "Optional — leave this out and the AI will choose something appropriate",
                    label: "sm · 14px · Helper text",
                  },
                  {
                    size: 12,
                    text: "Last run: 3 hours ago · Next run: when a new order arrives",
                    label: "xs · 12px · Metadata",
                  },
                ].map((item) => (
                  <div key={item.label} style={{ marginBottom: 16, maxWidth: 520 }}>
                    <div
                      style={{
                        fontSize: item.size,
                        lineHeight: 1.6,
                        color: t.textPrimary,
                      }}
                    >
                      {item.text}
                    </div>
                    <div style={{ fontSize: 12, color: t.textTertiary, marginTop: 4 }}>
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <div style={{ marginBottom: 16 }}>
                  <span
                    style={{
                      fontSize: 11,
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      color: t.textTertiary,
                    }}
                  >
                    Sous chef voice · Italic
                  </span>
                </div>
                <div
                  style={{
                    fontStyle: "italic",
                    fontSize: 15,
                    color: t.textSecondary,
                    lineHeight: 1.6,
                    maxWidth: 440,
                    paddingLeft: 16,
                    borderLeft: `2px solid ${t.surfaceMid}`,
                  }}
                >
                  This recipe needs a shop connection to receive order notifications. Want to set
                  one up?
                </div>
              </div>
            </div>
          )}

          {/* CARDS */}
          {section === "cards" && (
            <div>
              <h2
                style={{
                  fontFamily: "'Fraunces', Georgia, serif",
                  fontSize: 28,
                  fontWeight: 600,
                  marginBottom: 8,
                }}
              >
                Ingredient cards
              </h2>
              <p
                style={{
                  fontSize: 16,
                  color: t.textSecondary,
                  lineHeight: 1.6,
                  marginBottom: 32,
                  maxWidth: 540,
                }}
              >
                Cards look like physical objects — things you can pick up, move, and arrange. Hover
                to see the lift effect.
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 16,
                  marginBottom: 32,
                }}
              >
                <IngredientCard
                  t={t}
                  type="Listen"
                  purpose="Watches for something to happen and starts the recipe when it does."
                  config={[
                    ["Source", "shop order notifications"],
                    ["Watch for", "new orders"],
                  ]}
                />
                <IngredientCard
                  t={t}
                  type="Wait"
                  purpose="Pauses the recipe for a set amount of time before continuing."
                  config={[["How long", "3 days"]]}
                />
                <IngredientCard
                  t={t}
                  type="Send Message"
                  purpose="Writes and sends a message through a connected account."
                  config={[
                    ["To", "customer from the order"],
                    ["Style", "warm, personal, grateful"],
                  ]}
                />
                <IngredientCard
                  t={t}
                  type="Filter"
                  purpose="Decides what passes through and what doesn't."
                  config={[["Sort by", "topic and urgency"]]}
                />
              </div>

              <h3
                style={{
                  fontSize: 11,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: t.textTertiary,
                  marginBottom: 12,
                }}
              >
                Running state
              </h3>
              <div style={{ maxWidth: 400 }}>
                <IngredientCard
                  t={t}
                  type="Listen"
                  purpose="Watches for something to happen and starts the recipe when it does."
                  config={[["Source", "shop order notifications"]]}
                  running
                />
              </div>
            </div>
          )}

          {/* RECIPE */}
          {section === "recipe" && (
            <div>
              <h2
                style={{
                  fontFamily: "'Fraunces', Georgia, serif",
                  fontSize: 28,
                  fontWeight: 600,
                  marginBottom: 8,
                }}
              >
                Recipe view
              </h2>
              <p
                style={{
                  fontSize: 16,
                  color: t.textSecondary,
                  lineHeight: 1.6,
                  marginBottom: 32,
                  maxWidth: 540,
                }}
              >
                A recipe reads top to bottom like a document — not a diagram. Sequential, readable,
                inspectable.
              </p>

              <div
                style={{
                  background: t.surfaceLight,
                  borderRadius: 16,
                  padding: 32,
                  maxWidth: 520,
                  border: `1px solid ${t.surfaceMid}`,
                }}
              >
                <h3
                  style={{
                    fontFamily: "'Fraunces', Georgia, serif",
                    fontSize: 25,
                    fontWeight: 600,
                    marginBottom: 8,
                  }}
                >
                  Thank You Follow-Up
                </h3>
                <p
                  style={{
                    fontSize: 16,
                    color: t.textSecondary,
                    lineHeight: 1.6,
                    marginBottom: 24,
                  }}
                >
                  When a new order comes in, wait three days, then send a personalized thank-you
                  message to the customer.
                </p>

                <div
                  style={{
                    borderTop: `1px solid ${t.surfaceMid}`,
                    paddingTop: 16,
                    marginBottom: 24,
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      textTransform: "uppercase",
                      letterSpacing: "0.12em",
                      color: t.textTertiary,
                      marginBottom: 12,
                      fontWeight: 600,
                    }}
                  >
                    Kitchen
                  </div>
                  <EquipmentItem
                    t={t}
                    name="Shop connection"
                    desc="receives new order notifications"
                    status="connected"
                  />
                  <EquipmentItem
                    t={t}
                    name="Email account"
                    desc="sends outgoing messages"
                    status="connected"
                  />
                </div>

                <div style={{ borderTop: `1px solid ${t.surfaceMid}`, paddingTop: 16 }}>
                  <div
                    style={{
                      fontSize: 11,
                      textTransform: "uppercase",
                      letterSpacing: "0.12em",
                      color: t.textTertiary,
                      marginBottom: 16,
                      fontWeight: 600,
                    }}
                  >
                    Steps
                  </div>

                  <div
                    style={{
                      background: t.surfaceLightest,
                      borderRadius: 10,
                      padding: 16,
                      borderLeft: `3px solid ${cardTypeColors.Listen}`,
                      marginBottom: 4,
                    }}
                  >
                    <div style={{ fontSize: 12, color: t.textTertiary, marginBottom: 4 }}>
                      1 · Listen
                    </div>
                    <div style={{ fontWeight: 500, marginBottom: 6, fontSize: 15 }}>
                      Listen for a new order
                    </div>
                    <div style={{ fontSize: 13, color: t.textSecondary }}>
                      <span style={{ color: t.textTertiary }}>Source:</span> shop order
                      notifications
                    </div>
                  </div>

                  <FlowConnector t={t} />

                  <div
                    style={{
                      background: t.surfaceLightest,
                      borderRadius: 10,
                      padding: 16,
                      borderLeft: `3px solid ${cardTypeColors.Wait}`,
                      marginBottom: 4,
                    }}
                  >
                    <div style={{ fontSize: 12, color: t.textTertiary, marginBottom: 4 }}>
                      2 · Wait
                    </div>
                    <div style={{ fontWeight: 500, marginBottom: 6, fontSize: 15 }}>
                      Wait before following up
                    </div>
                    <div style={{ fontSize: 13, color: t.textSecondary }}>
                      <span style={{ color: t.textTertiary }}>How long:</span> 3 days
                    </div>
                  </div>

                  <FlowConnector t={t} />

                  <div
                    style={{
                      background: t.surfaceLightest,
                      borderRadius: 10,
                      padding: 16,
                      borderLeft: `3px solid ${cardTypeColors["Send Message"]}`,
                    }}
                  >
                    <div style={{ fontSize: 12, color: t.textTertiary, marginBottom: 4 }}>
                      3 · Send Message
                    </div>
                    <div style={{ fontWeight: 500, marginBottom: 6, fontSize: 15 }}>
                      Send a thank-you message
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        color: t.textSecondary,
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                      }}
                    >
                      <div>
                        <span style={{ color: t.textTertiary }}>To:</span> customer from the order
                      </div>
                      <div>
                        <span style={{ color: t.textTertiary }}>Style:</span> warm, personal,
                        grateful
                      </div>
                      <div>
                        <span style={{ color: t.textTertiary }}>Message idea:</span> thank them for
                        their order, mention what they bought
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SOUS CHEF */}
          {section === "souschef" && (
            <div>
              <h2
                style={{
                  fontFamily: "'Fraunces', Georgia, serif",
                  fontSize: 28,
                  fontWeight: 600,
                  marginBottom: 8,
                }}
              >
                Sous chef
              </h2>
              <p
                style={{
                  fontSize: 16,
                  color: t.textSecondary,
                  lineHeight: 1.6,
                  marginBottom: 32,
                  maxWidth: 540,
                }}
              >
                Present but quiet. Options first, conversation second. The chef's hat button, the
                options panel, and the toast notifications.
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 32,
                  marginBottom: 40,
                }}
              >
                <div>
                  <h3
                    style={{
                      fontSize: 11,
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      color: t.textTertiary,
                      marginBottom: 16,
                    }}
                  >
                    Options panel
                  </h3>
                  <SousChefPanel t={t} />
                </div>

                <div>
                  <h3
                    style={{
                      fontSize: 11,
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      color: t.textTertiary,
                      marginBottom: 16,
                    }}
                  >
                    Chef's hat button
                  </h3>
                  <div
                    style={{
                      display: "flex",
                      gap: 16,
                      alignItems: "center",
                      marginBottom: 32,
                    }}
                  >
                    {["Resting", "Notification", "Active"].map((state, i) => (
                      <div key={state} style={{ textAlign: "center" }}>
                        <div
                          style={{
                            width: 48,
                            height: 48,
                            borderRadius: "50%",
                            background:
                              i === 2 ? t.accentPrimaryHover : t.accentPrimary,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 20,
                            boxShadow: "0 2px 8px rgba(44, 36, 22, 0.2)",
                            position: "relative",
                            margin: "0 auto 8px",
                          }}
                        >
                          {i === 2 ? "✕" : "👨‍🍳"}
                          {i === 1 && (
                            <div
                              style={{
                                position: "absolute",
                                top: 2,
                                right: 2,
                                width: 10,
                                height: 10,
                                borderRadius: "50%",
                                background: t.statusInfo,
                                border: `2px solid ${t.surfaceLightest}`,
                              }}
                            />
                          )}
                        </div>
                        <div style={{ fontSize: 12, color: t.textTertiary }}>{state}</div>
                      </div>
                    ))}
                  </div>

                  <h3
                    style={{
                      fontSize: 11,
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      color: t.textTertiary,
                      marginBottom: 16,
                    }}
                  >
                    Toast notifications
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <ToastExample t={t} type="info" />
                    <ToastExample t={t} type="warning" />
                    <ToastExample t={t} type="error" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* COMPONENTS */}
          {section === "components" && (
            <div>
              <h2
                style={{
                  fontFamily: "'Fraunces', Georgia, serif",
                  fontSize: 28,
                  fontWeight: 600,
                  marginBottom: 8,
                }}
              >
                Components
              </h2>
              <p
                style={{
                  fontSize: 16,
                  color: t.textSecondary,
                  lineHeight: 1.6,
                  marginBottom: 32,
                  maxWidth: 540,
                }}
              >
                Buttons, form inputs, and equipment indicators — the building blocks of every
                interaction.
              </p>

              <div style={{ marginBottom: 40 }}>
                <h3
                  style={{
                    fontSize: 11,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    color: t.textTertiary,
                    marginBottom: 16,
                  }}
                >
                  Buttons
                </h3>
                <ButtonShowcase t={t} />
              </div>

              <div style={{ marginBottom: 40 }}>
                <h3
                  style={{
                    fontSize: 11,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    color: t.textTertiary,
                    marginBottom: 16,
                  }}
                >
                  Form inputs
                </h3>
                <InputShowcase t={t} />
              </div>

              <div style={{ marginBottom: 40 }}>
                <h3
                  style={{
                    fontSize: 11,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    color: t.textTertiary,
                    marginBottom: 16,
                  }}
                >
                  Equipment status
                </h3>
                <div
                  style={{
                    background: t.surfaceLight,
                    borderRadius: 12,
                    padding: 20,
                    maxWidth: 360,
                    border: `1px solid ${t.surfaceMid}`,
                  }}
                >
                  <EquipmentItem
                    t={t}
                    name="Shop connection"
                    desc="receives order notifications"
                    status="connected"
                  />
                  <EquipmentItem
                    t={t}
                    name="Email account"
                    desc="sends messages"
                    status="connected"
                  />
                  <EquipmentItem
                    t={t}
                    name="Calendar"
                    desc="not connected yet"
                    status="disconnected"
                  />
                  <EquipmentItem
                    t={t}
                    name="File storage"
                    desc="connection lost"
                    status="error"
                  />
                </div>
              </div>

              <div>
                <h3
                  style={{
                    fontSize: 11,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    color: t.textTertiary,
                    marginBottom: 16,
                  }}
                >
                  Spacing scale (8px base)
                </h3>
                <div style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}>
                  {[4, 8, 12, 16, 24, 32, 48, 64].map((s, i) => (
                    <div key={s} style={{ textAlign: "center" }}>
                      <div
                        style={{
                          width: s,
                          height: s,
                          background: t.accentPrimary + "30",
                          border: `1px solid ${t.accentPrimary}60`,
                          borderRadius: 2,
                          marginBottom: 4,
                        }}
                      />
                      <div style={{ fontSize: 11, color: t.textTertiary }}>{s}px</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

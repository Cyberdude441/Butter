import React, { useState, useEffect, useRef } from "react";

export default function AICoPilotDrawer({ isOpen, onClose, forecastContext = {}, currentRoute = {} }) {
  const [messages, setMessages] = useState([
    {
      id: "init",
      role: "assistant",
      text: "Hello! I am your **Freight AI Co-Pilot**. I can analyze your active trade route, multi-horizon freight forecasts, vessel optimization, port congestion delays, and chartering strategy. What would you like to know?",
      sources: ["Freight Forecaster", "Port Optimizer", "Vessel Optimization Engine"],
      suggestions: [
        "Why this vessel?",
        "Should I charter now?",
        "How much time can I save?",
        "Compare vessel options",
        "Why this port?",
      ],
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend) => {
    const query = (textToSend || inputValue).trim();
    if (!query || loading) return;

    setError("");
    const userMsg = { id: String(Date.now()), role: "user", text: query };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setLoading(true);

    try {
      // Build conversation history excluding initial greeting
      const history = messages
        .filter((m) => m.id !== "init")
        .map((m) => ({ role: m.role, text: m.text }));

      const res = await fetch("http://localhost:7000/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: query,
          conversationHistory: history,
          forecastContext,
          currentRoute,
          currentOptimization: forecastContext?.vessel_optimization || forecastContext?.vesselOptimization,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to get AI response");
      }

      const botMsg = {
        id: String(Date.now() + 1),
        role: "assistant",
        text: data.answer,
        sources: data.sources || [],
        suggestions: data.suggestions || [],
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error("AI Co-Pilot chat error:", err);
      setError("AI Co-Pilot is temporarily unavailable. Please try again.");
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now() + 1),
          role: "assistant",
          text: "⚠️ I encountered a temporary connection issue. Please try asking your question again.",
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Simple safe markdown formatter for bolding, bullet points, headers
  const renderFormattedText = (text) => {
    if (!text) return "";
    const lines = text.split("\n");
    return lines.map((line, idx) => {
      // Headers
      if (line.startsWith("### ")) {
        return <h6 key={idx} className="fw-bold mt-2 mb-1" style={{ color: "#38bdf8" }}>{line.replace("### ", "")}</h6>;
      }
      if (line.startsWith("## ")) {
        return <h5 key={idx} className="fw-bold mt-2 mb-1" style={{ color: "#38bdf8" }}>{line.replace("## ", "")}</h5>;
      }
      // Bullet points
      if (line.startsWith("- ") || line.startsWith("• ") || line.startsWith("* ")) {
        const itemContent = line.replace(/^[-•*]\s+/, "");
        return (
          <li key={idx} className="mb-1" style={{ listStyleType: "disc" }}>
            {formatInlineText(itemContent)}
          </li>
        );
      }
      // Numbered lists
      if (/^\d+\.\s+/.test(line)) {
        const itemContent = line.replace(/^\d+\.\s+/, "");
        return (
          <div key={idx} className="mb-1 d-flex gap-2">
            <span style={{ color: "#38bdf8", fontWeight: "bold" }}>{line.match(/^\d+\./)[0]}</span>
            <span>{formatInlineText(itemContent)}</span>
          </div>
        );
      }
      // Standard paragraph
      if (line.trim() === "") return <div key={idx} style={{ height: "6px" }} />;
      return <p key={idx} className="mb-1">{formatInlineText(line)}</p>;
    });
  };

  const formatInlineText = (str) => {
    const parts = str.split(/(\*{1,2}.*?\*{1,2})/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i} style={{ color: "#f8fafc" }}>{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith("*") && part.endsWith("*")) {
        return <em key={i}>{part.slice(1, -1)}</em>;
      }
      return part;
    });
  };

  const hasActiveForecast = Boolean(forecastContext?.latestRate || forecastContext?.predictedRate || forecastContext?.forecast30Day?.rate);
  const originName = forecastContext?.origin || currentRoute?.origin || "Australia";
  const destName = forecastContext?.destination || currentRoute?.destination || "Paradip";
  const vesselName = forecastContext?.vesselType || forecastContext?.vessel_type || "Panamax";

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="position-fixed top-0 start-0 w-100 h-100"
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.65)",
          backdropFilter: "blur(3px)",
          zIndex: 1040,
        }}
        onClick={onClose}
      />

      {/* Drawer Container */}
      <div
        className="position-fixed top-0 end-0 h-100 d-flex flex-column shadow-2xl"
        style={{
          width: "480px",
          maxWidth: "96vw",
          backgroundColor: "#070d18",
          borderLeft: "1px solid #162234",
          zIndex: 1050,
          boxShadow: "-10px 0 30px rgba(0, 0, 0, 0.8)",
          fontFamily: "system-ui, -apple-system, sans-serif",
          animation: "slideInRight 0.25s ease-out",
        }}
      >
        {/* Top Header */}
        <div
          className="p-3.5 px-4 d-flex align-items-center justify-content-between flex-shrink-0"
          style={{
            backgroundColor: "#0b1320",
            borderBottom: "1px solid #162234",
          }}
        >
          <div className="d-flex align-items-center gap-2.5">
            <span
              className="d-flex align-items-center justify-content-center rounded-3 fs-5"
              style={{
                width: "36px",
                height: "36px",
                backgroundColor: "rgba(56, 189, 248, 0.15)",
                border: "1px solid rgba(56, 189, 248, 0.3)",
                color: "#38bdf8",
              }}
            >
              ✦
            </span>
            <div>
              <h6 className="fw-bold mb-0 text-white d-flex align-items-center gap-2">
                Freight AI Co-Pilot
                <span className="badge rounded-pill bg-success-subtle text-success border border-success-subtle" style={{ fontSize: "0.65rem", padding: "2px 6px" }}>
                  Active
                </span>
              </h6>
              <small style={{ color: "#64748b", fontSize: "0.75rem" }}>
                Powered by Gemini • Context-aware
              </small>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-sm text-secondary p-1 d-flex align-items-center justify-content-center rounded-circle"
            style={{ width: "32px", height: "32px", border: "1px solid #1e293b", backgroundColor: "transparent" }}
            onClick={onClose}
            aria-label="Close Co-Pilot"
          >
            ✕
          </button>
        </div>

        {/* Live Context Strip */}
        <div
          className="px-4 py-2 d-flex align-items-center justify-content-between"
          style={{
            backgroundColor: "#08101e",
            borderBottom: "1px solid #141f30",
            fontSize: "0.78rem",
            color: "#94a3b8",
          }}
        >
          {hasActiveForecast ? (
            <div className="d-flex align-items-center gap-2 text-truncate">
              <span style={{ color: "#38bdf8" }}>⚓ {originName} → {destName}</span>
              <span>•</span>
              <span className="text-white fw-medium">{vesselName}</span>
              <span>•</span>
              <span className="text-success fw-medium">${forecastContext?.latestRate || forecastContext?.forecast30Day?.rate}/MT</span>
            </div>
          ) : (
            <div className="d-flex align-items-center gap-1.5 text-warning-emphasis">
              <span>💡</span>
              <span>General maritime knowledge mode (No active forecast query)</span>
            </div>
          )}

          <button
            className="btn btn-link p-0 text-decoration-none"
            style={{ fontSize: "0.72rem", color: "#64748b" }}
            onClick={() => setMessages([messages[0]])}
            title="Clear Chat History"
          >
            Clear
          </button>
        </div>

        {/* Message Thread (Scrollable) */}
        <div
          className="flex-grow-1 p-3.5 px-4 overflow-y-auto d-flex flex-column gap-3"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "#1e293b transparent",
          }}
        >
          {messages.map((m) => {
            const isUser = m.role === "user";
            return (
              <div
                key={m.id}
                className={`d-flex flex-column ${isUser ? "align-items-end" : "align-items-start"}`}
                style={{ maxWidth: "100%" }}
              >
                <div
                  className="rounded-4 p-3 shadow-xs"
                  style={{
                    maxWidth: "92%",
                    backgroundColor: isUser ? "#0284c7" : "#0c1524",
                    color: isUser ? "#ffffff" : "#cbd5e1",
                    border: isUser ? "none" : "1px solid #162438",
                    fontSize: "0.9rem",
                    lineHeight: "1.55",
                    wordBreak: "break-word",
                  }}
                >
                  {isUser ? m.text : renderFormattedText(m.text)}
                </div>

                {/* Sources & Suggestion Chips for Assistant Messages */}
                {!isUser && (
                  <div className="mt-2 w-100" style={{ maxWidth: "96%" }}>
                    {/* Source tags */}
                    {m.sources?.length > 0 && (
                      <div className="d-flex flex-wrap gap-1 mb-2">
                        {m.sources.map((s, idx) => (
                          <span
                            key={idx}
                            className="badge rounded-pill"
                            style={{
                              backgroundColor: "rgba(56, 189, 248, 0.08)",
                              color: "#38bdf8",
                              border: "1px solid rgba(56, 189, 248, 0.2)",
                              fontSize: "0.68rem",
                              fontWeight: "500",
                            }}
                          >
                            ✓ {s}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Suggestion Chips */}
                    {m.suggestions?.length > 0 && (
                      <div className="d-flex flex-wrap gap-1.5 mt-1.5">
                        {m.suggestions.map((chip, idx) => (
                          <button
                            key={idx}
                            type="button"
                            className="btn btn-sm rounded-pill text-start"
                            style={{
                              backgroundColor: "#0d1b2e",
                              border: "1px solid #1e3a5f",
                              color: "#93c5fd",
                              fontSize: "0.75rem",
                              padding: "4px 10px",
                              transition: "all 0.15s ease",
                            }}
                            onClick={() => handleSendMessage(chip)}
                          >
                            ✦ {chip}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Typing Indicator */}
          {loading && (
            <div className="d-flex align-items-center gap-2 p-3 rounded-4" style={{ backgroundColor: "#0c1524", border: "1px solid #162438", width: "fit-content" }}>
              <div className="spinner-border spinner-border-sm text-info" role="status" style={{ width: "1rem", height: "1rem" }} />
              <span style={{ color: "#94a3b8", fontSize: "0.85rem" }}>Analyzing route & freight data...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Bar at Bottom */}
        <div
          className="px-3 pt-2 pb-1 d-flex gap-1.5 overflow-x-auto flex-shrink-0"
          style={{
            backgroundColor: "#070d18",
            borderTop: "1px solid #141f30",
            scrollbarWidth: "none",
          }}
        >
          {["Why this vessel?", "Should I charter now?", "How much time can I save?", "Compare port alternatives"].map((q, idx) => (
            <button
              key={idx}
              type="button"
              className="btn btn-sm rounded-pill flex-shrink-0"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.04)",
                border: "1px solid #1e293b",
                color: "#94a3b8",
                fontSize: "0.72rem",
                padding: "3px 8px",
              }}
              onClick={() => handleSendMessage(q)}
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div
          className="p-3 px-4 flex-shrink-0"
          style={{
            backgroundColor: "#0b1320",
            borderTop: "1px solid #162234",
          }}
        >
          {error && (
            <div className="small text-danger mb-2" style={{ fontSize: "0.78rem" }}>
              {error}
            </div>
          )}

          <div className="d-flex align-items-center gap-2">
            <textarea
              ref={inputRef}
              rows={1}
              className="form-control"
              placeholder="Ask about your route, market, vessel or forecast..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              style={{
                backgroundColor: "#070d18",
                border: "1px solid #1e293b",
                color: "#ffffff",
                fontSize: "0.88rem",
                borderRadius: "12px",
                resize: "none",
                padding: "10px 14px",
              }}
            />

            <button
              type="button"
              className="btn d-flex align-items-center justify-content-center rounded-3 flex-shrink-0"
              style={{
                backgroundColor: inputValue.trim() && !loading ? "#0284c7" : "#1e293b",
                color: "#ffffff",
                width: "42px",
                height: "42px",
                border: "none",
                transition: "all 0.2s ease",
              }}
              disabled={!inputValue.trim() || loading}
              onClick={() => handleSendMessage()}
              aria-label="Send message"
            >
              ➤
            </button>
          </div>
          <div className="d-flex justify-content-between mt-1.5">
            <small style={{ color: "#475569", fontSize: "0.68rem" }}>
              Press Enter to send, Shift+Enter for new line
            </small>
            <small style={{ color: "#475569", fontSize: "0.68rem" }}>
              Grounded in ML Model & Port Database
            </small>
          </div>
        </div>
      </div>
    </>
  );
}

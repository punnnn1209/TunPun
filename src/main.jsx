import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, info) {
    // Still visible in the browser console for deeper debugging.
    console.error("App crashed:", error, info);
  }
  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            textAlign: "center",
            fontFamily: "sans-serif",
            background: "#fff1f2",
          }}
        >
          <div style={{ fontSize: 40, marginBottom: 8 }}>😵‍💫</div>
          <div style={{ fontWeight: 800, marginBottom: 8, color: "#374151" }}>App bị lỗi khi hiển thị</div>
          <div
            style={{
              fontSize: 12,
              color: "#9ca3af",
              maxWidth: 320,
              marginBottom: 16,
              wordBreak: "break-word",
              fontFamily: "monospace",
            }}
          >
            {String(this.state.error?.message || this.state.error)}
          </div>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: "#fb7185",
              color: "#fff",
              fontWeight: 700,
              padding: "10px 20px",
              borderRadius: 999,
              border: "none",
              cursor: "pointer",
            }}
          >
            Tải lại trang
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
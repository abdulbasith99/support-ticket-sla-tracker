import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Headphones,
  LifeBuoy,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";

import {
  useState,
  type FormEvent,
} from "react";

import {
  Link,
  Navigate,
  useNavigate,
} from "react-router-dom";

import {
  Button,
} from "../components/ui/Button";

import {
  ErrorBanner,
} from "../components/ui/ErrorBanner";

import {
  useAuth,
} from "../context/AuthContext";

import type {
  UserRole,
} from "../types";

type LoginMode =
  | "USER"
  | "AGENT";

const FIXED_AGENT_EMAIL =
  "agent@example.com";

export function LoginPage() {
  const navigate =
    useNavigate();

  const {
    login,
    isAuthenticated,
  } = useAuth();

  const [
    mode,
    setMode,
  ] =
    useState<LoginMode>(
      "USER",
    );

  const [
    email,
    setEmail,
  ] =
    useState("");

  const [
    password,
    setPassword,
  ] =
    useState("");

  const [
    error,
    setError,
  ] =
    useState("");

  const [
    loading,
    setLoading,
  ] =
    useState(false);

  if (isAuthenticated) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  function switchMode(
    nextMode: LoginMode,
  ) {
    setMode(nextMode);
    setEmail("");
    setPassword("");
    setError("");
  }

  async function handleSubmit(
    event: FormEvent,
  ) {
    event.preventDefault();

    setError("");

    const normalizedEmail =
      email
        .trim()
        .toLowerCase();

    if (
      mode === "AGENT" &&
      normalizedEmail !==
        FIXED_AGENT_EMAIL
    ) {
      setError(
        "Invalid agent email address or password.",
      );

      return;
    }

    setLoading(true);

    try {
      const expectedRole:
        UserRole =
          mode === "AGENT"
            ? "AGENT"
            : "REPORTER";

      await login(
        normalizedEmail,
        password,
        expectedRole,
      );

      navigate("/", {
        replace: true,
      });
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to sign in.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-visual">
        <div className="auth-orb auth-orb-one" />
        <div className="auth-orb auth-orb-two" />

        <div className="auth-visual-content">
          <div className="auth-brand">
            <div className="auth-brand-icon">
              <LifeBuoy
                size={24}
              />
            </div>

            <span>
              Resolve
            </span>
          </div>

          <div className="auth-hero">
            <div className="auth-kicker">
              <Sparkles
                size={15}
              />

              Support Ticket
              & SLA Tracker
            </div>

            <h1>
              Support that
              stays
              <br />

              <span>
                ahead of the
                deadline.
              </span>
            </h1>

            <p>
              Raise support
              tickets, track
              ownership and keep
              every response and
              resolution deadline
              visible from one
              workspace.
            </p>
          </div>

          <div className="auth-feature-grid">
            <article>
              <div>
                <Clock3
                  size={18}
                />
              </div>

              <strong>
                Smart SLA
                tracking
              </strong>

              <span>
                Only business
                hours count.
                Weekends and
                configured
                holidays are
                automatically
                excluded.
              </span>
            </article>

            <article>
              <div>
                <ShieldCheck
                  size={18}
                />
              </div>

              <strong>
                Private support
                history
              </strong>

              <span>
                Users only see
                their own support
                tickets and
                conversations.
              </span>
            </article>

            <article>
              <div>
                <CheckCircle2
                  size={18}
                />
              </div>

              <strong>
                Clear resolution
              </strong>

              <span>
                Agents can own,
                respond to and
                resolve every
                support request.
              </span>
            </article>
          </div>
        </div>

        <div className="auth-preview-card">
          <div className="preview-row">
            <span className="preview-dot red" />

            <div>
              <strong>
                Payment issue
              </strong>

              <small>
                URGENT · Response
                SLA active
              </small>
            </div>

            <span className="preview-status">
              On track
            </span>
          </div>

          <div className="preview-progress">
            <span />
          </div>
        </div>
      </section>

      <section className="auth-form-side">
        <div className="auth-form-card">
          <div className="mobile-auth-brand">
            <LifeBuoy
              size={21}
            />

            Resolve
          </div>

          <div className="auth-form-heading">
            <span>
              Welcome back
            </span>

            <h2>
              Sign in to Resolve
            </h2>

            <p>
              Choose how you are
              accessing the support
              workspace.
            </p>
          </div>

          <div className="login-role-switch">
            <button
              type="button"
              className={
                mode === "USER"
                  ? "active"
                  : ""
              }
              onClick={() =>
                switchMode(
                  "USER",
                )
              }
            >
              <span>
                <UserRound
                  size={18}
                />
              </span>

              <div>
                <strong>
                  User
                </strong>

                <small>
                  Raise and track
                  your tickets
                </small>
              </div>
            </button>

            <button
              type="button"
              className={
                mode === "AGENT"
                  ? "active"
                  : ""
              }
              onClick={() =>
                switchMode(
                  "AGENT",
                )
              }
            >
              <span>
                <Headphones
                  size={18}
                />
              </span>

              <div>
                <strong>
                  Agent
                </strong>

                <small>
                  Manage the
                  support queue
                </small>
              </div>
            </button>
          </div>

          {error && (
            <ErrorBanner
              message={error}
              onClose={() =>
                setError("")
              }
            />
          )}

          <form
            className="auth-form"
            onSubmit={
              handleSubmit
            }
          >
            <label>
              {mode === "AGENT"
                ? "Agent email"
                : "Email address"}

              <div className="input-shell">
                <Mail
                  size={17}
                />

                <input
                  type="email"
                  value={email}
                  onChange={(
                    event,
                  ) =>
                    setEmail(
                      event.target
                        .value,
                    )
                  }
                  placeholder={
                    mode ===
                    "AGENT"
                      ? "Your assigned agent email"
                      : "you@example.com"
                  }
                  autoComplete="email"
                  required
                />
              </div>
            </label>

            <label>
              Password

              <div className="input-shell">
                <LockKeyhole
                  size={17}
                />

                <input
                  type="password"
                  value={password}
                  onChange={(
                    event,
                  ) =>
                    setPassword(
                      event.target
                        .value,
                    )
                  }
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />
              </div>
            </label>

            {mode ===
              "AGENT" && (
              <div className="agent-login-note">
                <ShieldCheck
                  size={16}
                />

                <span>
                  Agent access is
                  restricted to
                  authorized support
                  staff.
                </span>
              </div>
            )}

            <Button
              type="submit"
              size="lg"
              disabled={
                loading
              }
              icon={
                <ArrowRight
                  size={18}
                />
              }
            >
              {loading
                ? "Signing in..."
                : mode ===
                    "AGENT"
                  ? "Enter agent workspace"
                  : "Enter workspace"}
            </Button>
          </form>

          {mode ===
            "USER" && (
            <p className="auth-switch">
              Don't have an
              account?{" "}

              <Link to="/register">
                Create account
              </Link>
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
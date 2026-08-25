import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  LifeBuoy,
  LockKeyhole,
  Mail,
  ShieldCheck,
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

export function RegisterPage() {
  const navigate =
    useNavigate();

  const {
    register,
    isAuthenticated,
  } = useAuth();

  const [
    name,
    setName,
  ] =
    useState("");

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
    loading,
    setLoading,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState("");

  if (isAuthenticated) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  async function handleSubmit(
    event: FormEvent,
  ) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      await register(
        name,
        email,
        password,
      );

      navigate("/", {
        replace: true,
      });
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to create account.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="register-page">
      <section className="register-panel">
        <Link
          to="/login"
          className="back-link"
        >
          <ArrowLeft
            size={17}
          />

          Back to sign in
        </Link>

        <div className="register-card">
          <div className="register-brand">
            <div>
              <LifeBuoy
                size={22}
              />
            </div>

            Resolve
          </div>

          <div className="auth-form-heading">
            <span>
              New user account
            </span>

            <h2>
              Create your support
              workspace account.
            </h2>

            <p>
              Raise new support
              tickets, follow your
              existing requests and
              communicate directly
              with the support team.
            </p>
          </div>

          <div className="registration-trust-row">
            <span>
              <ShieldCheck
                size={15}
              />
              Private tickets
            </span>

            <span>
              <Clock3
                size={15}
              />
              SLA tracking
            </span>

            <span>
              <CheckCircle2
                size={15}
              />
              Resolution history
            </span>
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
              Full name

              <div className="input-shell">
                <UserRound
                  size={17}
                />

                <input
                  value={name}
                  onChange={(
                    event,
                  ) =>
                    setName(
                      event.target
                        .value,
                    )
                  }
                  placeholder="Your full name"
                  required
                />
              </div>
            </label>

            <label>
              Email address

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
                  placeholder="you@example.com"
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
                  placeholder="Minimum 8 characters"
                  minLength={8}
                  required
                />
              </div>
            </label>

            <div className="account-type-note">
              <UserRound
                size={17}
              />

              <div>
                <strong>
                  User account
                </strong>

                <span>
                  This account can
                  create and track
                  its own support
                  tickets.
                </span>
              </div>
            </div>

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
                ? "Creating account..."
                : "Create account"}
            </Button>
          </form>

          <p className="auth-switch">
            Already registered?{" "}

            <Link to="/login">
              Sign in
            </Link>
          </p>
        </div>
      </section>

      <section className="register-art">
        <div className="register-art-content">
          <span className="register-number">
            01
          </span>

          <h2>
            Your support history.
            Your tickets.
          </h2>

          <p>
            Every account has its
            own private support
            queue, with response
            and resolution SLA
            tracking built in.
          </p>

          <div className="register-sla-card">
            <div>
              <span>
                Ticket privacy
              </span>

              <strong>
                Account protected
              </strong>
            </div>

            <span className="sla-time">
              Secure
            </span>
          </div>
        </div>
      </section>
    </main>
  );
}
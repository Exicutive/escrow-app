import { useState } from "react";
import { validateRegisterPayload, type UserRole } from "../validation";
import { api } from "../helpers/helper";

interface RegisterPageProps {
  onRegisterSuccess: () => void;
  onNavigateToLogin: () => void;
}

const RegisterPage = ({
  onRegisterSuccess,
  onNavigateToLogin,
}: RegisterPageProps) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] =
    useState<Extract<UserRole, "buyer" | "seller">>("buyer");
  const [showPassword, setShowPassword] = useState(false); // <-- add
  const [errors, setErrors] = useState<{
    username?: string;
    email?: string;
    password?: string;
    role?: string;
    api?: string;
  }>({});
  const [submitting, setSubmitting] = useState(false);

  // Dynamic placeholders based on selected role
  const usernamePlaceholder = role === "seller" ? "store-name" : "user-name";
  const passwordPlaceholder =
    role === "seller"
      ? "Strong password for your seller account"
      : "Strong password to protect your purchases";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = validateRegisterPayload({ username, email, password, role });
    setErrors(result.errors);

    if (!result.isValid || !result.data) return;

    setSubmitting(true);

    try {
      await api.register({
        username: result.data.username,
        email: result.data.email,
        password: result.data.password,
        role: result.data.role,
      });
      onRegisterSuccess();
    } catch (err: unknown) {
      console.log("Register error:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Registration failed. Please try again.";
      setErrors({ api: errorMessage });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white border border-gray-100 rounded-2xl shadow-sm p-6 sm:p-8">
        <div className="mb-6 text-center">
          <p className="text-xs font-semibold tracking-wide text-purple-600 uppercase mb-1">
            Escrow Portal
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Create account
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Sign up as a buyer or seller.
          </p>
        </div>

        {errors.api && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm font-medium rounded-xl text-center">
            {errors.api}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={usernamePlaceholder}
              className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:border-transparent transition ${
                errors.username
                  ? "border-red-400 focus:ring-red-300"
                  : "border-gray-200 focus:ring-purple-500"
              }`}
            />
            {errors.username && (
              <p className="mt-1 text-xs text-red-500">{errors.username}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:border-transparent transition ${
                errors.email
                  ? "border-red-400 focus:ring-red-300"
                  : "border-gray-200 focus:ring-purple-500"
              }`}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-500">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={passwordPlaceholder}
                className={`w-full border rounded-xl px-4 py-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:border-transparent transition ${
                  errors.password
                    ? "border-red-400 focus:ring-red-300"
                    : "border-gray-200 focus:ring-purple-500"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-red-500">{errors.password}</p>
            )}
            <p className="mt-1 text-[11px] text-gray-400">
              Use at least 8 characters including upper, lower case letters and
              a number.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Role
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole("buyer")}
                className={`py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
                  role === "buyer"
                    ? "border-purple-600 bg-purple-50 text-purple-700"
                    : "border-gray-200 text-gray-700 bg-white"
                }`}
              >
                Buyer
              </button>
              <button
                type="button"
                onClick={() => setRole("seller")}
                className={`py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
                  role === "seller"
                    ? "border-purple-600 bg-purple-50 text-purple-700"
                    : "border-gray-200 text-gray-700 bg-white"
                }`}
              >
                Seller
              </button>
            </div>
            {errors.role && (
              <p className="mt-1 text-xs text-red-500">{errors.role}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-gray-900 hover:bg-black text-white font-semibold py-3 rounded-xl text-sm sm:text-base transition-colors active:scale-[0.98] disabled:opacity-70"
          >
            {submitting ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <button
            type="button"
            onClick={onNavigateToLogin}
            className="text-purple-600 hover:text-purple-700 font-semibold"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;

import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useAuth } from "../../context/AuthContext";
import { useLoginSupervisor } from "../../store/tanstackStore/services/queries";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useFormik } from "formik";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const loginMutation = useLoginSupervisor();

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
      remember: false,
    },
    onSubmit: (values) => {
      toast.dismiss(); // Clear any existing toasts

      loginMutation.mutate(
        {
          email: values.email,
          password: values.password,
          rememberMe: values.remember,
        },
        {
          onSuccess: (data) => {
            login({
              token: data.token,
              role: data.role,
            });
            toast.success("Login successful! Welcome back.");
            navigate("/dashboard", { replace: true });
          },
          onError: (error) => {
            console.error("Login error:", error);
            toast.error(error.message || "Login failed. Please try again.");
          },
        }
      );
    },
  });

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      {/* Logo */}
      <div className="mb-8 flex items-center">
        <img src="/Logo%20main.png" alt="UMI Logo" className="h-16 mb-2" />
      </div>

      <div className="flex gap-4 mb-4">
        <button
          className={`flex-1 h-10 px-3 py-2 rounded-md font-medium text-sm bg-[#E5F1FB] border border-[#ECF6FB]
               
            `}

        >
          Supervisor Portal
        </button>

      </div>
      {/* Login Card */}
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">Login</h2>
        <form onSubmit={formik.handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              required
              disabled={loginMutation.isPending}
              autoComplete="username"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                className={`w-full border ${loginMutation.error ? "border-red-400" : "border-gray-300"
                  } rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200`}
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                required
                disabled={loginMutation.isPending}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="absolute right-2 top-2 text-gray-500"
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
                disabled={loginMutation.isPending}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            {loginMutation.error && (
              <div className="text-red-600 text-sm mt-1">
                {loginMutation.error.message}
              </div>
            )}
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="remember"
                checked={formik.values.remember}
                onChange={formik.handleChange}
                className="form-checkbox rounded text-blue-600"
                disabled={loginMutation.isPending}
              />
              Remember me
            </label>
            <Link
              to="/forgot-password"
              className="text-sm text-yellow-700 hover:underline font-medium"
            >
              Forgot password?
            </Link>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-900 text-white py-2 rounded-md font-semibold hover:bg-blue-800 transition-colors mt-2 flex items-center justify-center gap-2"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Logging in...</span>
              </>
            ) : (
              "Login"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;

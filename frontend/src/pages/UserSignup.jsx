import { Link, useNavigate, Navigate } from "react-router-dom";
import { useState, useContext } from "react";
import axios from "axios";
import { UserDataContext } from "../Context/UserContext";
import { getApiBaseUrl } from "../config";

const UserSignup = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [, setUser] = useContext(UserDataContext);
  const navigate = useNavigate();

  if (localStorage.getItem("token")) {
    return <Navigate to="/home" replace />;
  }

  const validate = (fieldValues = { firstName, email, password }) => {
    let temp = { ...errors };

    if ("firstName" in fieldValues) {
      if (!fieldValues.firstName.trim()) {
        temp.firstName = "First name is required.";
      } else if (fieldValues.firstName.trim().length < 3) {
        temp.firstName = "First name must be at least 3 characters.";
      } else {
        temp.firstName = "";
      }
    }

    if ("email" in fieldValues) {
      if (!fieldValues.email.trim()) {
        temp.email = "Email address is required.";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fieldValues.email.trim())) {
        temp.email = "Please enter a valid email address.";
      } else {
        temp.email = "";
      }
    }

    if ("password" in fieldValues) {
      if (!fieldValues.password) {
        temp.password = "Password is required.";
      } else if (fieldValues.password.length < 6) {
        temp.password = "Password must be at least 6 characters.";
      } else {
        temp.password = "";
      }
    }

    setErrors({ ...temp });
    return Object.values(temp).every((x) => x === "");
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validate({ [field]: field === "firstName" ? firstName : field === "email" ? email : password });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    setTouched({ firstName: true, email: true, password: true });

    if (!validate()) return;

    setIsLoading(true);

    const newUser = {
      fullname: {
        firstname: firstName,
        lastname: lastName,
      },
      email: email,
      password: password,
    };

    try {
      const baseUrl = getApiBaseUrl();
      const response = await axios.post(`${baseUrl}/users/register`, newUser);

      if (response.status === 201) {
        const data = response.data;
        setUser(data.user);
        localStorage.setItem("token", data.token);
        navigate("/home");
      }
    } catch (error) {
      console.error("Signup error:", error);
      setServerError(
        error?.response?.data?.message ||
          error?.response?.data?.errors?.[0]?.msg ||
          "Unable to register. Please check your inputs.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] w-screen bg-gray-50 flex justify-center items-center p-4 sm:p-6">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-6 sm:p-8 flex flex-col justify-between border border-gray-100 min-h-[580px]">
        <div>
          <div className="flex items-center justify-between mb-6">
            <img className="w-20" src="/uber.png" alt="Uber" />
            <span className="text-xs font-semibold uppercase tracking-wider bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
              New Account
            </span>
          </div>

          {serverError && (
            <div className="mb-5 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2 animate-shake">
              <i className="ri-error-warning-fill text-lg text-red-500 shrink-0"></i>
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">
                What's your name?
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <input
                    type="text"
                    value={firstName}
                    className={`w-full bg-gray-100/80 border rounded-xl px-4 py-2.5 text-base text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none transition-all duration-200 ${
                      touched.firstName && errors.firstName
                        ? "border-red-500 bg-red-50/20 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                        : "border-gray-200 focus:border-black focus:ring-2 focus:ring-black/10"
                    }`}
                    placeholder="First name"
                    onChange={(e) => {
                      setFirstName(e.target.value);
                      if (touched.firstName) validate({ firstName: e.target.value });
                    }}
                    onBlur={() => handleBlur("firstName")}
                  />
                  {touched.firstName && errors.firstName && (
                    <p className="text-[11px] font-semibold text-red-500 mt-1">
                      {errors.firstName}
                    </p>
                  )}
                </div>
                <div>
                  <input
                    type="text"
                    value={lastName}
                    className="w-full bg-gray-100/80 border border-gray-200 rounded-xl px-4 py-2.5 text-base text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-black focus:ring-2 focus:ring-black/10 focus:outline-none transition-all duration-200"
                    placeholder="Last name"
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">
                What is your email?
              </label>
              <input
                type="email"
                value={email}
                className={`w-full bg-gray-100/80 border rounded-xl px-4 py-2.5 text-base text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none transition-all duration-200 ${
                  touched.email && errors.email
                    ? "border-red-500 bg-red-50/20 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                    : "border-gray-200 focus:border-black focus:ring-2 focus:ring-black/10"
                }`}
                placeholder="email@example.com"
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (touched.email) validate({ email: e.target.value });
                }}
                onBlur={() => handleBlur("email")}
              />
              {touched.email && errors.email && (
                <p className="text-xs font-semibold text-red-500 mt-1 flex items-center gap-1">
                  <i className="ri-error-warning-line"></i> {errors.email}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">
                Set Password
              </label>
              <input
                type="password"
                value={password}
                className={`w-full bg-gray-100/80 border rounded-xl px-4 py-2.5 text-base text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none transition-all duration-200 ${
                  touched.password && errors.password
                    ? "border-red-500 bg-red-50/20 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                    : "border-gray-200 focus:border-black focus:ring-2 focus:ring-black/10"
                }`}
                placeholder="Min 6 characters"
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (touched.password) validate({ password: e.target.value });
                }}
                onBlur={() => handleBlur("password")}
              />
              {touched.password && errors.password && (
                <p className="text-xs font-semibold text-red-500 mt-1 flex items-center gap-1">
                  <i className="ri-error-warning-line"></i> {errors.password}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-black hover:bg-gray-800 active:scale-[0.99] transition-all duration-200 text-white font-semibold text-base py-3.5 px-4 rounded-xl shadow-lg shadow-black/10 flex justify-center items-center cursor-pointer disabled:opacity-60 mt-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                "Create Account"
              )}
            </button>

            <p className="text-center text-sm text-gray-600 pt-1">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-black hover:underline"
              >
                Login here
              </Link>
            </p>
          </form>
        </div>

        <div className="pt-6 border-t border-gray-100">
          <p className="text-center text-xs text-gray-400 leading-relaxed">
            By registering, you agree to Uber's Terms of Service and Privacy
            Policy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserSignup;

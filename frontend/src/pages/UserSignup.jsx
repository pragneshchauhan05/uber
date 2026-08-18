import { Link, useNavigate } from "react-router-dom";
import { useState, useContext } from "react";
import axios from "axios";
import { UserDataContext } from "../Context/UserContext";

const UserSignup = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [, setUser] = useContext(UserDataContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      const baseUrl = import.meta.env.VITE_BASE_URL || "http://localhost:4000";
      const response = await axios.post(`${baseUrl}/users/register`, newUser);

      if (response.status === 201) {
        const data = response.data;
        setUser(data.user);
        localStorage.setItem("token", data.token);
        navigate("/home");
      }
    } catch (error) {
      console.error("Signup error:", error);
      alert(
        error?.response?.data?.message ||
          "Unable to register. Check your backend or network.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center p-0 md:p-6">
      <div className="w-full max-w-md min-h-screen md:min-h-[780px] md:h-auto bg-white md:rounded-3xl shadow-xl p-8 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-6">
            <img className="w-20" src="/uber.png" alt="Uber" />
            <span className="text-xs font-semibold uppercase tracking-wider bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
              New Account
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">
                What's your name?
              </label>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={firstName}
                  className="w-full bg-gray-100/80 border border-gray-200 rounded-xl px-4 py-2.5 text-base text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-black focus:ring-2 focus:ring-black/10 focus:outline-none transition-all duration-200"
                  required
                  minLength={3}
                  placeholder="First name"
                  onChange={(e) => setFirstName(e.target.value)}
                />
                <input
                  type="text"
                  value={lastName}
                  className="w-full bg-gray-100/80 border border-gray-200 rounded-xl px-4 py-2.5 text-base text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-black focus:ring-2 focus:ring-black/10 focus:outline-none transition-all duration-200"
                  required
                  placeholder="Last name"
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">
                What is your email?
              </label>
              <input
                type="email"
                value={email}
                className="w-full bg-gray-100/80 border border-gray-200 rounded-xl px-4 py-2.5 text-base text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-black focus:ring-2 focus:ring-black/10 focus:outline-none transition-all duration-200"
                required
                placeholder="email@example.com"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">
                Set Password
              </label>
              <input
                type="password"
                value={password}
                className="w-full bg-gray-100/80 border border-gray-200 rounded-xl px-4 py-2.5 text-base text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-black focus:ring-2 focus:ring-black/10 focus:outline-none transition-all duration-200"
                required
                minLength={6}
                placeholder="Min 6 characters"
                onChange={(e) => setPassword(e.target.value)}
              />
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

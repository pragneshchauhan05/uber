import { Link, useNavigate } from "react-router-dom";
import { useState, useContext } from "react";
import axios from "axios";
import { UserDataContext } from "../Context/UserContext";

const UserSignup = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");


  const [user, setUser] = useContext(UserDataContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Signup form submitted", {
      firstName,
      lastName,
      email,
      password,
    });

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
      console.log("Signup response", response.status, response.data);

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
    }
  };
  return (
    <div className="p-7 flex flex-col justify-between  h-screen">
      <div>
        <img className="w-20  mb-3" src="/uber.png" alt="Uber" />
        <form onSubmit={handleSubmit}>
          <h3 className="text-base font-medium mb-2">What's your name</h3>
          <div className="flex gap-4 mb-5">
            <input
              type="text"
              value={firstName}
              className="bg-[#eeeeee]  rounded px-4 py-2  w-1/2 text-base placeholder:text-sm"
              required
              minLength={3}
              placeholder="First name (min 3)"
              onChange={(e) => setFirstName(e.target.value)}
            />
            <input
              type="text"
              value={lastName}
              className="bg-[#eeeeee]  rounded px-4 py-2  w-1/2 text-base placeholder:text-sm"
              required
              placeholder="Last name"
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
          <h3 className="text-base font-medium mb-2">What is your email?</h3>
          <input
            type="email"
            value={email}
            className="bg-[#eeeeee] mb-5 rounded px-4 py-2  w-full text-base placeholder:text-sm"
            required
            placeholder="Enter your email"
            onChange={(e) => setEmail(e.target.value)}
          />
          <h3 className="text-base font-medium mb-2">Enter Password</h3>
          <input
            type="password"
            value={password}
            className="bg-[#eeeeee] mb-5 rounded px-4 py-2  w-full text-base placeholder:text-sm"
            required
            minLength={6}
            placeholder="Enter your password (min 6 characters)"
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="submit"
            onClick={() => console.log("Signup button clicked")}
            className="bg-[#111] text-white font-semibold mb-3 rounded px-4 py-2  w-full text-lg placeholder:text-base"
          >
            Create Account
          </button>
          <p className="text-center">
            Alredy have a account?
            <Link to="/login" className="text-blue-600">
              Login here
            </Link>
          </p>
        </form>
      </div>
      <div>
        <p className="text-center text-xs text-gray-500">
          This site is protected by reCAPTCHA and the{" "}
          <span className="text-blue-600 underline">Google Privacy Policy</span>
          and <span className="text-blue-600 underline">Terms of Service</span>
          apply.
        </p>
      </div>
    </div>
  );
};

export default UserSignup;

import React, { useState } from "react";

export default function LoginForm({ onLogin }) {
  const [email, setemail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error("Login failed");

      const data = await res.json();
      localStorage.setItem("token", data.token);
      onLogin();
    } catch (error) {
      alert("Invalid credentials");
    }
  };

  return (
    <>
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="max-w-md w-full bg-slate-400 p-8 rounded-lg shadow-lg">
          <footer className="fixed top-0 font-bold left-0 w-full bg-gray-800 text-white py-3 shadow-md z-50 text-lg ">
            <div className="text-center text-m">
              Log-In
            </div>
          </footer>
          <header className="text-center text-3xl font-bold text-white mb-6">
            FORM
          </header>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Email"
              className="block w-full mb-3 p-2 border border-gray-300 rounded"
              value={email}
              onChange={(e) => setemail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              className="block w-full mb-3 p-2 border border-gray-300 rounded"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              Login
            </button>
          </form>
        </div>
        <footer className="fixed bottom-0 left-0 w-full bg-gray-800 text-white py-3 shadow-md z-50">
          <div className="text-center text-m">
            &copy; {new Date().getFullYear()} Log-in | Built with ❤️
            using React
          </div>
        </footer>
      </div>
    </>
  );
}
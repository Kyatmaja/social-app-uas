"use client";

import { useState } from "react";

export default function Home() {
  const [register, setRegister] = useState(false);
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: ""
  });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const response = await fetch(
        register ? "/api/register" : "/api/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(form)
        }
      );

      const data = await response.json();
      setMessage(data.message);

      if (response.ok && register) {
        setRegister(false);
        setForm({
          name: "",
          username: "",
          email: "",
          password: ""
        });
      }

      if (response.ok && !register) {
        // Dashboard akan dibuat pada tahap berikutnya.
        setMessage(
          `Selamat datang, ${data.user.name}! Login berhasil.`
        );
      }
    } catch {
      setMessage("Tidak dapat terhubung ke server");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <h1 className="text-4xl font-bold text-center mb-2 text-purple-600">
          SocialConnect
        </h1>

        <p className="text-center text-gray-500 mb-6">
          Connect with your friends
        </p>

        <h2 className="text-xl font-semibold text-center mb-5 text-gray-800">
          {register ? "Create Account" : "Welcome Back"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {register && (
            <>
              <input
                name="name"
                placeholder="Full Name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full border p-3 rounded-lg text-gray-900"
              />
              <input
                name="username"
                placeholder="Username"
                value={form.username}
                onChange={handleChange}
                required
                className="w-full border p-3 rounded-lg text-gray-900"
              />
            </>
          )}

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full border p-3 rounded-lg text-gray-900"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            minLength={register ? 6 : undefined}
            required
            className="w-full border p-3 rounded-lg text-gray-900"
          />

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white p-3 rounded-lg font-semibold hover:opacity-90"
          >
            {register ? "Register" : "Login"}
          </button>
        </form>

        {message && (
          <p className="text-center mt-4 text-sm text-purple-600">
            {message}
          </p>
        )}

        <p className="text-center mt-6 text-sm text-gray-600">
          {register
            ? "Already have an account?"
            : "Don't have an account?"}

          <button
            type="button"
            onClick={() => {
              setRegister(!register);
              setMessage("");
            }}
            className="text-purple-600 font-bold ml-2"
          >
            {register ? "Login" : "Register"}
          </button>
        </p>
      </div>
    </main>
  );
}
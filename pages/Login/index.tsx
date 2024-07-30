import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "./index.module.scss";
import { useRouter } from "next/router";
import moduleName from '@/public/loginback.png'; // Ensure this path is correct

const Index = () => {
  const [id, setUserId] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    // Redirect to home if already logged in
    const token = localStorage.getItem("accessToken");
    if (token) {
      router.push("/home");
    }

    // Handle back navigation
    const handlePopState = () => {
      router.push("/home");
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [router]);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true); // Set loading to true when login starts
    try {
      const loginResponse = await axios.post(
        "https://www.referback.trollsufficient.com/admin/login",
        { id, password }
      );
      const { token, role } = loginResponse.data;
      localStorage.setItem("accessToken", token);
      localStorage.setItem("role", role);

      // const userResponse = await axios.post(
      //   "https://www.referback.trollsufficient.com/admin/user",
      //   { userId },
      //   {
      //     headers: {
      //       Authorization: `Bearer ${token}`,
      //       "Content-Type": "application/json",
      //     },
      //   }
      // );

      // const userName = userResponse.data.name;
      // const userIdFromResponse = userResponse.data.id;
      // localStorage.setItem("userName", userName);
      // localStorage.setItem("userId", userIdFromResponse); // Save userId for later use

      // const coinsResponse = await axios.get(
      //   `https://www.referback.trollsufficient.com/admin/coins/${userIdFromResponse}`,
      //   {
      //     headers: {
      //       Authorization: `Bearer ${token}`,
      //       "Content-Type": "application/json",
      //     },
      //   }
      // );

      // const userCoins = coinsResponse.data.coins;
      // localStorage.setItem("userCoins", userCoins);

      router.push("/home");
    } catch (error) {
      console.error("Login error:", error);
      setError("Invalid credentials");
    } finally {
      setLoading(false); // Reset loading to false when login completes or fails
    }
  };

  return (
    <div className={styles.loginContainer}>
      {loading && (
        <div className={styles.loadingOverlay}>
          <div className={styles.spinner}></div>
        </div>
      )}
      <button 
        className={styles.backButton} 
        onClick={() => router.back()} 
        aria-label="Go Back"
      >
        ←
      </button>
      <div className={styles.loginForm}>
        <h1 className={styles.header}>Login First to View User Details and Message Us</h1>
        <h2 className={styles.loginTitle}>LOGIN</h2>
        <form onSubmit={handleLogin}>
          <div className={styles.inputContainer}>
            <input
              type="text"
              value={id}
              onChange={(e) => setUserId(e.target.value)}
              required
              autoComplete="current-username"
            />
            <label>User Id</label>
            <div className={styles.inputUnderline}></div>
          </div>
          <div className={styles.inputContainer}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            <label>Password</label>
            <div className={styles.inputUnderline}></div>
          </div>
          {error && <p className={styles.error}>{error}</p>}
          <button
            type="submit"
            className={styles.loginButton}
            disabled={loading}
          >
            {loading ? "Loading..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Index;

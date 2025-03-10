import { Book, Info, Lock } from "lucide-react";
import React, { useState, useEffect } from "react";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Alert } from "./ui/alert";

type SplashProps = {
  handleReady: () => void;
};

export const Splash: React.FC<SplashProps> = ({ handleReady }) => {
  const [password, setPassword] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [error, setError] = useState("");
  const [showPasswordField, setShowPasswordField] = useState(false);

  // Check if already authorized in localStorage
  useEffect(() => {
    const storedAuth = localStorage.getItem("bearHugAuthorized");
    if (storedAuth === "true") {
      setIsAuthorized(true);
    }
  }, []);

  const verifyPassword = async () => {
    try {
      // In a real implementation, you would check against the environment variable
      // on the server side, not directly in the browser
      const response = await fetch("/api/verify-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();
      
      if (data.success) {
        setIsAuthorized(true);
        localStorage.setItem("bearHugAuthorized", "true");
        setError("");
      } else {
        setError("Incorrect password. Please try again.");
      }
    } catch (err) {
      setError("Error verifying password. Please try again.");
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    verifyPassword();
  };

  if (!isAuthorized) {
    return (
      <main className="w-full min-h-screen flex items-center justify-center bg-primary-200 p-4 bg-[length:auto_50%] lg:bg-auto bg-colorWash bg-no-repeat bg-right-top">
        <div className="flex flex-col gap-8 items-center max-w-full lg:max-w-xl p-8 bg-white rounded-lg shadow-md">
          <h1 className="scroll-m-20 text-3xl font-bold tracking-tight lg:text-4xl text-balance text-center">
            BearHug AI Voice Agent Demo
          </h1>

          {showPasswordField ? (
            <div className="w-full">
              {error && (
                <Alert intent="danger" title="Error" className="mb-4">
                  {error}
                </Alert>
              )}
              
              <form onSubmit={handlePasswordSubmit} className="space-y-4 w-full">
                <div className="flex items-center gap-2">
                  <Lock className="size-5 text-primary-500" />
                  <Input
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="flex-1"
                    autoFocus
                  />
                </div>
                <div className="flex justify-center w-full">
                  <Button type="submit" className="w-full">
                    Submit
                  </Button>
                </div>
              </form>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <p className="text-center text-primary-500">
                This demo is password protected.
              </p>
              <Button onClick={() => setShowPasswordField(true)}>
                Enter Password
              </Button>
            </div>
          )}
          
          <footer className="flex flex-col gap-2 w-full">
            <Button variant="light" asChild>
              <a
                href="https://www.linkedin.com/feed/update/urn:li:activity:7293309296774168579/"
                className="text-indigo-600"
              >
                <Info className="size-5" />
                Learn more about BearHug
              </a>
            </Button>
          </footer>
        </div>
      </main>
    );
  }

  return (
    <main className="w-full flex items-center justify-center bg-primary-200 p-4 bg-[length:auto_50%] lg:bg-auto bg-colorWash bg-no-repeat bg-right-top">
      <div className="flex flex-col gap-8 lg:gap-12 items-center max-w-full lg:max-w-3xl">
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl text-balance text-left">
          BearHug AI Voice Agent
        </h1>

        <p className="text-primary-500 text-lg font-semibold leading-relaxed">
          In this demo, you&apos;ll speak with an AI agent that introduces itself as
          a 211 representative seeking to update service information. The agent
          will politely ask about contact details for the best person at your
          organization. Play along as a CBO representative to experience a
          typical conversation, or feel free to experiment and test the system&apos;s
          capabilities.
        </p>

        <Button onClick={() => handleReady()}>Try Demo</Button>

        <div className="h-[1px] bg-primary-300 w-full" />

        <footer className="flex flex-col lg:gap-2">
          <Button variant="light" asChild>
            <a
              href="https://www.linkedin.com/feed/update/urn:li:activity:7293309296774168579/"
              className="text-indigo-600"
            >
              <Info className="size-6" />
              Learn more about BearHug
            </a>
          </Button>

          <Button variant="light" asChild>
            <a
              href="https://github.com/David-Botos/sriracha-voice-demo"
              className="text-indigo-600"
            >
              <Book className="size-6" />
              Demo source code
            </a>
          </Button>
        </footer>
      </div>
    </main>
  );
};

export default Splash;
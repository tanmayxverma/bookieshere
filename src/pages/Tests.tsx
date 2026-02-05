import { useState, useEffect, useRef } from "react";
import { Layout } from "@/components/Layout";
import { PYQTestConfig } from "@/components/Tests/PYQTestConfig";
import { PYQCBTSimulator } from "@/components/Tests/PYQCBTSimulator";
import { PYQTestResults } from "@/components/Tests/PYQTestResults";
import { usePYQTest } from "@/hooks/usePYQTest";

export type TestView = "config" | "exam" | "results";

// Persist test state globally to survive navigation
let persistedTestState: ReturnType<typeof usePYQTest> | null = null;
let persistedView: TestView = "config";

const Tests = () => {
  const [currentView, setCurrentView] = useState<TestView>(persistedView);
  const testState = usePYQTest();
  const isInitialMount = useRef(true);

  // Restore state on mount if we had an active test
  useEffect(() => {
    if (isInitialMount.current) {
      if (persistedView === "exam" && persistedTestState?.testStarted) {
        // Restore the persisted state
        setCurrentView("exam");
      }
      isInitialMount.current = false;
    }
  }, []);

  // Persist state when view changes
  useEffect(() => {
    persistedView = currentView;
    persistedTestState = testState;
  }, [currentView, testState]);

  // Scroll to top when entering exam mode
  useEffect(() => {
    if (currentView === "exam" || currentView === "results") {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [currentView]);

  const handleStartTest = () => {
    setCurrentView("exam");
  };

  const handleSubmitTest = () => {
    setCurrentView("results");
  };

  const handleNewTest = () => {
    testState.resetTest();
    persistedTestState = null;
    persistedView = "config";
    setCurrentView("config");
  };

  // Warn user before leaving during active test
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (currentView === "exam" && testState.questions.length > 0) {
        e.preventDefault();
        e.returnValue = "You have an active test. Are you sure you want to leave?";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [currentView, testState.questions.length]);

  // For exam mode, render without Layout to prevent navigation issues
  if (currentView === "exam") {
    return (
      <PYQCBTSimulator
        testState={testState}
        onSubmit={handleSubmitTest}
      />
    );
  }

  return (
    <Layout>
      {currentView === "config" && (
        <PYQTestConfig
          testState={testState}
          onStartTest={handleStartTest}
        />
      )}
      {currentView === "results" && (
        <PYQTestResults
          testState={testState}
          onNewTest={handleNewTest}
        />
      )}
    </Layout>
  );
};

export default Tests;

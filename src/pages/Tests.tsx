import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { TestConfiguration } from "@/components/Tests/TestConfiguration";
import { ExamSimulator } from "@/components/Tests/ExamSimulator";
import { TestResults } from "@/components/Tests/TestResults";
import { useTestBuilder } from "@/hooks/useTestBuilder";

export type TestView = "config" | "exam" | "results";

// Persist test state globally to survive navigation
let persistedState: {
  view: TestView;
  testBuilder: ReturnType<typeof useTestBuilder> | null;
} | null = null;

const Tests = () => {
  const location = useLocation();
  const [currentView, setCurrentView] = useState<TestView>(
    persistedState?.view || "config"
  );
  const testBuilder = useTestBuilder();
  const isInitialMount = useRef(true);

  // Restore state on mount if we had an active test
  useEffect(() => {
    if (isInitialMount.current && persistedState?.view === "exam") {
      // Don't reset if returning from navigation
      isInitialMount.current = false;
      return;
    }
    isInitialMount.current = false;
  }, []);

  // Persist state when view changes
  useEffect(() => {
    persistedState = {
      view: currentView,
      testBuilder: testBuilder,
    };
  }, [currentView, testBuilder]);

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
    testBuilder.resetTest();
    persistedState = null; // Clear persisted state
    setCurrentView("config");
  };

  // Warn user before leaving during active test
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (currentView === "exam" && testBuilder.questions.length > 0) {
        e.preventDefault();
        e.returnValue = "You have an active test. Are you sure you want to leave?";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [currentView, testBuilder.questions.length]);

  // For exam mode, render without Layout to prevent navigation issues
  if (currentView === "exam") {
    return (
      <ExamSimulator
        testBuilder={testBuilder}
        onSubmit={handleSubmitTest}
      />
    );
  }

  return (
    <Layout>
      {currentView === "config" && (
        <TestConfiguration
          testBuilder={testBuilder}
          onStartTest={handleStartTest}
        />
      )}
      {currentView === "results" && (
        <TestResults
          testBuilder={testBuilder}
          onNewTest={handleNewTest}
        />
      )}
    </Layout>
  );
};

export default Tests;

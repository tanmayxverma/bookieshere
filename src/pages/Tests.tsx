import { useState, useEffect, useRef } from "react";
import { Layout } from "@/components/Layout";
import { PracticeTestConfig } from "@/components/Tests/PracticeTestConfig";
import { CBTSimulator } from "@/components/Tests/CBTSimulator";
import { PracticeTestResults } from "@/components/Tests/PracticeTestResults";
import { usePracticeTest } from "@/hooks/usePracticeTest";

export type TestView = "config" | "exam" | "results";

let persistedTestState: ReturnType<typeof usePracticeTest> | null = null;
let persistedView: TestView = "config";

const Tests = () => {
  const [currentView, setCurrentView] = useState<TestView>(persistedView);
  const testState = usePracticeTest();
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      if (persistedView === "exam" && persistedTestState?.testStarted) {
        setCurrentView("exam");
      }
      isInitialMount.current = false;
    }
  }, []);

  useEffect(() => {
    persistedView = currentView;
    persistedTestState = testState;
  }, [currentView, testState]);

  useEffect(() => {
    if (currentView === "exam" || currentView === "results") {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [currentView]);

  const handleStartTest = () => setCurrentView("exam");
  const handleSubmitTest = () => setCurrentView("results");
  const handleNewTest = () => {
    testState.resetTest();
    persistedTestState = null;
    persistedView = "config";
    setCurrentView("config");
    window.scrollTo({ top: 0, behavior: "instant" });
  };

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

  if (currentView === "exam") {
    return <CBTSimulator testState={testState} onSubmit={handleSubmitTest} />;
  }

  return (
    <Layout>
      {currentView === "config" && (
        <PracticeTestConfig testState={testState} onStartTest={handleStartTest} />
      )}
      {currentView === "results" && (
        <PracticeTestResults testState={testState} onNewTest={handleNewTest} />
      )}
    </Layout>
  );
};

export default Tests;

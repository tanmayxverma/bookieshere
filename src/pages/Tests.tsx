 import { useState } from "react";
 import { Layout } from "@/components/Layout";
 import { TestConfiguration } from "@/components/Tests/TestConfiguration";
 import { ExamSimulator } from "@/components/Tests/ExamSimulator";
 import { TestResults } from "@/components/Tests/TestResults";
 import { useTestBuilder } from "@/hooks/useTestBuilder";
 
 export type TestView = "config" | "exam" | "results";
 
 const Tests = () => {
   const [currentView, setCurrentView] = useState<TestView>("config");
   const testBuilder = useTestBuilder();
 
   const handleStartTest = () => {
     setCurrentView("exam");
   };
 
   const handleSubmitTest = () => {
     setCurrentView("results");
   };
 
   const handleNewTest = () => {
     testBuilder.resetTest();
     setCurrentView("config");
   };
 
   return (
     <Layout>
       {currentView === "config" && (
         <TestConfiguration
           testBuilder={testBuilder}
           onStartTest={handleStartTest}
         />
       )}
       {currentView === "exam" && (
         <ExamSimulator
           testBuilder={testBuilder}
           onSubmit={handleSubmitTest}
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
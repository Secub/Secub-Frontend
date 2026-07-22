import AppRouter from "./app/AppRouter";
import { AccessibilityProvider } from "./accessibility";
import { FeedbackProvider } from "./shared/feedback";

function App() {
  return (
    <AccessibilityProvider>
      <FeedbackProvider>
        <AppRouter />
      </FeedbackProvider>
    </AccessibilityProvider>
  );
}

export default App;

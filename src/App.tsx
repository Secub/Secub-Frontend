import AppRouter from "./app/AppRouter";
import { AccessibilityProvider, MuiThemeBridge } from "./accessibility";
import { FeedbackProvider } from "./shared/feedback";

function App() {
  return (
    <AccessibilityProvider>
      <MuiThemeBridge>
        <FeedbackProvider>
          <AppRouter />
        </FeedbackProvider>
      </MuiThemeBridge>
    </AccessibilityProvider>
  );
}

export default App;

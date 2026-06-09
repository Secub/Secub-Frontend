import AppRouter from "./app/AppRouter";
import { AccessibilityProvider } from "./accessibility";

function App() {
  return (
    <AccessibilityProvider>
      <AppRouter />
    </AccessibilityProvider>
  );
}

export default App;

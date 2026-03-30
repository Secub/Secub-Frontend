import LandingPage from "./pages/landing/LandingPage";
import AccessPage from "./pages/access/AccessPage";

function App() {
  const normalizedPath = window.location.pathname.replace(/\/+$/, "") || "/";

  if (
    normalizedPath === "/acceder" ||
    normalizedPath === "/login" ||
    normalizedPath === "/auth"
  ) {
    return <AccessPage />;
  }

  return <LandingPage />;
}

export default App;
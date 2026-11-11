import { Toaster } from "@/components/ui/sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import LiveChatWidget from "@/components/LiveChatWidget";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { Preloader } from "./components/Preloader";
import { useState, useEffect } from "react";
import Home from "./pages/Home";
import PlaceholderPage from "./pages/PlaceholderPage";
import FAQ from "./pages/FAQ";
import Register from "./pages/Register";
import AdminPanel from "./pages/AdminPanel";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AdminLogin from "./pages/AdminLogin";
import Transfer from "./pages/Transfer";
import TransferMethod from "./pages/TransferMethod";

// Logged-in customers see the internal My Cards page; guests see the marketing page
function CardsGate() {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <MyCards /> : <Cards />;
}

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/register"} component={Register} />
      <Route path={"/login"} component={Login} />
      <Route path={"/forgot-password"} component={ForgotPassword} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/admin-login"} component={AdminLogin} />
      <Route path={"/admin-dashboard"} component={AdminDashboard} />
      <Route path={"/admin"} component={AdminPanel} />
      <Route path={"/transfer"} component={Transfer} />
      <Route path={"/transfer-method"} component={TransferMethod} />
      <Route path={"/404"} component={NotFound} />
      <Route path={"/withdraw"} component={TransferMethod} />
      <Route path={"/deposit"} component={Deposit} />
      <Route path={"/credit-card"} component={CardsGate} />
      <Route path={"/cards"} component={CardsGate} />
      <Route path={"/my-cards"} component={MyCards} />
      <Route path={"/support"} component={Support} />
      <Route path={"/settings"} component={Settings} />
      <Route path={"/pay-bills"} component={PayBills} />
      <Route path={"/statements"} component={Statements} />
      <Route path={"/my-loans"} component={MyLoans} />
      
      {/* Placeholder Routes for Navigation Links */}
      <Route path="/business" component={Business} />
      <Route path="/personal" component={Personal} />
      <Route path="/credit-cards" component={Cards} />
      <Route path="/loans" component={Loans} />
      <Route path="/about" component={About} />
      <Route path="/careers" component={Careers} />
      <Route path="/blog" component={Blog} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/terms" component={Terms} />
      <Route path="/security" component={Security} />
      <Route path="/faq"><FAQ /></Route>
      <Route path="/help"><PlaceholderPage title="Help Center" /></Route>
      
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

import Deposit from "./pages/Deposit";
import CreditCard from "./pages/CreditCard";
import Cards from "./pages/Cards";
import MyCards from "./pages/MyCards";
import Support from "./pages/Support";
import Settings from "./pages/Settings";
import PayBills from "./pages/PayBills";
import Statements from "./pages/Statements";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Security from "./pages/Security";
import About from "./pages/About";
import Careers from "./pages/Careers";
import Blog from "./pages/Blog";
import Business from "./pages/Business";
import Personal from "./pages/Personal";
import Loans from "./pages/Loans";
import MyLoans from "./pages/MyLoans";

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  const [isAppLoading, setIsAppLoading] = useState(true);

  useEffect(() => {
    // Simulate initial app loading time to show the preloader
    const timer = setTimeout(() => {
      setIsAppLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Preloader isLoading={isAppLoading} />
          <Toaster />
          <Router />
          <LiveChatWidget />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
import AdminDashboard from "./pages/AdminDashboard";
import ForgotPassword from "./pages/ForgotPassword";

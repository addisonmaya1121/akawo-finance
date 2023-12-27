import { Outlet } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import Sidebar from "./components/sidebar/Sidebar";
import Navbar from "./components/Navbar";
import { ThemeProvider } from "./components/ThemeProvider";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Sidebar />
      <div className="lg:ml-[250px] flex flex-col gap-8 lg:p-8 p-4 min-h-screen">
        <Navbar />
        <div className="flex flex-col flex-1">
          <Outlet />
        </div>
        <ScrollToTop />
      </div>
    </ThemeProvider>
  );
}

export default App;

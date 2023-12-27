import { Link } from "react-router-dom";
import WalletConnectButton from "./WalletConnectButton";
import { Button } from "./ui/button";
import SwitchNetworkButton from "./SwitchNetworkButton";
import { Card } from "./ui/card";
import { MenuIcon } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export default function Navbar() {
  const { setIsSidebarOpen } = useTheme();
  return (
    <Card>
      <div className="px-6 py-4">
        <div className="flex flex-wrap gap-3">
          <div className="block lg:hidden">
            <Button
              variant={"ghost"}
              size={"icon"}
              onClick={() => setIsSidebarOpen(true)}
            >
              <MenuIcon />
            </Button>
          </div>
          <div className="flex flex-wrap gap-3 ml-auto">
            <SwitchNetworkButton />
            <Button variant={"secondary"} asChild>
              <Link to="/token-locker/lock">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="w-5 h-5 lg:mr-2"
                >
                  <path
                    d="M12 0C9.62663 0 7.30655 0.703788 5.33316 2.02236C3.35977 3.34094 1.8217 5.21509 0.913451 7.4078C0.00519943 9.60051 -0.232441 12.0133 0.230582 14.3411C0.693605 16.6689 1.83649 18.8071 3.51472 20.4853C5.19295 22.1635 7.33115 23.3064 9.65892 23.7694C11.9867 24.2324 14.3995 23.9948 16.5922 23.0866C18.7849 22.1783 20.6591 20.6402 21.9776 18.6668C23.2962 16.6935 24 14.3734 24 12C23.9966 8.81846 22.7312 5.76821 20.4815 3.51852C18.2318 1.26883 15.1815 0.00344108 12 0ZM12 22C10.0222 22 8.08879 21.4135 6.4443 20.3147C4.79981 19.2159 3.51809 17.6541 2.76121 15.8268C2.00433 13.9996 1.8063 11.9889 2.19215 10.0491C2.578 8.10929 3.53041 6.32746 4.92894 4.92893C6.32746 3.53041 8.10929 2.578 10.0491 2.19215C11.9889 1.8063 13.9996 2.00433 15.8268 2.7612C17.6541 3.51808 19.2159 4.79981 20.3147 6.4443C21.4135 8.08879 22 10.0222 22 12C21.9971 14.6513 20.9426 17.1931 19.0679 19.0679C17.1931 20.9426 14.6513 21.9971 12 22ZM17 12C17 12.2652 16.8946 12.5196 16.7071 12.7071C16.5196 12.8946 16.2652 13 16 13H13V16C13 16.2652 12.8946 16.5196 12.7071 16.7071C12.5196 16.8946 12.2652 17 12 17C11.7348 17 11.4804 16.8946 11.2929 16.7071C11.1054 16.5196 11 16.2652 11 16V13H8.00001C7.73479 13 7.48043 12.8946 7.2929 12.7071C7.10536 12.5196 7.00001 12.2652 7.00001 12C7.00001 11.7348 7.10536 11.4804 7.2929 11.2929C7.48043 11.1054 7.73479 11 8.00001 11H11V8C11 7.73478 11.1054 7.48043 11.2929 7.29289C11.4804 7.10536 11.7348 7 12 7C12.2652 7 12.5196 7.10536 12.7071 7.29289C12.8946 7.48043 13 7.73478 13 8V11H16C16.2652 11 16.5196 11.1054 16.7071 11.2929C16.8946 11.4804 17 11.7348 17 12Z"
                    fill="currentColor"
                  >
                    <rect width="24" height="24" fill="white" />
                  </path>
                </svg>
                <span className="hidden lg:inline">Create</span>
              </Link>
            </Button>
            <WalletConnectButton />
          </div>
        </div>
      </div>
    </Card>
  );
}

import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { Bars3Icon, ChevronDoubleLeftIcon, ChevronDoubleRightIcon } from "@heroicons/react/24/solid";
import { IconButton, Button, Tooltip } from "@material-tailwind/react";
import {
  Sidenav,
  Topnav,
  DashboardNavbar,
  Configurator,
  Footer,
} from "@/widgets/layout";
import routes from "@/routes";
import { useMaterialTailwindController, setOpenConfigurator, setOpenSidenav, setMiniSidenav } from "@/context";

export function Dashboard() {
  const [controller, dispatch] = useMaterialTailwindController();
  const { sidenavType, sidenavColor, openSidenav, miniSidenav } = controller;
  const location = useLocation();

  // Auto-close drawer on route change (mobile)
  React.useEffect(() => {
    setOpenSidenav(dispatch, false);
  }, [location.pathname]);

  return (
    <div className="h-screen bg-surface-soft">
      <div className="grid h-full grid-cols-1 lg:grid-cols-[auto_minmax(0,1fr)]">
        {/* Sidebar column (desktop persistent, mobile off-canvas handled in component) */}
        <aside className={`hidden lg:block ${miniSidenav ? 'w-[4.5rem]' : 'w-72'} h-full bg-surface-soft`}></aside>

        {/* Main column */}
        <div className="relative flex min-w-0 flex-col">
          {/* Mobile header: left hamburger, centered app icon */}
          <div className="grid grid-cols-3 items-center px-3 py-2 lg:hidden">
            <div className="flex justify-start">
              <IconButton
                variant="text"
                color="blue-gray"
                className="rounded-full"
                onClick={() => setOpenSidenav(dispatch, true)}
                aria-label="Open menu"
                aria-expanded={openSidenav}
                aria-controls="app-sidenav"
              >
                <Bars3Icon className="h-6 w-6" />
              </IconButton>
            </div>
            <div className="flex justify-center">
              <img src="/img/app_icon.png" alt="App" className="h-7 w-7 rounded-full ring-2 ring-primary-200" />
            </div>
            <div className="flex justify-end">
              <span className="inline-block w-10" aria-hidden="true"></span>
            </div>
          </div>

          {/* Actual sidenav (positioned fixed by the component itself) */}
          <div className="fixed top-0 left-0 z-40">
            <Sidenav routes={routes} brandImg={"/img/logo-ct.png"} />
          </div>

          {/* Collapser moved inside Sidenav header for better aesthetics */}

          {/* Existing Topnav */}
          <Topnav sidenavColor={sidenavColor} sidenavType={sidenavType} />

          {/* Content area */}
          <div className="flex-1 min-w-0 px-4 lg:px-7 pt-4 overflow-y-auto bg-surface-soft">
            <Routes>
              {routes.map(
                ({ layout, pages }) =>
                  layout === "dashboard" &&
                  pages.map(({ path, element }) => (
                    <Route exact path={path} element={element} />
                  ))
              )}
            </Routes>
            <div className="text-blue-gray-600">
              <Footer />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

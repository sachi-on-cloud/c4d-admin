import { Routes, Route } from "react-router-dom";
import { Bars3Icon, Cog6ToothIcon } from "@heroicons/react/24/solid";
import { IconButton, Button } from "@material-tailwind/react";
import {
  Sidenav,
  Topnav,
  DashboardNavbar,
  Configurator,
  Footer,
} from "@/widgets/layout";
import routes from "@/routes";
import { useMaterialTailwindController, setOpenConfigurator, setOpenSidenav } from "@/context";

export function Dashboard() {
  const [controller, dispatch] = useMaterialTailwindController();
  const { sidenavType, sidenavColor } = controller;

  return (
    <div className="flex h-screen bg-gray-50 mr-2">
      <div className="w-72 h-full fixed top-0 left-0 z-40 bg-blue-gray-100">
        <Sidenav
          routes={routes}
          brandImg={"/img/logo-ct.png"}
        />
      </div>
      <div className="flex-1 flex flex-col lg:ml-72">
        <div className="flex items-center gap-3 px-4 pt-3 lg:hidden">
          <Button
            variant="text"
            color="blue-gray"
            className="flex items-center gap-2"
            onClick={() => setOpenSidenav(dispatch, true)}
          >
            <Bars3Icon className="h-6 w-6" />
            Menu
          </Button>
        </div>
        <Topnav 
          sidenavColor={sidenavColor}
          sidenavType={sidenavType}
        />
        <div className="flex-1 pl-4 lg:pl-7 pt-4 overflow-y-auto bg-blue-gray-100">
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
  );
}

export default Dashboard;

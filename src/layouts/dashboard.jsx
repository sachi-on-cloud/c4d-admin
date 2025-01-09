import { Routes, Route } from "react-router-dom";
import { Cog6ToothIcon } from "@heroicons/react/24/solid";
import { IconButton } from "@material-tailwind/react";
import {
  Sidenav,
  Topnav,
  DashboardNavbar,
  Configurator,
  Footer,
} from "@/widgets/layout";
import routes from "@/routes";
import { useMaterialTailwindController, setOpenConfigurator } from "@/context";

export function Dashboard() {
  const [controller, dispatch] = useMaterialTailwindController();
  const { sidenavType, sidenavColor } = controller;

  return (
    <div className="flex h-screen bg-gray-50 mr-2">
      <div className="w-72">
        <Sidenav
          routes={routes}
          brandImg={"/img/logo-ct.png"}
        />
      </div>
      <div className="flex-1 flex flex-col">
        <Topnav 
          sidenavColor={sidenavColor}
          sidenavType={sidenavType}
        />
        <div className="flex-1 pl-7 pt-4 overflow-y-auto">
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

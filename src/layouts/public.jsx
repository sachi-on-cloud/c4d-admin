import { Routes, Route } from "react-router-dom";
import routes from "@/routes";

export function Public() {
  return (
    <div className="relative min-h-screen w-full">
      <Routes>
        {routes.map(
          ({ layout, pages }) =>
            layout === "public" &&
            pages.map(({ path, element }) => (
              <Route exact path={path} element={element} />
            ))
        )}
      </Routes>
    </div>
  );
}

Public.displayName = "/src/layout/Public.jsx";

export default Public;

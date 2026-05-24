import {
  createBrowserRouter,
} from "react-router-dom";

import Dashboard from "../pages/Dashboard";
import Members from "../pages/Members";

const router =
  createBrowserRouter([
    {
      path: "/",
      element: <Dashboard />,
    },
    {
      path: "/members",
      element: <Members />,
    },
  ]);

export default router;
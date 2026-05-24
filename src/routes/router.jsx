import {
  createBrowserRouter,
} from "react-router-dom";

import Layout from "../components/Layout";

import Dashboard from "../pages/Dashboard";
import Members from "../pages/Members";

const router =
  createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
      children: [
        {
          index: true,
          element: <Dashboard />,
        },
        {
          path: "members",
          element: <Members />,
        },
      ],
    },
  ]);

export default router;
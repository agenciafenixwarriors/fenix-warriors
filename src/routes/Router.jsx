import {
  createBrowserRouter
} from "react-router-dom";

import Login from "../pages/Login";

import Register from "../pages/Register";

import Dashboard from "../pages/Dashboard";

import Hosts from "../pages/Hosts";

import HostDetails from "../pages/HostDetails";

import Contracts from "../pages/Contracts";

import Recovery from "../pages/Recovery";

import ExecutiveDashboard from "../pages/ExecutiveDashboard";

import EventCenter from "../pages/EventCenter";

import ProtectedRoute from "./ProtectedRoute";

export const router = createBrowserRouter([

  // LOGIN
  {
    path: "/login",
    element: <Login />
  },

  // REGISTER
  {
    path: "/register",
    element: <Register />
  },

  // RECOVERY
  {
    path: "/recovery",
    element: <Recovery />
  },

  // DASHBOARD
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    )
  },

  // HOSTS
  {
    path: "/hosts",
    element: (
      <ProtectedRoute>
        <Hosts />
      </ProtectedRoute>
    )
  },

  // HOST DETAILS
  {
    path: "/hosts/:id",
    element: (
      <ProtectedRoute>
        <HostDetails />
      </ProtectedRoute>
    )
  },

  // CONTRACTS
  {
    path: "/contracts",
    element: (
      <ProtectedRoute>
        <Contracts />
      </ProtectedRoute>
    )
  },

  // EVENT CENTER
  {
    path: "/events",
    element: (
      <ProtectedRoute>
        <EventCenter />
      </ProtectedRoute>
    )
  },

  // EXECUTIVE DASHBOARD
  {
    path: "/executive",
    element: (
      <ProtectedRoute requiredRole="admin">
        <ExecutiveDashboard />
      </ProtectedRoute>
    )
  }

]);
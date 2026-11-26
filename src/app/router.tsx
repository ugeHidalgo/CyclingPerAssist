import { createBrowserRouter } from "react-router-dom";
import { ActivityScreen } from "./ActivityScreen.tsx";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <ActivityScreen />,
  },
]);

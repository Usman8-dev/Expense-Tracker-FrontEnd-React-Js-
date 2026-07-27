import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

function Layout() {
  return (
    <div>
      <Navbar />
      <Outlet /> {/* the matched child route renders here */}
    </div>
  );
}

export default Layout;
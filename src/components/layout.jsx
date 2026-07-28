import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

function Layout() {
//   return (
//     <div>
//       <Navbar />
//       <Outlet /> {/* the matched child route renders here */}
//     </div>
//   );

return (
    <div className="flex">
      <Navbar />
      <main className="ml-0 md:ml-64 w-full pt-16 md:pt-0 transition-all duration-300 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-850 min-h-screen">
        <div className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default Layout;

import { Outlet } from "react-router-dom";
import { useAppAuth } from "@/providers/AuthProvider";
import LoadingScreen from "./LoadingScreen";
import Sidebar from "./Sidebar";

const AppLayout = () => {
  const { user, isLoading, loadingText, handleLogout } = useAppAuth();

  if (isLoading) {
    return <LoadingScreen loadingText={loadingText} />;
  }

  return (
    <div className="flex h-screen">
      <Sidebar user={user} onLogout={handleLogout} />
      <div className="flex-1 overflow-auto bg-gray-50">
        <Outlet />
      </div>
    </div>
  );
};

export default AppLayout;

import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import { useAuth } from "@/layouts/Root";
import React from "react";
import ApperIcon from "@/components/ApperIcon";
import DropZone from "@/components/molecules/DropZone";
import Button from "@/components/atoms/Button";
function Header() {
  const { user, isAuthenticated } = useSelector(state => state.user);
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200/50 shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo & Brand */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center space-x-3"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
              <ApperIcon name="CloudUpload" className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">DropZone</h1>
              <p className="text-xs text-gray-500 -mt-0.5">File Uploader</p>
            </div>
          </motion.div>

          {/* Navigation Actions */}
          <div className="flex items-center space-x-4">
            {isAuthenticated && user && (
              <div className="flex items-center space-x-3">
                <div className="hidden sm:block text-sm text-gray-600">
                  Welcome, {user.firstName || user.emailAddress}
                </div>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <ApperIcon name="LogOut" className="w-4 h-4" />
                  <span>Logout</span>
                </Button>
              </div>
            )}

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="hidden sm:flex items-center bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2 rounded-full border border-blue-100"
            >
              <ApperIcon name="Upload" className="w-4 h-4 text-blue-600 mr-2" />
              <span className="text-sm font-medium text-blue-700">Ready to Upload</span>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
            >
              <ApperIcon name="Settings" className="w-5 h-5 text-gray-600" />
            </motion.div>
          </div>
        </div>
      </div>
    </motion.header>
  );
}

export default Header;
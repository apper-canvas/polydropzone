import { motion, AnimatePresence } from "framer-motion";
import FileCard from "@/components/molecules/FileCard";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import { formatFileSize } from "@/utils/fileUtils";

const UploadQueue = ({ 
  files = [],
  onRemoveFile,
  onRetryFile,
  className = ""
}) => {
  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  const completedCount = files.filter(file => file.status === "completed").length;
  const uploadingCount = files.filter(file => file.status === "uploading").length;
  const errorCount = files.filter(file => file.status === "error").length;

  if (files.length === 0) {
    return (
      <div className={className}>
        <Empty 
          title="No files in queue"
          message="Select files to upload and they'll appear here with progress indicators."
          icon="FileStack"
        />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className={className}
    >
      {/* Queue Header */}
      <div className="mb-6 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <ApperIcon name="FileStack" className="w-5 h-5 mr-2 text-blue-600" />
            Upload Queue
          </h3>
          <div className="text-sm text-gray-600">
            {files.length} file{files.length !== 1 ? "s" : ""} • {formatFileSize(totalSize)}
          </div>
        </div>

        {/* Status Summary */}
        <div className="flex items-center space-x-6 text-sm">
          {completedCount > 0 && (
            <div className="flex items-center text-green-600">
              <ApperIcon name="CheckCircle" className="w-4 h-4 mr-1" />
              {completedCount} completed
            </div>
          )}
          {uploadingCount > 0 && (
            <div className="flex items-center text-blue-600">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <ApperIcon name="Upload" className="w-4 h-4 mr-1" />
              </motion.div>
              {uploadingCount} uploading
            </div>
          )}
          {errorCount > 0 && (
            <div className="flex items-center text-red-600">
              <ApperIcon name="XCircle" className="w-4 h-4 mr-1" />
              {errorCount} failed
            </div>
          )}
        </div>
      </div>

      {/* File List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        <AnimatePresence>
          {files.map((file, index) => (
            <motion.div
              key={file.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ 
                duration: 0.3,
                delay: index * 0.05
              }}
            >
              <FileCard
                file={file}
                onRemove={onRemoveFile}
                onRetry={onRetryFile}
                showProgress={true}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Queue Actions */}
      {files.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.3 }}
          className="mt-6 flex items-center justify-center text-xs text-gray-500"
        >
          <ApperIcon name="Info" className="w-4 h-4 mr-1" />
          Files will be uploaded when you click the Upload button
        </motion.div>
      )}
    </motion.div>
  );
};

export default UploadQueue;
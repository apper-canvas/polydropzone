import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import DropZone from "@/components/molecules/DropZone";
import UploadQueue from "@/components/molecules/UploadQueue";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import { uploadFileService } from "@/services/api/uploadService";
import { cn } from "@/utils/cn";

const FileUploader = ({ className = "" }) => {
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleFilesAdded = useCallback((newFiles) => {
    setFiles(prev => [...prev, ...newFiles]);
    toast.success(`Added ${newFiles.length} file${newFiles.length !== 1 ? "s" : ""} to queue`, {
      position: "top-right",
      autoClose: 2000
    });
  }, []);

  const handleRemoveFile = useCallback((fileId) => {
    setFiles(prev => prev.filter(file => file.id !== fileId));
  }, []);

  const handleRetryFile = useCallback(async (fileId) => {
    const fileToRetry = files.find(f => f.id === fileId);
    if (!fileToRetry) return;

    // Reset file status
    setFiles(prev => prev.map(file => 
      file.id === fileId 
        ? { ...file, status: "uploading", progress: 0, error: null }
        : file
    ));

    try {
      await uploadSingleFile(fileToRetry);
    } catch (error) {
      console.error("Retry upload failed:", error);
    }
  }, [files]);

  const uploadSingleFile = useCallback(async (file) => {
    return new Promise((resolve, reject) => {
      // Simulate upload progress
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress >= 100) {
          progress = 100;
          clearInterval(progressInterval);
          
          // Update file status to completed
          setFiles(prev => prev.map(f => 
            f.id === file.id 
              ? { 
                  ...f, 
                  status: "completed", 
                  progress: 100,
                  uploadedAt: new Date().toISOString()
                }
              : f
          ));
          
          resolve();
        } else {
          // Update progress
          setFiles(prev => prev.map(f => 
            f.id === file.id 
              ? { ...f, progress: Math.round(progress) }
              : f
          ));
        }
      }, 200);

      // Simulate potential errors (10% chance)
      setTimeout(() => {
        if (Math.random() < 0.1 && progress < 100) {
          clearInterval(progressInterval);
          setFiles(prev => prev.map(f => 
            f.id === file.id 
              ? { 
                  ...f, 
                  status: "error", 
                  error: "Upload failed. Please try again."
                }
              : f
          ));
          reject(new Error("Upload failed"));
        }
      }, Math.random() * 2000 + 1000);
    });
  }, []);

  const handleUploadAll = useCallback(async () => {
    const pendingFiles = files.filter(f => f.status === "pending" || f.status === "error");
    
    if (pendingFiles.length === 0) {
      toast.warning("No files to upload");
      return;
    }

    setIsUploading(true);

    // Update all pending files to uploading status
    setFiles(prev => prev.map(file => 
      (file.status === "pending" || file.status === "error")
        ? { ...file, status: "uploading", progress: 0, error: null }
        : file
    ));

    try {
      // Upload files in parallel
      const uploadPromises = pendingFiles.map(file => uploadSingleFile(file));
      await Promise.allSettled(uploadPromises);

      const completedCount = files.filter(f => f.status === "completed").length;
      const totalFiles = files.length;

      if (completedCount === totalFiles) {
        toast.success(`All ${totalFiles} files uploaded successfully!`, {
          position: "top-right",
          autoClose: 3000
        });
      } else {
        const failedCount = totalFiles - completedCount;
        toast.warning(`${completedCount} files uploaded, ${failedCount} failed`, {
          position: "top-right",
          autoClose: 4000
        });
      }
    } catch (error) {
      toast.error("Upload process encountered errors", {
        position: "top-right",
        autoClose: 3000
      });
    } finally {
      setIsUploading(false);
    }
  }, [files, uploadSingleFile]);

  const handleClearCompleted = useCallback(() => {
    const completedFiles = files.filter(f => f.status === "completed");
    if (completedFiles.length === 0) {
      toast.info("No completed files to clear");
      return;
    }

    setFiles(prev => prev.filter(file => file.status !== "completed"));
    toast.success(`Cleared ${completedFiles.length} completed file${completedFiles.length !== 1 ? "s" : ""}`, {
      position: "top-right",
      autoClose: 2000
    });
  }, [files]);

  const handleClearAll = useCallback(() => {
    if (files.length === 0) {
      toast.info("No files to clear");
      return;
    }

    setFiles([]);
    toast.success("Cleared all files from queue", {
      position: "top-right",
      autoClose: 2000
    });
  }, [files]);

  const pendingFiles = files.filter(f => f.status === "pending" || f.status === "error");
  const completedFiles = files.filter(f => f.status === "completed");
  const uploadingFiles = files.filter(f => f.status === "uploading");

  return (
    <div className={cn("space-y-8", className)}>
      {/* Drop Zone */}
      <DropZone
        onFilesAdded={handleFilesAdded}
        multiple={true}
        maxSize={100 * 1024 * 1024} // 100MB
        disabled={isUploading}
      />

      {/* Upload Queue */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <UploadQueue
              files={files}
              onRemoveFile={handleRemoveFile}
              onRetryFile={handleRetryFile}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Buttons */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-4 p-6 bg-white rounded-lg border border-gray-200 shadow-sm"
          >
            {pendingFiles.length > 0 && (
              <Button
                onClick={handleUploadAll}
                disabled={isUploading}
                size="lg"
                className="flex-1 sm:flex-none"
              >
                {isUploading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <ApperIcon name="Upload" className="w-5 h-5 mr-2" />
                    </motion.div>
                    Uploading... ({uploadingFiles.length}/{pendingFiles.length + uploadingFiles.length})
                  </>
                ) : (
                  <>
                    <ApperIcon name="Upload" className="w-5 h-5 mr-2" />
                    Upload {pendingFiles.length} File{pendingFiles.length !== 1 ? "s" : ""}
                  </>
                )}
              </Button>
            )}

            <div className="flex items-center space-x-2">
              {completedFiles.length > 0 && (
                <Button
                  onClick={handleClearCompleted}
                  variant="secondary"
                  size="md"
                  disabled={isUploading}
                >
                  <ApperIcon name="CheckCircle" className="w-4 h-4 mr-2" />
                  Clear Completed
                </Button>
              )}

              <Button
                onClick={handleClearAll}
                variant="ghost"
                size="md"
                disabled={isUploading}
                className="text-gray-600 hover:text-red-600 hover:bg-red-50"
              >
                <ApperIcon name="Trash2" className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FileUploader;
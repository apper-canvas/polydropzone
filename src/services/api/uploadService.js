import { getApperClient } from "@/services/apperClient";
import { toast } from "react-toastify";

const tableName = "uploadSessions_c";

export const uploadFileService = {
  // Simulate file upload with progress tracking
  async uploadFile(file, onProgress) {
    return new Promise((resolve, reject) => {
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += Math.random() * 15;
        
        if (progress >= 100) {
          progress = 100;
          clearInterval(progressInterval);
          
          const uploadResult = {
            id: Date.now().toString(),
            name: file.name,
            size: file.size,
            type: file.type,
            status: "completed",
            progress: 100,
            uploadedAt: new Date().toISOString(),
            url: `https://example.com/files/${file.name}`,
            error: null
          };
          
          resolve(uploadResult);
        } else {
          if (onProgress) {
            onProgress(Math.round(progress));
          }
        }
      }, 200);

      // Simulate potential upload failures (5% chance)
      setTimeout(() => {
        if (Math.random() < 0.05 && progress < 100) {
          clearInterval(progressInterval);
          reject(new Error("Upload failed due to network error"));
        }
      }, Math.random() * 3000 + 1000);
    });
  },

  // Get all upload sessions
  async getAllSessions() {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}}, 
          {"field": {"Name": "files_c"}},
          {"field": {"Name": "totalSize_c"}},
          {"field": {"Name": "completedCount_c"}},
          {"field": {"Name": "startedAt_c"}},
          {"field": {"Name": "completedAt_c"}}
        ],
        orderBy: [{"fieldName": "Id", "sorttype": "DESC"}]
      };

      const response = await apperClient.fetchRecords(tableName, params);

      if (!response.success) {
        console.error("Failed to fetch upload sessions:", response.message);
        toast.error(response.message);
        return [];
      }

      // Transform data to match expected format
      return response.data.map(session => ({
        Id: session.Id,
        Name: session.Name || `Session ${session.Id}`,
        files: session.files_c ? JSON.parse(session.files_c) : [],
        totalSize: session.totalSize_c || 0,
        completedCount: session.completedCount_c || 0,
        startedAt: session.startedAt_c,
        completedAt: session.completedAt_c
      }));
    } catch (error) {
      console.error("Error fetching upload sessions:", error?.response?.data?.message || error);
      return [];
    }
  },

  // Get session by ID
  async getSessionById(sessionId) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "files_c"}},
          {"field": {"Name": "totalSize_c"}},
          {"field": {"Name": "completedCount_c"}},
          {"field": {"Name": "startedAt_c"}},
          {"field": {"Name": "completedAt_c"}}
        ]
      };

      const response = await apperClient.getRecordById(tableName, parseInt(sessionId), params);

      if (!response?.data) {
        throw new Error(`Upload session with ID ${sessionId} not found`);
      }

      // Transform data to match expected format
      const session = response.data;
      return {
        Id: session.Id,
        Name: session.Name || `Session ${session.Id}`,
        files: session.files_c ? JSON.parse(session.files_c) : [],
        totalSize: session.totalSize_c || 0,
        completedCount: session.completedCount_c || 0,
        startedAt: session.startedAt_c,
        completedAt: session.completedAt_c
      };
    } catch (error) {
      console.error(`Error fetching session ${sessionId}:`, error?.response?.data?.message || error);
      throw error;
    }
  },

  // Create new upload session
  async createSession(sessionData) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const params = {
        records: [{
          Name: sessionData.Name || `Session ${Date.now()}`,
          files_c: JSON.stringify(sessionData.files || []),
          totalSize_c: sessionData.totalSize || 0,
          completedCount_c: 0,
          startedAt_c: new Date().toISOString(),
          completedAt_c: null
        }]
      };

      const response = await apperClient.createRecord(tableName, params);

      if (!response.success) {
        console.error("Failed to create upload session:", response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results && response.results.length > 0) {
        const successful = response.results.filter(r => r.success);
        if (successful.length > 0) {
          const created = successful[0].data;
          return {
            Id: created.Id,
            Name: created.Name,
            files: created.files_c ? JSON.parse(created.files_c) : [],
            totalSize: created.totalSize_c || 0,
            completedCount: created.completedCount_c || 0,
            startedAt: created.startedAt_c,
            completedAt: created.completedAt_c
          };
        }
      }
      return null;
    } catch (error) {
      console.error("Error creating upload session:", error?.response?.data?.message || error);
      throw error;
    }
  },

  // Update upload session
  async updateSession(sessionId, updateData) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const updateRecord = {
        Id: parseInt(sessionId)
      };

      // Only include updateable fields that have values
      if (updateData.Name !== undefined) updateRecord.Name = updateData.Name;
      if (updateData.files !== undefined) updateRecord.files_c = JSON.stringify(updateData.files);
      if (updateData.totalSize !== undefined) updateRecord.totalSize_c = updateData.totalSize;
      if (updateData.completedCount !== undefined) updateRecord.completedCount_c = updateData.completedCount;
      if (updateData.completedAt !== undefined) updateRecord.completedAt_c = updateData.completedAt;

      const params = {
        records: [updateRecord]
      };

      const response = await apperClient.updateRecord(tableName, params);

      if (!response.success) {
        console.error("Failed to update upload session:", response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results && response.results.length > 0) {
        const successful = response.results.filter(r => r.success);
        if (successful.length > 0) {
          const updated = successful[0].data;
          return {
            Id: updated.Id,
            Name: updated.Name,
            files: updated.files_c ? JSON.parse(updated.files_c) : [],
            totalSize: updated.totalSize_c || 0,
            completedCount: updated.completedCount_c || 0,
            startedAt: updated.startedAt_c,
            completedAt: updated.completedAt_c
          };
        }
      }
      return null;
    } catch (error) {
      console.error("Error updating upload session:", error?.response?.data?.message || error);
      throw error;
    }
  },

  // Delete upload session
  async deleteSession(sessionId) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const params = {
        RecordIds: [parseInt(sessionId)]
      };

      const response = await apperClient.deleteRecord(tableName, params);

      if (!response.success) {
        console.error("Failed to delete upload session:", response.message);
        toast.error(response.message);
        return false;
      }

      if (response.results && response.results.length > 0) {
        const successful = response.results.filter(r => r.success);
        return successful.length > 0;
      }
      return false;
    } catch (error) {
      console.error("Error deleting upload session:", error?.response?.data?.message || error);
      throw error;
    }
  },

  // Validate file before upload
  async validateFile(file, maxSize = 100 * 1024 * 1024) {
    const errors = [];
    
    if (file.size > maxSize) {
      errors.push(`File size must be less than ${Math.round(maxSize / (1024 * 1024))}MB`);
    }
    
    if (file.name.length > 255) {
      errors.push("File name is too long (max 255 characters)");
    }
    
    // Check for dangerous file extensions
    const dangerousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.pif', '.com'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    if (dangerousExtensions.includes(fileExtension)) {
      errors.push("File type not allowed for security reasons");
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
};
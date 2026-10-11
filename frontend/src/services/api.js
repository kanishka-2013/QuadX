import axios from 'axios';

const API_BASE = '/api';

export const api = {
  // Upload file
  uploadFile: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await axios.post(`${API_BASE}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },

  // Load messy sample dataset
  loadSampleDataset: async () => {
    const res = await axios.post(`${API_BASE}/dataset/sample`);
    return res.data;
  },

  // Get data analysis
  getAnalysis: async (datasetId) => {
    const res = await axios.get(`${API_BASE}/dataset/${datasetId}/analysis`);
    return res.data;
  },

  // Apply cleaning options
  cleanDataset: async (datasetId, options) => {
    const res = await axios.post(`${API_BASE}/dataset/${datasetId}/clean`, options);
    return res.data;
  },

  // Apply restructuring options
  restructureDataset: async (datasetId, options) => {
    const res = await axios.post(`${API_BASE}/dataset/${datasetId}/restructure`, options);
    return res.data;
  },

  // Get paginated table preview (view = 'current' or 'original')
  getPreview: async (datasetId, view = 'current', page = 1, pageSize = 20, search = '') => {
    const res = await axios.get(`${API_BASE}/dataset/${datasetId}/preview`, {
      params: { view, page, page_size: pageSize, search }
    });
    return res.data;
  },

  // Get AI insights
  getAIInsights: async (datasetId) => {
    const res = await axios.get(`${API_BASE}/dataset/${datasetId}/insights`);
    return res.data;
  },

  // Reset dataset to original
  resetDataset: async (datasetId) => {
    const res = await axios.post(`${API_BASE}/dataset/${datasetId}/reset`);
    return res.data;
  },

  // Export URLs
  getDownloadCsvUrl: (datasetId, columns = []) => {
    let url = `${API_BASE}/dataset/${datasetId}/download/csv`;
    if (columns && columns.length > 0) {
      const colQuery = columns.map(c => `columns=${encodeURIComponent(c)}`).join('&');
      url += `?${colQuery}`;
    }
    return url;
  },

  getDownloadExcelUrl: (datasetId, columns = []) => {
    let url = `${API_BASE}/dataset/${datasetId}/download/excel`;
    if (columns && columns.length > 0) {
      const colQuery = columns.map(c => `columns=${encodeURIComponent(c)}`).join('&');
      url += `?${colQuery}`;
    }
    return url;
  },

  getDownloadReportUrl: (datasetId) => {
    return `${API_BASE}/dataset/${datasetId}/report`;
  }
};

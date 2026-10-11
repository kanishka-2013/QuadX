import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const DatasetContext = createContext();

export const DatasetProvider = ({ children }) => {
  const [datasetId, setDatasetId] = useState(null);
  const [dataset, setDataset] = useState(null);
  const [cleanedInfo, setCleanedInfo] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [aiInsights, setAiInsights] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Default cleaning settings
  const [cleaningOptions, setCleaningOptions] = useState({
    remove_duplicates: true,
    normalize_column_names: true,
    trim_whitespace: true,
    standardize_capitalization: 'title',
    normalize_emails: true,
    normalize_dates: true,
    convert_numeric_text: true,
    missing_value_actions: []
  });

  const clearMessages = () => {
    setError(null);
    setSuccessMessage(null);
  };

  const loadDatasetAnalysis = async (id) => {
    setIsLoading(true);
    clearMessages();
    try {
      const data = await api.getAnalysis(id);
      setDataset(data);
      setDatasetId(id);
      // Also load initial preview and insights
      await refreshPreview(id, 'current', 1, 20);
      try {
        const insights = await api.getAIInsights(id);
        setAiInsights(insights);
      } catch (e) {
        console.warn("Insights load failed:", e);
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to load dataset analysis.");
    } finally {
      setIsLoading(false);
    }
  };

  const uploadFile = async (file) => {
    setIsLoading(true);
    clearMessages();
    try {
      const data = await api.uploadFile(file);
      setDataset(data);
      setDatasetId(data.dataset_id);
      setCleanedInfo(null);
      setSuccessMessage(`Successfully uploaded '${file.name}' (${data.total_rows} rows x ${data.total_columns} cols)`);
      setActiveTab('dashboard');
      await refreshPreview(data.dataset_id, 'current', 1, 20);
      const insights = await api.getAIInsights(data.dataset_id);
      setAiInsights(insights);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to upload dataset file.");
    } finally {
      setIsLoading(false);
    }
  };

  const loadSampleDataset = async () => {
    setIsLoading(true);
    clearMessages();
    try {
      const data = await api.loadSampleDataset();
      setDataset(data);
      setDatasetId(data.dataset_id);
      setCleanedInfo(null);
      setSuccessMessage(`Sample messy dataset loaded successfully (${data.total_rows} rows x ${data.total_columns} cols)`);
      setActiveTab('dashboard');
      await refreshPreview(data.dataset_id, 'current', 1, 20);
      const insights = await api.getAIInsights(data.dataset_id);
      setAiInsights(insights);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to load sample dataset.");
    } finally {
      setIsLoading(false);
    }
  };

  const applyCleaning = async (customOptions = null) => {
    if (!datasetId) return;
    setIsLoading(true);
    clearMessages();
    try {
      const opts = customOptions || cleaningOptions;
      const cleanRes = await api.cleanDataset(datasetId, opts);
      setCleanedInfo(cleanRes);
      setSuccessMessage(`Data cleaning completed! Score increased from ${cleanRes.quality_score_before.total_score} to ${cleanRes.quality_score_after.total_score}/100.`);
      
      // Reload analysis & preview
      const updatedAnalysis = await api.getAnalysis(datasetId);
      setDataset(updatedAnalysis);
      await refreshPreview(datasetId, 'current', 1, 20);
      const insights = await api.getAIInsights(datasetId);
      setAiInsights(insights);
    } catch (err) {
      setError(err.response?.data?.detail || "Data cleaning failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const applyRestructure = async (restructureOpts) => {
    if (!datasetId) return;
    setIsLoading(true);
    clearMessages();
    try {
      const res = await api.restructureDataset(datasetId, restructureOpts);
      setCleanedInfo(res);
      setSuccessMessage("Dataset restructured successfully!");
      
      const updatedAnalysis = await api.getAnalysis(datasetId);
      setDataset(updatedAnalysis);
      await refreshPreview(datasetId, 'current', 1, 20);
    } catch (err) {
      setError(err.response?.data?.detail || "Restructuring failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetDataset = async () => {
    if (!datasetId) return;
    setIsLoading(true);
    clearMessages();
    try {
      await api.resetDataset(datasetId);
      setCleanedInfo(null);
      setSuccessMessage("Dataset restored to original raw state.");
      
      const origAnalysis = await api.getAnalysis(datasetId);
      setDataset(origAnalysis);
      await refreshPreview(datasetId, 'current', 1, 20);
      const insights = await api.getAIInsights(datasetId);
      setAiInsights(insights);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to reset dataset.");
    } finally {
      setIsLoading(false);
    }
  };

  const refreshPreview = async (id = datasetId, view = 'current', page = 1, pageSize = 20, search = '') => {
    if (!id) return;
    try {
      const res = await api.getPreview(id, view, page, pageSize, search);
      setPreviewData(res);
    } catch (err) {
      console.warn("Failed to fetch preview data", err);
    }
  };

  return (
    <DatasetContext.Provider value={{
      datasetId,
      dataset,
      cleanedInfo,
      previewData,
      aiInsights,
      activeTab,
      setActiveTab,
      isLoading,
      error,
      setError,
      successMessage,
      setSuccessMessage,
      cleaningOptions,
      setCleaningOptions,
      uploadFile,
      loadSampleDataset,
      applyCleaning,
      applyRestructure,
      resetDataset,
      refreshPreview
    }}>
      {children}
    </DatasetContext.Provider>
  );
};

export const useDataset = () => useContext(DatasetContext);

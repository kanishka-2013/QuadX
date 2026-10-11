import React, { useState } from 'react';
import { useDataset } from '../context/DatasetContext';
import { Wand2, Copy, AlertCircle, Sparkles, Check, RefreshCw, Layers } from 'lucide-react';

export const CleaningPanel = () => {
  const { dataset, cleaningOptions, setCleaningOptions, applyCleaning, isLoading } = useDataset();

  if (!dataset) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
        <p className="text-slate-500 text-sm">Please upload a dataset or load the sample dataset first.</p>
      </div>
    );
  }

  const [missingActionsMap, setMissingActionsMap] = useState({});

  const handleMissingStrategyChange = (column, strategy, custom_value = '') => {
    setMissingActionsMap(prev => ({
      ...prev,
      [column]: { column, strategy, custom_value }
    }));
  };

  const handleApply = () => {
    const missingActionsList = Object.values(missingActionsMap);
    const updatedOptions = {
      ...cleaningOptions,
      missing_value_actions: missingActionsList
    };
    applyCleaning(updatedOptions);
  };

  const hasDuplicates = dataset.duplicate_rows_count > 0;
  const missingCols = Object.entries(dataset.missing_values_by_column).filter(([_, count]) => count > 0);

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
            <Wand2 className="w-5 h-5 text-blue-600" />
            <span>Data Cleaning Engine</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure automated transformation rules and custom column-level imputation parameters.
          </p>
        </div>

        <button
          onClick={handleApply}
          disabled={isLoading}
          className="flex items-center space-x-2 px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl shadow-md shadow-blue-500/20 transition disabled:opacity-50 cursor-pointer"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Applying Rules...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Execute Data Cleaning</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Duplicate Removal */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Copy className="w-4 h-4 text-blue-600" />
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Exact Duplicate Rows</h4>
            </div>
            {hasDuplicates ? (
              <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-700 rounded-full">
                {dataset.duplicate_rows_count} detected
              </span>
            ) : (
              <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-700 rounded-full">
                0 duplicates
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500">
            Automatically detect and purge exact duplicate rows across all fields.
          </p>
          <label className="flex items-center space-x-2 text-xs font-medium text-slate-700 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={cleaningOptions.remove_duplicates}
              onChange={(e) => setCleaningOptions({ ...cleaningOptions, remove_duplicates: e.target.checked })}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
            />
            <span>Purge exact duplicate records ({dataset.duplicate_rows_count} rows)</span>
          </label>
        </div>

        {/* 2. Column Header Normalization */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-purple-600" />
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Column Header Standardization</h4>
          </div>
          <p className="text-xs text-slate-500">
            Convert headers to clean <code className="bg-slate-200 px-1 rounded text-purple-800">snake_case</code>, trim spaces, and eliminate invalid symbols.
          </p>
          <label className="flex items-center space-x-2 text-xs font-medium text-slate-700 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={cleaningOptions.normalize_column_names}
              onChange={(e) => setCleaningOptions({ ...cleaningOptions, normalize_column_names: e.target.checked })}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
            />
            <span>Normalize header names to snake_case</span>
          </label>
        </div>

        {/* 3. Text Normalization */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Text & Whitespace Trimming</h4>
          <p className="text-xs text-slate-500">
            Remove leading/trailing whitespace and normalize text capitalization styles.
          </p>
          <div className="space-y-2 pt-1">
            <label className="flex items-center space-x-2 text-xs font-medium text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={cleaningOptions.trim_whitespace}
                onChange={(e) => setCleaningOptions({ ...cleaningOptions, trim_whitespace: e.target.checked })}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
              />
              <span>Trim leading/trailing whitespace in cells</span>
            </label>

            <label className="flex items-center space-x-2 text-xs font-medium text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={cleaningOptions.normalize_emails}
                onChange={(e) => setCleaningOptions({ ...cleaningOptions, normalize_emails: e.target.checked })}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
              />
              <span>Normalize email addresses (lowercase & fix double @)</span>
            </label>

            <div className="pt-1">
              <span className="text-xs font-semibold text-slate-700 block mb-1">Standardize Capitalization:</span>
              <select
                value={cleaningOptions.standardize_capitalization || 'none'}
                onChange={(e) => setCleaningOptions({ ...cleaningOptions, standardize_capitalization: e.target.value === 'none' ? null : e.target.value })}
                className="w-full bg-white border border-slate-300 text-slate-800 text-xs rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="none">Keep Original Casing</option>
                <option value="title">Title Case (e.g. John Doe)</option>
                <option value="lower">lowercase (e.g. john doe)</option>
                <option value="upper">UPPERCASE (e.g. JOHN DOE)</option>
              </select>
            </div>
          </div>
        </div>

        {/* 4. Date & Numeric Normalization */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Date & Numeric Parsing</h4>
          <p className="text-xs text-slate-500">
            Convert currency strings ($1,250) into clean numbers and parse dates into ISO (YYYY-MM-DD).
          </p>
          <div className="space-y-2 pt-1">
            <label className="flex items-center space-x-2 text-xs font-medium text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={cleaningOptions.convert_numeric_text}
                onChange={(e) => setCleaningOptions({ ...cleaningOptions, convert_numeric_text: e.target.checked })}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
              />
              <span>Convert currency & comma strings to numbers</span>
            </label>

            <label className="flex items-center space-x-2 text-xs font-medium text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={cleaningOptions.normalize_dates}
                onChange={(e) => setCleaningOptions({ ...cleaningOptions, normalize_dates: e.target.checked })}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
              />
              <span>Normalize dates to YYYY-MM-DD standard</span>
            </label>
          </div>
        </div>
      </div>

      {/* 5. Column-Level Missing Value Imputation Section */}
      <div className="pt-4 border-t border-slate-100">
        <h4 className="text-sm font-bold text-slate-900 mb-2 flex items-center justify-between">
          <span>Column-Level Missing Value Imputation Rules</span>
          <span className="text-xs text-slate-500 font-normal">
            {missingCols.length} column(s) with missing values
          </span>
        </h4>

        {missingCols.length === 0 ? (
          <div className="p-4 rounded-xl bg-emerald-50 text-emerald-700 text-xs border border-emerald-200">
            Great news! No missing values detected in any column.
          </div>
        ) : (
          <div className="space-y-3">
            {missingCols.map(([colName, count]) => {
              const currentAction = missingActionsMap[colName] || { strategy: 'keep', custom_value: '' };
              const isNumericCol = ['amount', 'price', 'sales', 'cost', 'total', 'salary', 'phone', 'age', 'id'].some(kw => colName.toLowerCase().includes(kw));

              return (
                <div key={colName} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="font-bold text-slate-800 font-mono bg-white px-2 py-0.5 rounded border border-slate-200">{colName}</span>
                    <span className="text-amber-600 ml-2 font-semibold">({count} missing rows - {dataset.missing_percentages[colName]}%)</span>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <select
                      value={currentAction.strategy}
                      onChange={(e) => handleMissingStrategyChange(colName, e.target.value, currentAction.custom_value)}
                      className="bg-white border border-slate-300 text-slate-800 text-xs rounded-lg p-2 focus:ring-2 focus:ring-blue-500 font-medium"
                    >
                      <option value="keep">Keep Missing (Unchanged)</option>
                      <option value="remove_rows">Drop Affected Rows</option>
                      {isNumericCol && <option value="fill_mean">Fill with Mean (Average)</option>}
                      {isNumericCol && <option value="fill_median">Fill with Median</option>}
                      <option value="fill_mode">Fill with Most Frequent (Mode)</option>
                      <option value="fill_custom">Fill with Custom Value</option>
                    </select>

                    {currentAction.strategy === 'fill_custom' && (
                      <input
                        type="text"
                        placeholder="Enter value"
                        value={currentAction.custom_value || ''}
                        onChange={(e) => handleMissingStrategyChange(colName, 'fill_custom', e.target.value)}
                        className="bg-white border border-slate-300 text-slate-800 text-xs rounded-lg p-2 w-32 focus:ring-2 focus:ring-blue-500"
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

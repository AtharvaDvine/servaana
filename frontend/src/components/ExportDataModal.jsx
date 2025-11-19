import React, { useState } from 'react';
import { X, Download, Calendar, FileText, Database, Menu } from 'lucide-react';
import useStore from '../stores/useStore';
import { exportData } from '../utils/api';

const ExportDataModal = ({ isOpen, onClose }) => {
  const { restaurant } = useStore();
  const [exportType, setExportType] = useState('sales');
  const [format, setFormat] = useState('pdf');
  const [dateRange, setDateRange] = useState('today');
  const [customDates, setCustomDates] = useState({ start: '', end: '' });
  const [fileName, setFileName] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const dateRanges = {
    today: { label: 'Today', days: 0 },
    yesterday: { label: 'Yesterday', days: 1 },
    week: { label: 'This Week', days: 7 },
    month: { label: 'This Month', days: 30 },
    custom: { label: 'Custom Range', days: null }
  };

  const getDateRange = () => {
    const today = new Date();
    if (dateRange === 'custom') {
      return { start: customDates.start, end: customDates.end };
    }
    
    const range = dateRanges[dateRange];
    const start = new Date(today);
    
    if (dateRange === 'yesterday') {
      start.setDate(today.getDate() - 1);
      return {
        start: start.toISOString().split('T')[0],
        end: start.toISOString().split('T')[0]
      };
    } else if (dateRange === 'week') {
      start.setDate(today.getDate() - 6);
    } else if (dateRange === 'month') {
      start.setDate(today.getDate() - 29);
    }
    
    return {
      start: start.toISOString().split('T')[0],
      end: today.toISOString().split('T')[0]
    };
  };

  const generateFileName = () => {
    const { start, end } = getDateRange();
    const type = exportType === 'sales' ? 'sales-report' : 'menu-data';
    return `${type}-${start}${end !== start ? `-to-${end}` : ''}.${format}`;
  };

  React.useEffect(() => {
    const { start, end } = getDateRange();
    const type = exportType === 'sales' ? 'sales-report' : 'menu-data';
    const newFileName = `${type}-${start}${end !== start ? `-to-${end}` : ''}.${format}`;
    setFileName(newFileName);
  }, [exportType, format, dateRange, customDates]);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const { start, end } = getDateRange();
      
      if (exportType === 'sales') {
        await exportData.salesReport(restaurant._id, { startDate: start, endDate: end, format });
      } else {
        await exportData.menuData(restaurant._id, format);
      }
      onClose();
    } catch (error) {
      console.error('Export failed:', error);
      
      // Play error sound
      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.2);
      } catch (audioError) {
        console.log('Could not play error sound');
      }
      
      alert('Export failed: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsExporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Export Data</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Export Type */}
          <div>
            <label className="block text-sm font-medium mb-2">Export Type</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setExportType('sales')}
                className={`p-3 rounded-lg border-2 flex items-center gap-2 ${
                  exportType === 'sales' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
              >
                <FileText size={20} />
                <span>Sales Report</span>
              </button>
              <button
                onClick={() => setExportType('menu')}
                className={`p-3 rounded-lg border-2 flex items-center gap-2 ${
                  exportType === 'menu' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
              >
                <Menu size={20} />
                <span>Menu Data</span>
              </button>
            </div>
          </div>

          {/* Format */}
          <div>
            <label className="block text-sm font-medium mb-2">Format</label>
            <div className="flex gap-2">
              {['pdf', 'csv', 'json'].map(fmt => (
                <button
                  key={fmt}
                  onClick={() => setFormat(fmt)}
                  className={`px-4 py-2 rounded-lg border ${
                    format === fmt ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                >
                  {fmt.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Date Range (only for sales) */}
          {exportType === 'sales' && (
            <div>
              <label className="block text-sm font-medium mb-2">Date Range</label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                {Object.entries(dateRanges).map(([key, { label }]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
              
              {dateRange === 'custom' && (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <input
                    type="date"
                    value={customDates.start}
                    onChange={(e) => setCustomDates(prev => ({ ...prev, start: e.target.value }))}
                    className="p-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="date"
                    value={customDates.end}
                    onChange={(e) => setCustomDates(prev => ({ ...prev, end: e.target.value }))}
                    className="p-2 border border-gray-300 rounded-lg"
                  />
                </div>
              )}
            </div>
          )}

          {/* File Name */}
          <div>
            <label className="block text-sm font-medium mb-2">File Name</label>
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
          </div>

          {/* Export Button */}
          <button
            onClick={handleExport}
            disabled={isExporting || (dateRange === 'custom' && (!customDates.start || !customDates.end))}
            className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Download size={20} />
            {isExporting ? 'Exporting...' : 'Export Data'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportDataModal;
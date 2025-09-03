import React, { useState, useEffect, useMemo } from 'react';
import { BugData } from './types';
import MetricCard from './components/MetricCard';
import { PieChartComponent, BarChartComponent, LineChartComponent } from './components/Charts';
import Filters from './components/Filters';
import AgingTable from './components/AgingTable';
import {
  parseCSVData,
  calculateMetrics,
  getStatusDistribution,
  getPriorityDistribution,
  getOwnerTeamDistribution,
  getBugClassificationDistribution,
  getSubSystemDistribution,
  getCumulativeOpenBugTrend,
  filterData
} from './utils/dataProcessor';
import { Bug, AlertCircle, TrendingUp, TrendingDown, Clock, BarChart3, Upload, FileText } from 'lucide-react';

function App() {
  const [data, setData] = useState<BugData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<{
    status?: string;
    priority?: string;
    project?: string;
    ownerTeam?: string;
    assignee?: string;
    subSystem?: string;
  }>({});
  const [agingSubSystemFilter, setAgingSubSystemFilter] = useState<string>('All');
  const [activeTab, setActiveTab] = useState<'all' | 'customer'>('all');

  useEffect(() => {
    loadCSVData();
  }, []);

  const loadCSVData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/isuses_sep_2 - Sheet1.csv');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const csvContent = await response.text();
      const parsedData = await parseCSVData(csvContent);
      setData(parsedData);
    } catch (err) {
      console.error('Error loading CSV:', err);
      setError(err instanceof Error ? err.message : 'Failed to load CSV data');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      setError(null);
      
      const csvContent = await file.text();
      const parsedData = await parseCSVData(csvContent);
      setData(parsedData);
    } catch (err) {
      console.error('Error parsing uploaded file:', err);
      setError(err instanceof Error ? err.message : 'Failed to parse uploaded file');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === 'All' ? undefined : value
    }));
  };

  const baseFilteredData = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) return [];
    
    try {
      return filterData(data, filters);
    } catch (error) {
      console.error('Error filtering base data:', error);
      return [];
    }
  }, [data, filters]);

  const tabFilteredData = useMemo(() => {
    if (!Array.isArray(baseFilteredData)) return [];
    
    try {
      if (activeTab === 'customer') {
        // Filter for customer bugs (bugs with Customer Name filled)
        return baseFilteredData.filter(bug => 
          bug && 
          bug['Customer Name'] && 
          typeof bug['Customer Name'] === 'string' && 
          bug['Customer Name'].trim() !== ''
        );
      }
      return baseFilteredData;
    } catch (error) {
      console.error('Error filtering tab data:', error);
      return baseFilteredData;
    }
  }, [baseFilteredData, activeTab]);

  const metrics = useMemo(() => {
    return calculateMetrics(tabFilteredData);
  }, [tabFilteredData]);

  const chartData = useMemo(() => {
    if (!Array.isArray(tabFilteredData)) {
      return {
        statusDistribution: [],
        priorityDistribution: [],
        ownerTeamDistribution: [],
        bugClassificationDistribution: [],
        subSystemDistribution: [],
        cumulativeTrend: []
      };
    }

    try {
      return {
        statusDistribution: getStatusDistribution(tabFilteredData),
        priorityDistribution: getPriorityDistribution(tabFilteredData),
        ownerTeamDistribution: getOwnerTeamDistribution(tabFilteredData),
        bugClassificationDistribution: getBugClassificationDistribution(tabFilteredData),
        subSystemDistribution: getSubSystemDistribution(tabFilteredData),
        cumulativeTrend: getCumulativeOpenBugTrend(tabFilteredData)
      };
    } catch (error) {
      console.error('Error generating chart data:', error);
      return {
        statusDistribution: [],
        priorityDistribution: [],
        ownerTeamDistribution: [],
        bugClassificationDistribution: [],
        subSystemDistribution: [],
        cumulativeTrend: []
      };
    }
  }, [tabFilteredData]);

  // Memoized calculations for tab button counts to avoid recalculation
  const tabCounts = useMemo(() => {
    if (!Array.isArray(data)) return { allOpenBugs: 0, customerOpenBugs: 0 };
    
    try {
      const allOpenBugs = data.filter(bug => 
        bug && !['Closed', 'Duplicated', 'Rejected', 'Verified', 'Released'].includes(bug.Status || '')
      ).length;
      
      const customerOpenBugs = data.filter(bug => 
        bug && 
        bug['Customer Name'] && 
        typeof bug['Customer Name'] === 'string' &&
        bug['Customer Name'].trim() !== '' && 
        !['Closed', 'Duplicated', 'Rejected', 'Verified', 'Released'].includes(bug.Status || '')
      ).length;

      return { allOpenBugs, customerOpenBugs };
    } catch (error) {
      console.error('Error calculating tab counts:', error);
      return { allOpenBugs: 0, customerOpenBugs: 0 };
    }
  }, [data]);

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading">
          <Clock className="animate-spin mr-2" size={24} />
          Loading bug analytics data...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <div className="error">
          <AlertCircle className="mr-2" size={20} />
          <strong>Error:</strong> {error}
          <div className="file-upload">
            <h3>Upload CSV File</h3>
            <p>Please upload your bug tracking CSV file to continue:</p>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
            />
          </div>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="dashboard">
        <div className="file-upload">
          <Upload size={48} className="mb-4" />
          <h2>Bug Analytics Dashboard</h2>
          <p>Upload your bug tracking CSV file to get started with analytics:</p>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
          />
          <p className="text-sm text-gray-600 mt-2">
            Expected CSV format: Include columns like Status, Priority, Sub-System/Module, etc.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <header className="header">
        <div className="flex items-center justify-between">
          <div>
            <h1>
              WiCheck Bug Analytics Dashboard
            </h1>
          </div>
        </div>
      </header>

      <div className="tab-navigation" style={{
        background: 'white',
        borderRadius: '12px',
        padding: '8px',
        marginBottom: '30px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        gap: '8px'
      }}>
        <button
          onClick={() => setActiveTab('all')}
          style={{
            padding: '12px 24px',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            backgroundColor: activeTab === 'all' ? '#3b82f6' : 'transparent',
            color: activeTab === 'all' ? 'white' : '#6b7280'
          }}
        >
          📊 All Bugs ({tabCounts.allOpenBugs.toLocaleString()})
        </button>
        <button
          onClick={() => setActiveTab('customer')}
          style={{
            padding: '12px 24px',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            backgroundColor: activeTab === 'customer' ? '#3b82f6' : 'transparent',
            color: activeTab === 'customer' ? 'white' : '#6b7280'
          }}
        >
          👥 Customer Bugs ({tabCounts.customerOpenBugs.toLocaleString()})
        </button>
      </div>

      <div className="metrics-grid">
        <MetricCard
          title="Open Bugs"
          value={metrics.openBugs}
          type="open"
          icon={<AlertCircle size={20} />}
        />
        <MetricCard
          title="Incoming (Since Aug 1)"
          value={metrics.incomingBugs}
          type="total"
          icon={<TrendingUp size={20} />}
        />
        <MetricCard
          title="Outgoing (Since Aug 1)"
          value={metrics.outgoingBugs}
          type="closed"
          icon={<TrendingDown size={20} />}
        />
        <MetricCard
          title="High Priority Open"
          value={metrics.highPriorityBugs}
          type="high-priority"
          icon={<Clock size={20} />}
        />
      </div>

      <Filters 
        data={tabFilteredData} 
        filters={filters} 
        onFilterChange={handleFilterChange}
      />

      <div className="charts-grid">
        <BarChartComponent
          data={chartData.subSystemDistribution}
          title={`🎯 ${activeTab === 'customer' ? 'Customer' : 'Open'} Bugs by Sub-System/Module`}
          color="#3b82f6"
        />
        
        <PieChartComponent
          data={chartData.statusDistribution}
          title={`📊 ${activeTab === 'customer' ? 'Customer' : 'Open'} Bug Status Distribution`}
        />

        <BarChartComponent
          data={chartData.ownerTeamDistribution}
          title={`👥 ${activeTab === 'customer' ? 'Customer' : 'Open'} Bugs by Owner Team`}
          color="#22c55e"
        />

        <PieChartComponent
          data={chartData.priorityDistribution}
          title={`⚡ ${activeTab === 'customer' ? 'Customer' : 'Open'} Bug Priority Distribution`}
        />

        <BarChartComponent
          data={chartData.bugClassificationDistribution}
          title={`🔍 ${activeTab === 'customer' ? 'Customer' : 'Open'} Bug Classification`}
          color="#f59e0b"
        />

        <LineChartComponent
          data={chartData.cumulativeTrend}
          title={`📈 Cumulative ${activeTab === 'customer' ? 'Customer' : 'Open'} Bug Trend`}
          color="#8b5cf6"
        />
      </div>

      <div className="filters" style={{ marginTop: '30px' }}>
        <h3>Aging Analysis Filter</h3>
        <div className="filter-row">
          <div className="filter-group">
            <label>Sub-System/Module for Aging Analysis</label>
            <select 
              value={agingSubSystemFilter} 
              onChange={(e) => setAgingSubSystemFilter(e.target.value)}
            >
              <option value="All">All Sub-Systems</option>
              {Array.from(new Set(tabFilteredData.map(bug => bug['Sub-System/Module']).filter(Boolean))).sort().map(subSystem => (
                <option key={subSystem} value={subSystem}>{subSystem}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '30px' }}>
        <AgingTable 
          data={agingSubSystemFilter === 'All' ? tabFilteredData : tabFilteredData.filter(bug => bug['Sub-System/Module'] === agingSubSystemFilter)} 
          selectedSubSystem={agingSubSystemFilter}
        />
      </div>

      <div className="file-upload" style={{ marginTop: '30px' }}>
        <h3>Upload Different Dataset</h3>
        <p>Want to analyze a different CSV file? Upload it here:</p>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
        />
      </div>
    </div>
  );
}

export default App;
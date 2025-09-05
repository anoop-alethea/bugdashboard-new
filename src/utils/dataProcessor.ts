import Papa from 'papaparse';
import { BugData, DashboardMetrics, ChartData } from '../types';
import { format, parseISO } from 'date-fns';

export const parseCSVData = (csvContent: string): Promise<BugData[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(csvContent, {
      header: true,
      delimiter: ',',
      skipEmptyLines: 'greedy',
      transformHeader: (header) => header.trim(),
      transform: (value) => value.trim(),
      complete: (results) => {
        if (results.errors.length > 0) {
          console.warn('CSV parsing warnings:', results.errors);
          // Only reject if there are critical errors, not warnings
          const criticalErrors = results.errors.filter(error => error.type === 'Delimiter');
          if (criticalErrors.length > 0) {
            reject(new Error('CSV parsing error: ' + criticalErrors[0].message));
            return;
          }
        }
        
        if (!results.data || results.data.length === 0) {
          reject(new Error('No data found in CSV file'));
          return;
        }
        
        resolve(results.data as BugData[]);
      },
      error: (error) => {
        reject(error);
      }
    });
  });
};

const parseDate = (dateString: string | null | undefined): Date | null => {
  if (!dateString || typeof dateString !== 'string' || dateString.trim() === '') {
    return null;
  }
  
  try {
    // Handle MM/DD/YYYY format
    if (dateString.includes('/')) {
      const dateMatch = dateString.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
      if (dateMatch) {
        const [, month, day, year] = dateMatch;
        const parsedDate = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
        // Validate the date is reasonable (not in far future or past)
        const now = new Date();
        const minDate = new Date('2020-01-01');
        const maxDate = new Date(now.getFullYear() + 5, 11, 31);
        
        if (parsedDate >= minDate && parsedDate <= maxDate && !isNaN(parsedDate.getTime())) {
          return parsedDate;
        }
      }
    }
    
    // Handle ISO format and other standard formats
    const parsedDate = new Date(dateString.trim());
    if (!isNaN(parsedDate.getTime())) {
      const now = new Date();
      const minDate = new Date('2020-01-01');
      const maxDate = new Date(now.getFullYear() + 5, 11, 31);
      
      if (parsedDate >= minDate && parsedDate <= maxDate) {
        return parsedDate;
      }
    }
    
    return null;
  } catch (e) {
    console.warn(`Failed to parse date: ${dateString}`, e);
    return null;
  }
};

// Helper function to safely get string values
const safeStringValue = (value: any): string => {
  if (!value) return '';
  return String(value).trim();
};

// Helper function to check if a status is closed
const isClosedStatus = (status: string): boolean => {
  const closedStatuses = ['Closed', 'Duplicated', 'Rejected', 'Verified', 'Released'];
  return closedStatuses.includes(safeStringValue(status));
};

export const calculateMetrics = (data: BugData[]): DashboardMetrics => {
  if (!Array.isArray(data) || data.length === 0) {
    return { openBugs: 0, incomingBugs: 0, outgoingBugs: 0, highPriorityBugs: 0 };
  }

  const aug1_2025 = new Date('2025-08-01');
  
  try {
    // Open bugs: All bugs except those with closed/non-active statuses
    const openBugs = data.filter(bug => 
      bug && !isClosedStatus(bug.Status)
    ).length;
    
    // Incoming bugs: Created since Aug 1, 2025
    const incomingBugs = data.filter(bug => {
      if (!bug) return false;
      const createdDate = parseDate(bug.Created);
      return createdDate && createdDate >= aug1_2025;
    }).length;
    
    // Outgoing bugs: Last updated since Aug 1, 2025 AND in closed status
    const outgoingBugs = data.filter(bug => {
      if (!bug) return false;
      const updatedDate = parseDate(bug.Updated);
      return updatedDate && 
             updatedDate >= aug1_2025 && 
             isClosedStatus(bug.Status);
    }).length;
    
    // High priority open bugs only
    const highPriorityBugs = data.filter(bug => 
      bug &&
      ['High', 'Urgent'].includes(safeStringValue(bug.Priority)) && 
      !isClosedStatus(bug.Status)
    ).length;

    return {
      openBugs,
      incomingBugs,
      outgoingBugs,
      highPriorityBugs
    };
  } catch (error) {
    console.error('Error calculating metrics:', error);
    return { openBugs: 0, incomingBugs: 0, outgoingBugs: 0, highPriorityBugs: 0 };
  }
};

export const getOpenBugsOnly = (data: BugData[]): BugData[] => {
  if (!Array.isArray(data)) return [];
  return data.filter(bug => bug && !isClosedStatus(bug.Status));
};

// Generic function to create distribution data
const createDistribution = (
  data: BugData[], 
  fieldExtractor: (bug: BugData) => string,
  colors?: { [key: string]: string },
  limit?: number
): ChartData[] => {
  if (!Array.isArray(data) || data.length === 0) return [];

  try {
    const openBugsData = getOpenBugsOnly(data);
    const counts: { [key: string]: number } = {};
    
    openBugsData.forEach(bug => {
      if (!bug) return;
      const value = fieldExtractor(bug);
      const key = safeStringValue(value) || 'Unknown';
      counts[key] = (counts[key] || 0) + 1;
    });

    let result = Object.entries(counts).map(([name, value]) => ({
      name,
      value,
      color: colors?.[name] || '#6b7280'
    }));

    // Sort by value descending
    result.sort((a, b) => b.value - a.value);
    
    // Apply limit if specified
    if (limit && result.length > limit) {
      result = result.slice(0, limit);
    }

    return result;
  } catch (error) {
    console.error('Error creating distribution:', error);
    return [];
  }
};

export const getStatusDistribution = (data: BugData[]): ChartData[] => {
  const colors = {
    'New': '#ef4444',
    'Opened': '#f97316', 
    'Assigned': '#eab308',
    'Approved': '#3b82f6',
    'Closed': '#22c55e',
    'Resolved': '#16a34a'
  };

  return createDistribution(data, bug => bug.Status, colors);
};

export const getPriorityDistribution = (data: BugData[]): ChartData[] => {
  const colors = {
    'Low': '#22c55e',
    'Normal': '#3b82f6',
    'High': '#f59e0b',
    'Urgent': '#ef4444'
  };

  return createDistribution(data, bug => bug.Priority, colors);
};

export const getOwnerTeamDistribution = (data: BugData[]): ChartData[] => {
  return createDistribution(data, bug => bug['Owner Team'], undefined, 10);
};

export const getBugClassificationDistribution = (data: BugData[]): ChartData[] => {
  return createDistribution(data, bug => bug['Bug Classification']);
};

export const getSubSystemDistribution = (data: BugData[]): ChartData[] => {
  return createDistribution(data, bug => bug['Sub-System/Module'], undefined, 8);
};

export const getCumulativeOpenBugTrend = (data: BugData[]): ChartData[] => {
  if (!Array.isArray(data) || data.length === 0) return [];

  try {
    const monthlyChanges: { [key: string]: number } = {};
    
    // Track bugs created (positive) and closed (negative) by month
    data.forEach(bug => {
      if (!bug) return;
      
      // Add bugs when created
      const createdDate = parseDate(bug.Created);
      if (createdDate) {
        const monthKey = `${createdDate.getFullYear()}-${String(createdDate.getMonth() + 1).padStart(2, '0')}`;
        monthlyChanges[monthKey] = (monthlyChanges[monthKey] || 0) + 1;
      }
      
      // Subtract bugs when closed (only if they have closed status and closed date)
      const closedDate = parseDate(bug.Closed);
      if (closedDate && isClosedStatus(bug.Status)) {
        const monthKey = `${closedDate.getFullYear()}-${String(closedDate.getMonth() + 1).padStart(2, '0')}`;
        monthlyChanges[monthKey] = (monthlyChanges[monthKey] || 0) - 1;
      }
    });

    // Get all months and sort them
    const allMonths = Object.keys(monthlyChanges).sort();
    if (allMonths.length === 0) return [];

    // Calculate cumulative values
    let cumulativeCount = 0;
    const result: ChartData[] = [];

    allMonths.forEach(monthKey => {
      cumulativeCount += monthlyChanges[monthKey] || 0;
      
      try {
        const [year, month] = monthKey.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1, 1);
        result.push({
          name: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          value: Math.max(0, cumulativeCount) // Ensure non-negative
        });
      } catch (e) {
        result.push({ name: monthKey, value: Math.max(0, cumulativeCount) });
      }
    });

    return result.slice(-12); // Last 12 months
  } catch (error) {
    console.error('Error creating cumulative trend:', error);
    return [];
  }
};

export const getMonthlyTrend = (data: BugData[]): ChartData[] => {
  if (!Array.isArray(data) || data.length === 0) return [];

  try {
    const openBugsData = getOpenBugsOnly(data);
    const monthCounts: { [key: string]: number } = {};
    
    openBugsData.forEach(bug => {
      if (!bug) return;
      
      const createdDate = parseDate(bug.Created);
      if (createdDate) {
        try {
          const monthKey = `${createdDate.getFullYear()}-${String(createdDate.getMonth() + 1).padStart(2, '0')}`;
          monthCounts[monthKey] = (monthCounts[monthKey] || 0) + 1;
        } catch (e) {
          console.warn('Error formatting date for trend:', e);
        }
      }
    });

    return Object.entries(monthCounts)
      .map(([monthKey, value]) => {
        try {
          const [year, month] = monthKey.split('-');
          const date = new Date(parseInt(year), parseInt(month) - 1, 1);
          return { 
            name: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }), 
            value,
            sortKey: monthKey
          };
        } catch (e) {
          return { name: monthKey, value, sortKey: monthKey };
        }
      })
      .sort((a, b) => (a.sortKey || a.name).localeCompare(b.sortKey || b.name))
      .slice(-12)
      .map(({ name, value }) => ({ name, value }));
  } catch (error) {
    console.error('Error creating monthly trend:', error);
    return [];
  }
};

export const filterData = (
  data: BugData[],
  filters: {
    status?: string;
    priority?: string;
    project?: string;
    ownerTeam?: string;
    assignee?: string;
    subSystem?: string;
  }
): BugData[] => {
  if (!Array.isArray(data) || !filters) return data || [];

  try {
    return data.filter(bug => {
      if (!bug) return false;

      // Helper function to check filter match
      const matchesFilter = (bugValue: any, filterValue?: string): boolean => {
        if (!filterValue || filterValue === 'All') return true;
        return safeStringValue(bugValue) === filterValue;
      };

      // Check all field filters
      return matchesFilter(bug.Status, filters.status) &&
             matchesFilter(bug.Priority, filters.priority) &&
             matchesFilter(bug.Project, filters.project) &&
             matchesFilter(bug['Owner Team'], filters.ownerTeam) &&
             matchesFilter(bug.Assignee, filters.assignee) &&
             matchesFilter(bug['Sub-System/Module'], filters.subSystem);
    });
  } catch (error) {
    console.error('Error filtering data:', error);
    return data || [];
  }
};

export const getUniqueValues = (data: BugData[], field: keyof BugData): string[] => {
  if (!Array.isArray(data) || !field) return [];
  
  try {
    const uniqueValues = new Set<string>();
    
    data.forEach(bug => {
      if (!bug) return;
      const value = safeStringValue(bug[field]);
      if (value) {
        uniqueValues.add(value);
      }
    });

    return Array.from(uniqueValues).sort();
  } catch (error) {
    console.error('Error getting unique values:', error);
    return [];
  }
};
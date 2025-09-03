import React from 'react';
import { BugData } from '../types';

interface AgingData {
  priority: string;
  '0-1 Month': number;
  '1-2 Months': number;
  '2-3 Months': number;
  '3-4 Months': number;
  '4-6 Months': number;
  '6+ Months': number;
  Total: number;
}

interface AgingTableProps {
  data: BugData[];
  selectedSubSystem?: string;
}

const AgingTable: React.FC<AgingTableProps> = ({ data, selectedSubSystem }) => {
  const parseDate = (dateString: string): Date | null => {
    if (!dateString) return null;
    try {
      if (dateString.includes('/')) {
        return new Date(dateString.replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$3-$1-$2'));
      }
      return new Date(dateString);
    } catch (e) {
      return null;
    }
  };

  const getAgeInMonths = (createdDate: Date): number => {
    const now = new Date();
    const diffTime = now.getTime() - createdDate.getTime();
    const diffMonths = diffTime / (1000 * 60 * 60 * 24 * 30.44); // Average days per month
    return Math.floor(diffMonths);
  };

  const getAgeCategory = (months: number): string => {
    if (months < 1) return '0-1 Month';
    if (months < 2) return '1-2 Months';
    if (months < 3) return '2-3 Months';
    if (months < 4) return '3-4 Months';
    if (months < 6) return '4-6 Months';
    return '6+ Months';
  };

  const calculateAgingData = (): AgingData[] => {
    if (!Array.isArray(data) || data.length === 0) {
      return [];
    }

    try {
      const closedStatuses = ['Closed', 'Duplicated', 'Rejected', 'Verified', 'Released'];
      
      // Filter for open bugs only with null checks
      let filteredData = data.filter(bug => 
        bug && 
        bug.Status && 
        !closedStatuses.includes(bug.Status)
      );
      
      // Apply subsystem filter if selected
      if (selectedSubSystem && selectedSubSystem !== 'All') {
        filteredData = filteredData.filter(bug => 
          bug && bug['Sub-System/Module'] === selectedSubSystem
        );
      }

      const priorities = ['Critical', 'High', 'Normal', 'Low'];
      const ageCategories = ['0-1 Month', '1-2 Months', '2-3 Months', '3-4 Months', '4-6 Months', '6+ Months'];
      
      const agingData: AgingData[] = priorities.map(priority => {
        const priorityBugs = filteredData.filter(bug => 
          bug && bug.Priority === priority
        );
        
        const agingCounts = ageCategories.reduce((acc, category) => {
          acc[category as keyof AgingData] = 0;
          return acc;
        }, {} as Partial<AgingData>);

        priorityBugs.forEach(bug => {
          if (!bug) return;
          
          const createdDate = parseDate(bug.Created);
          if (createdDate) {
            const ageInMonths = getAgeInMonths(createdDate);
            const category = getAgeCategory(ageInMonths);
            const currentCount = (agingCounts[category as keyof AgingData] as number) || 0;
            agingCounts[category as keyof AgingData] = currentCount + 1;
          }
        });

        return {
          priority,
          '0-1 Month': agingCounts['0-1 Month'] || 0,
          '1-2 Months': agingCounts['1-2 Months'] || 0,
          '2-3 Months': agingCounts['2-3 Months'] || 0,
          '3-4 Months': agingCounts['3-4 Months'] || 0,
          '4-6 Months': agingCounts['4-6 Months'] || 0,
          '6+ Months': agingCounts['6+ Months'] || 0,
          Total: priorityBugs.length
        };
      });

      // Add totals row with safe arithmetic
      const totalsRow: AgingData = {
        priority: 'Total',
        '0-1 Month': agingData.reduce((sum, row) => (sum || 0) + (row['0-1 Month'] || 0), 0),
        '1-2 Months': agingData.reduce((sum, row) => (sum || 0) + (row['1-2 Months'] || 0), 0),
        '2-3 Months': agingData.reduce((sum, row) => (sum || 0) + (row['2-3 Months'] || 0), 0),
        '3-4 Months': agingData.reduce((sum, row) => (sum || 0) + (row['3-4 Months'] || 0), 0),
        '4-6 Months': agingData.reduce((sum, row) => (sum || 0) + (row['4-6 Months'] || 0), 0),
        '6+ Months': agingData.reduce((sum, row) => (sum || 0) + (row['6+ Months'] || 0), 0),
        Total: agingData.reduce((sum, row) => (sum || 0) + (row.Total || 0), 0)
      };

      return [...agingData, totalsRow];
    } catch (error) {
      console.error('Error calculating aging data:', error);
      return [];
    }
  };

  const agingData = calculateAgingData();

  const getCellColor = (ageCategory: string, priority: string, value: number, isTotal: boolean = false): string => {
    if (isTotal) return 'transparent';
    
    // Priority-based color thresholds
    const getColorForPriorityAndAge = (priority: string, ageCategory: string): string => {
      const greenColor = '#f0fdf4'; // light green
      const redColor = '#fef2f2';   // light red
      
      switch (priority) {
        case 'Critical':
          // Critical: Only first month green, others red
          return ageCategory === '0-1 Month' ? greenColor : redColor;
          
        case 'High':
          // High: First 2 columns green, others red
          return ['0-1 Month', '1-2 Months'].includes(ageCategory) ? greenColor : redColor;
          
        case 'Normal':
          // Normal: First 4 columns green, others red
          return ['0-1 Month', '1-2 Months', '2-3 Months', '3-4 Months'].includes(ageCategory) ? greenColor : redColor;
          
        case 'Low':
          // Low: First 5 columns green, last red
          return ageCategory === '6+ Months' ? redColor : greenColor;
          
        default:
          return 'transparent';
      }
    };
    
    return getColorForPriorityAndAge(priority, ageCategory);
  };

  return (
    <div className="chart-card">
      <h3 className="chart-title">
        📅 Aging vs Priority Analysis
        {selectedSubSystem && selectedSubSystem !== 'All' && (
          <span style={{ fontSize: '0.9rem', color: '#6b7280', marginLeft: '10px' }}>
            (Filtered by: {selectedSubSystem})
          </span>
        )}
      </h3>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ 
          width: '100%', 
          borderCollapse: 'collapse',
          fontSize: '0.9rem'
        }}>
          <thead>
            <tr style={{ backgroundColor: '#f3f4f6' }}>
              <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: '600' }}>Priority</th>
              <th style={{ padding: '12px 8px', textAlign: 'center', fontWeight: '600' }}>0-1 Month</th>
              <th style={{ padding: '12px 8px', textAlign: 'center', fontWeight: '600' }}>1-2 Months</th>
              <th style={{ padding: '12px 8px', textAlign: 'center', fontWeight: '600' }}>2-3 Months</th>
              <th style={{ padding: '12px 8px', textAlign: 'center', fontWeight: '600' }}>3-4 Months</th>
              <th style={{ padding: '12px 8px', textAlign: 'center', fontWeight: '600' }}>4-6 Months</th>
              <th style={{ padding: '12px 8px', textAlign: 'center', fontWeight: '600' }}>6+ Months</th>
              <th style={{ padding: '12px 8px', textAlign: 'center', fontWeight: '600' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {agingData.map((row, index) => (
              <tr key={row.priority} style={{ 
                borderBottom: '1px solid #e5e7eb',
                backgroundColor: row.priority === 'Total' ? '#f9fafb' : 'white'
              }}>
                <td style={{ 
                  padding: '10px 8px', 
                  fontWeight: row.priority === 'Total' ? '600' : '500',
                  backgroundColor: row.priority === 'Total' ? '#f3f4f6' : 'white'
                }}>
                  {row.priority}
                </td>
                <td style={{ 
                  padding: '10px 8px', 
                  textAlign: 'center',
                  backgroundColor: getCellColor('0-1 Month', row.priority, row['0-1 Month'], row.priority === 'Total')
                }}>
                  {row['0-1 Month']}
                </td>
                <td style={{ 
                  padding: '10px 8px', 
                  textAlign: 'center',
                  backgroundColor: getCellColor('1-2 Months', row.priority, row['1-2 Months'], row.priority === 'Total')
                }}>
                  {row['1-2 Months']}
                </td>
                <td style={{ 
                  padding: '10px 8px', 
                  textAlign: 'center',
                  backgroundColor: getCellColor('2-3 Months', row.priority, row['2-3 Months'], row.priority === 'Total')
                }}>
                  {row['2-3 Months']}
                </td>
                <td style={{ 
                  padding: '10px 8px', 
                  textAlign: 'center',
                  backgroundColor: getCellColor('3-4 Months', row.priority, row['3-4 Months'], row.priority === 'Total')
                }}>
                  {row['3-4 Months']}
                </td>
                <td style={{ 
                  padding: '10px 8px', 
                  textAlign: 'center',
                  backgroundColor: getCellColor('4-6 Months', row.priority, row['4-6 Months'], row.priority === 'Total')
                }}>
                  {row['4-6 Months']}
                </td>
                <td style={{ 
                  padding: '10px 8px', 
                  textAlign: 'center',
                  backgroundColor: getCellColor('6+ Months', row.priority, row['6+ Months'], row.priority === 'Total')
                }}>
                  {row['6+ Months']}
                </td>
                <td style={{ 
                  padding: '10px 8px', 
                  textAlign: 'center',
                  fontWeight: '600',
                  backgroundColor: row.priority === 'Total' ? '#f3f4f6' : 'white'
                }}>
                  {row.Total}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ 
        marginTop: '15px', 
        fontSize: '0.8rem', 
        color: '#6b7280',
        lineHeight: '1.4'
      }}>
        <div style={{ marginBottom: '8px', fontWeight: '600' }}>Priority-based aging thresholds:</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '4px' }}>
          <div style={{ width: '12px', height: '12px', backgroundColor: '#f0fdf4', border: '1px solid #ccc' }}></div>
          <span style={{ minWidth: '60px', fontWeight: '500' }}>Green:</span>
          <span>Critical: 0-1 month | High: 0-2 months | Normal: 0-4 months | Low: 0-5 months</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ width: '12px', height: '12px', backgroundColor: '#fef2f2', border: '1px solid #ccc' }}></div>
          <span style={{ minWidth: '60px', fontWeight: '500' }}>Red:</span>
          <span>Critical: 1+ months | High: 2+ months | Normal: 4+ months | Low: 6+ months</span>
        </div>
      </div>
    </div>
  );
};

export default AgingTable;
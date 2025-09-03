import React from 'react';
import { BugData } from '../types';
import { getUniqueValues } from '../utils/dataProcessor';

interface FiltersProps {
  data: BugData[];
  filters: {
    status?: string;
    priority?: string;
    project?: string;
    ownerTeam?: string;
    assignee?: string;
    subSystem?: string;
  };
  onFilterChange: (key: string, value: string) => void;
}

const Filters: React.FC<FiltersProps> = ({ data, filters, onFilterChange }) => {
  // Only get unique values where data actually exists (non-empty, non-null values)
  const getFilteredUniqueValues = (data: BugData[], field: keyof BugData): string[] => {
    const values = data
      .map(bug => bug[field])
      .filter(value => value && value.toString().trim() !== '')
      .filter(Boolean);
    return Array.from(new Set(values)).sort();
  };

  const statuses = getFilteredUniqueValues(data, 'Status');
  const priorities = getFilteredUniqueValues(data, 'Priority');
  const projects = getFilteredUniqueValues(data, 'Project');
  const ownerTeams = getFilteredUniqueValues(data, 'Owner Team');
  const assignees = getFilteredUniqueValues(data, 'Assignee');
  const subSystems = getFilteredUniqueValues(data, 'Sub-System/Module');

  return (
    <div className="filters">
      <h3>Filters & Analysis</h3>
      <div className="filter-row">
        {statuses.length > 0 && (
          <div className="filter-group">
            <label>Status</label>
            <select 
              value={filters.status || 'All'} 
              onChange={(e) => onFilterChange('status', e.target.value)}
            >
              <option value="All">All Status</option>
              {statuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        )}

        {priorities.length > 0 && (
          <div className="filter-group">
            <label>Priority</label>
            <select 
              value={filters.priority || 'All'} 
              onChange={(e) => onFilterChange('priority', e.target.value)}
            >
              <option value="All">All Priorities</option>
              {priorities.map(priority => (
                <option key={priority} value={priority}>{priority}</option>
              ))}
            </select>
          </div>
        )}

        {subSystems.length > 0 && (
          <div className="filter-group">
            <label>Sub-System/Module</label>
            <select 
              value={filters.subSystem || 'All'} 
              onChange={(e) => onFilterChange('subSystem', e.target.value)}
            >
              <option value="All">All Sub-Systems</option>
              {subSystems.map(subSystem => (
                <option key={subSystem} value={subSystem}>{subSystem}</option>
              ))}
            </select>
          </div>
        )}

        {projects.length > 0 && (
          <div className="filter-group">
            <label>Project</label>
            <select 
              value={filters.project || 'All'} 
              onChange={(e) => onFilterChange('project', e.target.value)}
            >
              <option value="All">All Projects</option>
              {projects.map(project => (
                <option key={project} value={project}>{project}</option>
              ))}
            </select>
          </div>
        )}

        {ownerTeams.length > 0 && (
          <div className="filter-group">
            <label>Owner Team</label>
            <select 
              value={filters.ownerTeam || 'All'} 
              onChange={(e) => onFilterChange('ownerTeam', e.target.value)}
            >
              <option value="All">All Teams</option>
              {ownerTeams.map(team => (
                <option key={team} value={team}>{team}</option>
              ))}
            </select>
          </div>
        )}

        {assignees.length > 0 && (
          <div className="filter-group">
            <label>Assignee</label>
            <select 
              value={filters.assignee || 'All'} 
              onChange={(e) => onFilterChange('assignee', e.target.value)}
            >
              <option value="All">All Assignees</option>
              {assignees.map(assignee => (
                <option key={assignee} value={assignee}>{assignee}</option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
};

export default Filters;
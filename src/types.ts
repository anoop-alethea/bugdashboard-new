export interface BugData {
  '#': string;
  'Project': string;
  'Tracker': string;
  'Parent task': string;
  'Status': string;
  'Priority': string;
  'Subject': string;
  'Author': string;
  'Assignee': string;
  'Updated': string;
  'Category': string;
  'Target version': string;
  'Start date': string;
  'Due date': string;
  'Estimated time': string;
  'Total estimated time': string;
  'Spent time': string;
  'Total spent time': string;
  '% Done': string;
  'Created': string;
  'Closed': string;
  'Last updated by': string;
  'Related issues': string;
  'Files': string;
  'Customer Name': string;
  'Revision': string;
  'Revision_1': string;
  'Reproducible': string;
  'Regression': string;
  'Sub-System/Module': string;
  'Owner Team': string;
  'Test Case ID/Tag': string;
  'Origin Version Reported': string;
  'Bug Classification': string;
  'Issue Category': string;
  'Originator': string;
  'Timeframe': string;
  'Applications CP': string;
  'Solutions CP': string;
  'Platforms CP': string;
  'Scripting CP': string;
  'Context': string;
  'Release': string;
}

export interface DashboardMetrics {
  openBugs: number;
  incomingBugs: number;
  outgoingBugs: number;
  highPriorityBugs: number;
}

export interface ChartData {
  name: string;
  value: number;
  color?: string;
}
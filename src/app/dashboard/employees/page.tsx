'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  PlusIcon, 
  UserGroupIcon, 
  ChartBarIcon, 
  FunnelIcon,
  BellIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { employeeApi, Employee } from '@/lib/employeeApi';
import { inquiryApi } from '@/lib/inquiryApi';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import DataTable from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
      
// Real-time status types
type EmployeeStatus = 'online' | 'busy' | 'away' | 'offline';
type ActivityType = 'login' | 'logout' | 'status_change' | 'task_completed' | 'break_start' | 'break_end';

interface EmployeeActivity {
  id: string;
  employeeId: string;
  employeeName: string;
  type: ActivityType;
  message: string;
  timestamp: Date;
  status?: EmployeeStatus;
}

interface EmployeeStatusData extends Employee {
  realTimeStatus: EmployeeStatus;
  lastActivity: Date;
  currentTask?: string;
  workingHours: number;
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showPerformanceModal, setShowPerformanceModal] = useState(false);
  
  // Real-time status state
  const [employeeStatuses, setEmployeeStatuses] = useState<Record<string, EmployeeStatusData>>({});
  const [recentActivities, setRecentActivities] = useState<EmployeeActivity[]>([]);
  const [isLive, setIsLive] = useState(true);
  const [newActivityCount, setNewActivityCount] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Real-time leads tracking
  const [employeeLeads, setEmployeeLeads] = useState<Record<string, number>>({});
  const leadsIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Filters
  const [filters, setFilters] = useState({
    department: '',
    role: '',
    isActive: true,
    page: 1,
    limit: 10
  });

  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0
  });

  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    managers: 0,
    avgConversionRate: 0
  });

  // Real-time activity templates
  const activityTemplates = {
    login: ['logged in to the system', 'started their workday', 'came online'],
    logout: ['logged out', 'ended their workday', 'went offline'],
    status_change: ['changed status to {status}', 'updated their availability', 'switched to {status}'],
    task_completed: ['completed a task', 'finished working on inquiry', 'closed a lead'],
    break_start: ['started a break', 'went on break', 'stepped away'],
    break_end: ['returned from break', 'resumed work', 'came back online']
  };

  const statusColors = {
    online: 'bg-green-500',
    busy: 'bg-red-500', 
    away: 'bg-yellow-500',
    offline: 'bg-gray-400'
  };

  const generateRandomActivity = () => {
    if (employees.length === 0) return null;
    
    // Only generate activities for active employees
    const activeEmployees = employees.filter(emp => emp.isActive);
    if (activeEmployees.length === 0) return null;
    
    const employee = activeEmployees[Math.floor(Math.random() * activeEmployees.length)];
    const currentStatus = employeeStatuses[employee._id]?.realTimeStatus || 'offline';
    
    // More realistic activity distribution based on current status
    let activityTypes: ActivityType[] = [];
    let newStatus: EmployeeStatus | undefined;
    
    // Determine possible activities based on current status
    if (currentStatus === 'offline') {
      activityTypes = ['login'];
      newStatus = 'online';
    } else if (currentStatus === 'online') {
      activityTypes = ['status_change', 'task_completed', 'break_start'];
      if (Math.random() < 0.1) activityTypes.push('logout'); // 10% chance to logout
    } else if (currentStatus === 'busy') {
      activityTypes = ['task_completed', 'status_change'];
      if (Math.random() < 0.3) activityTypes.push('break_start'); // 30% chance for break
    } else if (currentStatus === 'away') {
      activityTypes = ['break_end', 'status_change'];
      if (Math.random() < 0.2) activityTypes.push('logout'); // 20% chance to logout
    }
    
    const activityType = activityTypes[Math.floor(Math.random() * activityTypes.length)];
    let message = '';
    
    // Generate status and message based on activity
    if (activityType === 'status_change') {
      const possibleStatuses: EmployeeStatus[] = currentStatus === 'online' ? ['busy', 'away'] :
                                                currentStatus === 'busy' ? ['online', 'away'] :
                                                currentStatus === 'away' ? ['online', 'busy'] :
                                                ['online'];
      newStatus = possibleStatuses[Math.floor(Math.random() * possibleStatuses.length)];
      const templates = activityTemplates[activityType];
      message = templates[Math.floor(Math.random() * templates.length)].replace('{status}', newStatus);
    } else {
      const templates = activityTemplates[activityType];
      message = templates[Math.floor(Math.random() * templates.length)];
      
      // Set status based on activity type
      if (activityType === 'login') newStatus = 'online';
      if (activityType === 'logout') newStatus = 'offline';
      if (activityType === 'break_start') newStatus = 'away';
      if (activityType === 'break_end') newStatus = 'online';
      if (activityType === 'task_completed') newStatus = currentStatus === 'busy' ? 'online' : currentStatus;
    }

    return {
      id: Date.now().toString() + Math.random(),
      employeeId: employee._id,
      employeeName: employee.name,
      type: activityType,
      message: `${employee.name} ${message}`,
      timestamp: new Date(),
      status: newStatus
    };
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - timestamp.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  // Fetch real-time leads count for all employees
  const fetchEmployeeLeads = async () => {
    try {
      const leadsData: Record<string, number> = {};
      
      // Fetch all inquiries
      const response = await inquiryApi.getAllInquiries({ limit: 1000 });
      
      // Count leads assigned to each employee
      employees.forEach(employee => {
        const assignedLeads = response.data.filter(inquiry => 
          inquiry.assignedTo?._id === employee._id
        ).length;
        leadsData[employee._id] = assignedLeads;
      });
      
      setEmployeeLeads(leadsData);
    } catch (error) {
      console.error('Failed to fetch employee leads:', error);
    }
  };

  const addNewActivity = (activity: EmployeeActivity) => {
    setRecentActivities(prev => {
      const newActivities = [activity, ...prev].slice(0, 10); // Keep only latest 10
      return newActivities;
    });
    setNewActivityCount(prev => prev + 1);
    
    // Update employee status if applicable
    if (activity.status) {
      setEmployeeStatuses(prev => ({
        ...prev,
        [activity.employeeId]: {
          ...prev[activity.employeeId],
          realTimeStatus: activity.status!,
          lastActivity: activity.timestamp
        }
      }));
    }
    
    // Auto-reset new activity count after 3 seconds
    setTimeout(() => {
      setNewActivityCount(0);
    }, 3000);
  };

  useEffect(() => {
    fetchEmployees();
  }, [filters]);

  // Fetch leads data when employees change
  useEffect(() => {
    if (employees.length > 0) {
      fetchEmployeeLeads();
    }
  }, [employees]);

  // Set up real-time leads updates
  useEffect(() => {
    if (!isLive || employees.length === 0) return;

    const interval = setInterval(() => {
      fetchEmployeeLeads();
    }, 30000); // Update every 30 seconds

    leadsIntervalRef.current = interval;
    return () => {
      if (leadsIntervalRef.current) {
        clearInterval(leadsIntervalRef.current);
      }
    };
  }, [isLive, employees]);

  // Real-time activity simulation
  useEffect(() => {
    if (!isLive || employees.length === 0) return;

    const generateActivity = () => {
      const activity = generateRandomActivity();
      if (activity) {
        addNewActivity(activity);
      }
    };

    // Generate initial activities
    if (recentActivities.length === 0 && employees.length > 0) {
      for (let i = 0; i < 5; i++) {
        setTimeout(() => {
          const activity = generateRandomActivity();
          if (activity) {
            activity.timestamp = new Date(Date.now() - (i + 1) * 30 * 60 * 1000); // Spread over last 2.5 hours
            setRecentActivities(prev => [...prev, activity]);
          }
        }, i * 100);
      }
    }

    const interval = setInterval(() => {
      // Generate new activity every 15-30 seconds
      const randomDelay = Math.random() * 15000 + 15000;
      setTimeout(generateActivity, randomDelay);
    }, 20000);

    intervalRef.current = interval;
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isLive, employees]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await employeeApi.getEmployees(filters);
      setEmployees(response.data);
      setPagination(response.pagination);
      
      // Calculate stats
      const total = response.data.length;
      const active = response.data.filter(emp => emp.isActive).length;
      const managers = response.data.filter(emp => emp.role === 'Manager').length;
      const avgConversionRate = response.data.reduce((sum, emp) => sum + (emp.performance?.conversionRate || 0), 0) / total || 0;
      
      setStats({ total, active, managers, avgConversionRate });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEmployee = () => {
    setShowCreateModal(true);
  };

  const handleViewPerformance = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowPerformanceModal(true);
  };

  const handleUpdateAvailability = async (employeeId: string, isAvailable: boolean) => {
    try {
      await employeeApi.updateAvailability(employeeId, isAvailable);
      fetchEmployees(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update availability');
    }
  };

  const columns = [
    {
      key: 'employeeId',
      label: 'Employee ID',
      render: (value: string) => (
        <span className="font-mono text-sm">{value}</span>
      )
    },
    {
      key: 'name',
      label: 'Name',
      render: (value: string, row: Employee) => (
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
            <span className="text-sm font-medium text-blue-600">
              {value.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <div className="font-medium text-gray-900">{value}</div>
            <div className="text-sm text-gray-500">{row.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'department',
      label: 'Department',
      render: (value: string) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          {value}
        </span>
      )
    },
    {
      key: 'role',
      label: 'Role',
      render: (value: string) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          value === 'Manager' ? 'bg-purple-100 text-purple-800' :
          value === 'Admin' ? 'bg-red-100 text-red-800' :
          'bg-blue-100 text-blue-800'
        }`}>
          {value}
        </span>
      )
    },
    {
      key: 'leadsAssigned',
      label: 'Leads Assigned',
      render: (value: number, row: Employee) => {
        const realTimeLeads = employeeLeads[row._id] ?? value ?? 0;
        const hasChanged = employeeLeads[row._id] !== undefined && employeeLeads[row._id] !== value;
        
        return (
          <div className="flex items-center space-x-2">
            <span className={`text-sm font-medium ${hasChanged ? 'text-blue-600' : ''}`}>
              {realTimeLeads}
            </span>
            {hasChanged && (
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            )}
            {isLive && (
              <span className="text-xs text-green-600">Live</span>
            )}
          </div>
        );
      }
    },
    {
      key: 'conversionRate',
      label: 'Conversion Rate',
      render: (value: number) => (
        <span className={`text-sm font-medium ${
          value >= 20 ? 'text-green-600' :
          value >= 10 ? 'text-yellow-600' :
          'text-red-600'
        }`}>
          {value.toFixed(1)}%
        </span>
      )
    },
    {
      key: 'isAvailable',
      label: 'Status',
      render: (value: boolean, row: Employee) => {
        const realTimeStatus = employeeStatuses[row._id]?.realTimeStatus || 'offline';
        const lastActivity = employeeStatuses[row._id]?.lastActivity;
        
        return (
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${statusColors[realTimeStatus]} ${
                realTimeStatus === 'online' ? 'animate-pulse' : ''
              }`}></div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                row.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {row.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            
            <div className="flex flex-col">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                realTimeStatus === 'online' ? 'bg-green-100 text-green-800' :
                realTimeStatus === 'busy' ? 'bg-red-100 text-red-800' :
                realTimeStatus === 'away' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {realTimeStatus.charAt(0).toUpperCase() + realTimeStatus.slice(1)}
              </span>
              {lastActivity && (
                <span className="text-xs text-gray-500 mt-1">
                  {formatTimeAgo(lastActivity)}
                </span>
              )}
            </div>
            
            {row.isActive && (
              <button
                onClick={() => handleUpdateAvailability(row._id, !value)}
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  value ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                }`}
              >
                {value ? 'Available' : 'Busy'}
              </button>
            )}
          </div>
        );
      }
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, row: Employee) => (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleViewPerformance(row)}
          >
            <ChartBarIcon className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employee Management</h1>
          <p className="text-gray-600">Manage your team members and track their performance</p>
        </div>
        <div className="flex items-center space-x-4">
          {/* Real-time Leads Indicator */}
          <div className="flex items-center space-x-2 px-3 py-2 bg-blue-50 rounded-lg">
            <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
            <span className="text-sm text-gray-600">{isLive ? 'Live Leads' : 'Paused'}</span>
            <button
              onClick={() => setIsLive(!isLive)}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              {isLive ? 'Pause' : 'Resume'}
            </button>
          </div>
          
          {/* Manual Refresh */}
          <Button
            variant="outline"
            onClick={fetchEmployeeLeads}
            className="text-sm"
          >
            Refresh Leads
          </Button>
          
          <Button onClick={handleCreateEmployee}>
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Employee
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UserGroupIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Employees</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <div className="h-4 w-4 bg-green-600 rounded-full animate-pulse"></div>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Online Now</p>
              <p className="text-2xl font-bold text-gray-900">
                {Object.values(employeeStatuses).filter(emp => emp.realTimeStatus === 'online').length}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                <div className="h-4 w-4 bg-red-600 rounded-full"></div>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Busy</p>
              <p className="text-2xl font-bold text-gray-900">
                {Object.values(employeeStatuses).filter(emp => emp.realTimeStatus === 'busy').length}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                <UserGroupIcon className="h-4 w-4 text-purple-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Managers</p>
              <p className="text-2xl font-bold text-gray-900">{stats.managers}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ChartBarIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Avg Conversion</p>
              <p className="text-2xl font-bold text-gray-900">{stats.avgConversionRate.toFixed(1)}%</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Real-time Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* Filters */}
          <Card>
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center space-x-2">
                <FunnelIcon className="h-5 w-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">Filters:</span>
              </div>
              
              <select
                value={filters.department}
                onChange={(e) => setFilters({ ...filters, department: e.target.value, page: 1 })}
                className="rounded-md border-gray-300 text-sm"
              >
                <option value="">All Departments</option>
                <option value="Sales">Sales</option>
                <option value="Marketing">Marketing</option>
                <option value="Support">Support</option>
                <option value="Operations">Operations</option>
              </select>

              <select
                value={filters.role}
                onChange={(e) => setFilters({ ...filters, role: e.target.value, page: 1 })}
                className="rounded-md border-gray-300 text-sm"
              >
                <option value="">All Roles</option>
                <option value="Employee">Employee</option>
                <option value="Manager">Manager</option>
                <option value="Admin">Admin</option>
              </select>

              <select
                value={filters.isActive.toString()}
                onChange={(e) => setFilters({ ...filters, isActive: e.target.value === 'true', page: 1 })}
                className="rounded-md border-gray-300 text-sm"
              >
                <option value="true">Active Only</option>
                <option value="false">Inactive Only</option>
              </select>
            </div>
          </Card>
        </div>
        <div>
          <Card>
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <BellIcon className="h-5 w-5 mr-2 text-blue-600" />
                  Live Activity Feed
                  {newActivityCount > 0 && (
                    <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                      {newActivityCount} new
                    </span>
                  )}
                </h3>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                  <span className="text-xs text-gray-500">{isLive ? 'Live' : 'Paused'}</span>
                  <button
                    onClick={() => setIsLive(!isLive)}
                    className="text-xs text-blue-600 hover:text-blue-800 ml-2"
                  >
                    {isLive ? 'Pause' : 'Resume'}
                  </button>
                </div>
              </div>
            </div>
            <div className="p-4 max-h-96 overflow-y-auto">
              <div className="space-y-3">
                {recentActivities.map((activity, index) => {
                  const isNew = index < newActivityCount;
                  const activityIcon = activity.type === 'login' ? CheckCircleIcon :
                                     activity.type === 'logout' ? ExclamationCircleIcon :
                                     activity.type === 'task_completed' ? CheckCircleIcon :
                                     ClockIcon;
                  
                  return (
                    <div 
                      key={activity.id}
                      className={`flex items-start space-x-3 p-3 rounded-lg transition-all duration-300 ${
                        isNew 
                          ? 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 shadow-md transform scale-[1.02]' 
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex-shrink-0">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          activity.type === 'login' ? 'bg-green-100' :
                          activity.type === 'logout' ? 'bg-red-100' :
                          activity.type === 'task_completed' ? 'bg-blue-100' :
                          'bg-yellow-100'
                        }`}>
                          <activityIcon className={`h-4 w-4 ${
                            activity.type === 'login' ? 'text-green-600' :
                            activity.type === 'logout' ? 'text-red-600' :
                            activity.type === 'task_completed' ? 'text-blue-600' :
                            'text-yellow-600'
                          }`} />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 font-medium">{activity.message}</p>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-xs text-gray-500">{formatTimeAgo(activity.timestamp)}</p>
                          {activity.status && (
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              activity.status === 'online' ? 'bg-green-100 text-green-700' :
                              activity.status === 'busy' ? 'bg-red-100 text-red-700' :
                              activity.status === 'away' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {activity.status}
                            </span>
                          )}
                          {isNew && (
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {recentActivities.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <BellIcon className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                    <p className="text-sm">No recent activity</p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>


      {/* Employees Table */}
      <Card>
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Employees</h3>
        </div>
        <DataTable
          data={employees}
          columns={columns}
          loading={loading}
          emptyMessage="No employees found"
        />
        
        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {((pagination.current - 1) * filters.limit) + 1} to {Math.min(pagination.current * filters.limit, pagination.total)} of {pagination.total} results
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.current === 1}
                onClick={() => setFilters({ ...filters, page: pagination.current - 1 })}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.current === pagination.pages}
                onClick={() => setFilters({ ...filters, page: pagination.current + 1 })}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Create Employee Modal */}
      {showCreateModal && (
        <CreateEmployeeModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchEmployees();
          }}
        />
      )}

      {/* Performance Modal */}
      {showPerformanceModal && selectedEmployee && (
        <EmployeePerformanceModal
          employee={selectedEmployee}
          isOpen={showPerformanceModal}
          onClose={() => {
            setShowPerformanceModal(false);
            setSelectedEmployee(null);
          }}
        />
      )}

      {error && (
        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-2 text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}

// Create Employee Modal Component
function CreateEmployeeModal({ isOpen, onClose, onSuccess }: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    employeeId: '',
    name: '',
    email: '',
    phone: '',
    role: 'Employee',
    department: '',
    specialization: [] as string[],
    password: '',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India'
    },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await employeeApi.createEmployee(formData);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create employee');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Employee">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Employee ID"
            value={formData.employeeId}
            onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
            required
          />
          <Input
            label="Full Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <Input
            label="Phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full rounded-md border-gray-300"
              required
            >
              <option value="Employee">Employee</option>
              <option value="Manager">Manager</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <select
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="w-full rounded-md border-gray-300"
              required
            >
              <option value="">Select Department</option>
              <option value="Sales">Sales</option>
              <option value="Marketing">Marketing</option>
              <option value="Support">Support</option>
              <option value="Operations">Operations</option>
            </select>
          </div>
        </div>

        <Input
          label="Password"
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required
        />

        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-700">Address (Optional)</h4>
          <div className="grid grid-cols-1 gap-3">
            <Input
              label="Street"
              value={formData.address.street}
              onChange={(e) => setFormData({ 
                ...formData, 
                address: { ...formData.address, street: e.target.value }
              })}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="City"
                value={formData.address.city}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  address: { ...formData.address, city: e.target.value }
                })}
              />
              <Input
                label="State"
                value={formData.address.state}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  address: { ...formData.address, state: e.target.value }
                })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Pincode"
                value={formData.address.pincode}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  address: { ...formData.address, pincode: e.target.value }
                })}
              />
              <Input
                label="Country"
                value={formData.address.country}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  address: { ...formData.address, country: e.target.value }
                })}
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="text-red-600 text-sm">{error}</div>
        )}

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={loading}>
            Create Employee
          </Button>
        </div>
      </form>
    </Modal>
  );
}

// Employee Performance Modal Component
function EmployeePerformanceModal({ employee, isOpen, onClose }: {
  employee: Employee;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [performance, setPerformance] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && employee) {
      fetchPerformance();
    }
  }, [isOpen, employee]);

  const fetchPerformance = async () => {
    try {
      setLoading(true);
      const response = await employeeApi.getEmployeePerformance(employee._id);
      setPerformance(response.data);
    } catch (err) {
      console.error('Failed to fetch performance:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Performance - ${employee.name}`} size="lg">
      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : performance ? (
        <div className="space-y-6">
          {/* Performance Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-600 font-medium">Total Assigned</p>
              <p className="text-2xl font-bold text-blue-900">{performance.performance.totalAssigned}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-600 font-medium">Converted</p>
              <p className="text-2xl font-bold text-green-900">{performance.performance.converted}</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-sm text-yellow-600 font-medium">In Progress</p>
              <p className="text-2xl font-bold text-yellow-900">{performance.performance.inProgress}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm text-purple-600 font-medium">Conversion Rate</p>
              <p className="text-2xl font-bold text-purple-900">{performance.performance.conversionRate}%</p>
            </div>
          </div>

          {/* Inquiry Breakdown */}
          {performance.inquiryBreakdown && performance.inquiryBreakdown.length > 0 && (
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-3">Inquiry Breakdown by Type</h4>
              <div className="space-y-2">
                {performance.inquiryBreakdown.map((item: any, index: number) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">{item._id}</span>
                    <div className="text-right">
                      <span className="text-sm text-gray-600">{item.count} total</span>
                      <span className="ml-2 text-sm font-medium text-green-600">{item.converted} converted</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center text-gray-500">No performance data available</div>
      )}
    </Modal>
  );
}

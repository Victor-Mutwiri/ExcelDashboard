
import { DashboardTemplate } from '../types';

export const dashboardTemplates: DashboardTemplate[] = [
  {
    id: 'sales-standard',
    name: 'Sales Overview',
    description: 'Track revenue trends, top selling products, and regional performance.',
    category: 'Sales',
    iconName: 'ChartAnalyticsIcon',
    requiredFields: [
      { key: 'date', label: 'Date', dataType: 'date' },
      { key: 'revenue', label: 'Revenue / Sales Amount', dataType: 'number' },
      { key: 'product', label: 'Product Name', dataType: 'string' },
      { key: 'region', label: 'Region / Country', dataType: 'string' },
    ],
    widgets: [
      {
        id: 't-title',
        type: 'title',
        size: 'full',
        config: { text: 'Sales Performance Dashboard', fontFamily: 'Montserrat', fontSize: 32, textAlign: 'left' }
      },
      {
        id: 't-kpi-rev',
        type: 'kpi',
        size: '1/4',
        config: { title: 'Total Revenue', valueFormula: '{revenue}', computation: 'SUM' }
      },
      {
        id: 't-kpi-avg-order',
        type: 'kpi',
        size: '1/4',
        config: { title: 'Average Order Value', valueFormula: '{revenue}', computation: 'AVERAGE' }
      },
      {
        id: 't-kpi-orders',
        type: 'kpi',
        size: '1/4',
        config: { title: 'Total Orders', valueFormula: '{revenue}', computation: 'COUNT' }
      },
      {
        id: 't-rank-prod',
        type: 'rank',
        size: '1/4',
        config: { title: 'Top Products', categoryField: '{{product}}', valueField: '{{revenue}}', aggregation: 'SUM', limit: 5, order: 'desc' }
      },
      {
        id: 't-chart-trend',
        type: 'chart',
        size: '2/3',
        config: {
          title: 'Revenue Trend',
          chartType: 'area',
          xAxisKey: '{{date}}',
          yAxisKeys: ['{{revenue}}'],
          seriesConfig: { '{{revenue}}': 'SUM' },
          seriesColors: { '{{revenue}}': '#4f46e5' },
          seriesType: {},
          showDataLabels: false
        }
      },
      {
        id: 't-chart-region',
        type: 'chart',
        size: '1/3',
        config: {
          title: 'Sales by Region',
          chartType: 'pie',
          xAxisKey: '{{region}}',
          yAxisKeys: ['{{revenue}}'],
          seriesConfig: { '{{revenue}}': 'SUM' },
          seriesColors: {},
          seriesType: {},
          showDataLabels: true
        }
      }
    ]
  },
  {
    id: 'finance-profit',
    name: 'Financial Health',
    description: 'Analyze income, expenses, and net profit margins.',
    category: 'Finance',
    iconName: 'CalculatorIcon',
    requiredFields: [
      { key: 'date', label: 'Transaction Date', dataType: 'date' },
      { key: 'income', label: 'Income / Revenue', dataType: 'number' },
      { key: 'expense', label: 'Expense / Cost', dataType: 'number' },
      { key: 'category', label: 'Expense Category', dataType: 'string' },
    ],
    widgets: [
      {
        id: 'f-title',
        type: 'title',
        size: 'full',
        config: { text: 'Financial Overview', fontFamily: 'Roboto', fontSize: 32, textAlign: 'center' }
      },
      {
        id: 'f-kpi-income',
        type: 'kpi',
        size: '1/3',
        config: { title: 'Total Income', valueFormula: '{income}', computation: 'SUM' }
      },
      {
        id: 'f-kpi-expense',
        type: 'kpi',
        size: '1/3',
        config: { title: 'Total Expenses', valueFormula: '{expense}', computation: 'SUM' }
      },
      {
        id: 'f-kpi-profit',
        type: 'kpi',
        size: '1/3',
        config: { title: 'Net Profit', valueFormula: '{income} - {expense}', computation: 'SUM' }
      },
      {
        id: 'f-chart-cf',
        type: 'chart',
        size: 'full',
        config: {
          title: 'Cash Flow Analysis',
          chartType: 'bar',
          xAxisKey: '{{date}}',
          yAxisKeys: ['{{income}}', '{{expense}}'],
          seriesConfig: { '{{income}}': 'SUM', '{{expense}}': 'SUM' },
          seriesColors: { '{{income}}': '#10b981', '{{expense}}': '#ef4444' },
          seriesType: { '{{income}}': 'bar', '{{expense}}': 'bar' },
          showDataLabels: false
        }
      },
      {
        id: 'f-pivot-cat',
        type: 'pivot',
        size: '1/2',
        config: {
          title: 'Expenses by Category',
          rowFields: ['{{category}}'],
          colFields: [],
          valueField: '{{expense}}',
          aggregation: 'SUM'
        }
      },
       {
        id: 'f-rank-exp',
        type: 'rank',
        size: '1/2',
        config: { title: 'Highest Expense Categories', categoryField: '{{category}}', valueField: '{{expense}}', aggregation: 'SUM', limit: 5, order: 'desc' }
      },
    ]
  },
  {
      id: 'finance-trading',
      name: 'Trading Performance',
      description: 'Prop firm ready. Analyze P/L, drawdowns, and progress towards targets.',
      category: 'Finance',
      iconName: 'ChartAnalyticsIcon',
      requiredFields: [
        { key: 'date', label: 'Close Date', dataType: 'date' },
        { key: 'pl', label: 'Net P/L', dataType: 'number' },
        { key: 'commission', label: 'Commission / Fees', dataType: 'number' },
        { key: 'symbol', label: 'Symbol / Ticker', dataType: 'string' },
        { key: 'strategy', label: 'Strategy Name', dataType: 'string', optional: true },
        { key: 'outcome', label: 'Outcome (Win/Loss)', dataType: 'string', optional: true },
        { key: 'rr', label: 'Risk:Reward Ratio', dataType: 'number', optional: true },
        { key: 'balance', label: 'Account Balance', dataType: 'number', optional: true },
      ],
      customFields: [
        { key: 'starting_capital', label: 'Starting Capital', defaultValue: '100000', inputType: 'number' },
        { key: 'profit_target', label: 'Profit Target', defaultValue: '10000', inputType: 'number' },
        { key: 'drawdown_limit', label: 'Drawdown Limit', defaultValue: '5000', inputType: 'number' }
      ],
      widgets: [
        {
          id: 'tr-title',
          type: 'title',
          size: 'full',
          config: { text: 'Trading Performance Dashboard', fontFamily: 'Oswald', fontSize: 32, textAlign: 'left' }
        },
        // Prop Firm Setup Row
        {
          id: 'tr-kpi-cap',
          type: 'kpi',
          size: '1/4',
          config: { title: 'Starting Capital', valueFormula: '{{starting_capital}}', computation: 'MAX' }
        },
        {
          id: 'tr-kpi-target',
          type: 'kpi',
          size: '1/4',
          config: { title: 'Profit Target ($)', valueFormula: '{{profit_target}}', computation: 'MAX' }
        },
        {
          id: 'tr-kpi-dd',
          type: 'kpi',
          size: '1/4',
          config: { title: 'Max Drawdown ($)', valueFormula: '{{drawdown_limit}}', computation: 'MAX' }
        },
        {
          id: 'tr-kpi-current-pl',
          type: 'kpi',
          size: '1/4',
          config: { title: 'Current Total P/L', valueFormula: '{pl}', computation: 'SUM' }
        },
        // Main Charts
        {
          id: 'tr-chart-equity',
          type: 'chart',
          size: '2/3',
          config: {
            title: 'Account Progression & Target',
            chartType: 'area',
            xAxisKey: '{{date}}',
            yAxisKeys: ['{{balance}}', '{{pl}}'], 
            seriesConfig: { '{{balance}}': 'MAX', '{{pl}}': 'SUM' },
            seriesColors: { '{{balance}}': '#3b82f6', '{{pl}}': '#10b981' },
            seriesType: { '{{balance}}': 'area', '{{pl}}': 'bar' },
            axisConfig: { '{{balance}}': 'left', '{{pl}}': 'right' }, // Separate axes
            showDataLabels: false,
            referenceLines: [
                { label: 'Initial Capital', value: '{{starting_capital}}', color: '#94a3b8' }, // Grey Baseline
                { label: 'Profit Target', value: '{{starting_capital}} + {{profit_target}}', color: '#16a34a' }, // Green Target
                { label: 'Max Loss', value: '{{starting_capital}} - {{drawdown_limit}}', color: '#ef4444' } // Red Drawdown Limit
            ]
          }
        },
        {
          id: 'tr-chart-outcome',
          type: 'chart',
          size: '1/3',
          config: {
            title: 'Win/Loss Distribution',
            chartType: 'pie',
            xAxisKey: '{{outcome}}',
            yAxisKeys: ['{{pl}}'],
            seriesConfig: { '{{pl}}': 'COUNT' },
            seriesColors: {},
            seriesType: {},
            showDataLabels: true
          }
        },
        // Stats Row
        {
          id: 'tr-kpi-count',
          type: 'kpi',
          size: '1/4',
          config: { title: 'Total Trades', valueFormula: '{pl}', computation: 'COUNT' }
        },
        {
          id: 'tr-kpi-avg',
          type: 'kpi',
          size: '1/4',
          config: { title: 'Avg P/L per Trade', valueFormula: '{pl}', computation: 'AVERAGE' }
        },
        {
          id: 'tr-kpi-rr',
          type: 'kpi',
          size: '1/4',
          config: { title: 'Average R:R', valueFormula: '{rr}', computation: 'AVERAGE' }
        },
        {
          id: 'tr-kpi-comm',
          type: 'kpi',
          size: '1/4',
          config: { title: 'Total Commissions', valueFormula: '{commission}', computation: 'SUM' }
        },
        // Analysis Row
        {
          id: 'tr-rank-strat',
          type: 'rank',
          size: '1/3',
          config: { title: 'Top Strategies', categoryField: '{{strategy}}', valueField: '{{pl}}', aggregation: 'SUM', limit: 5, order: 'desc' }
        },
        {
          id: 'tr-rank-symbol',
          type: 'rank',
          size: '1/3',
          config: { title: 'Best Pairs/Symbols', categoryField: '{{symbol}}', valueField: '{{pl}}', aggregation: 'SUM', limit: 5, order: 'desc' }
        },
        {
            id: 'tr-pivot-matrix',
            type: 'pivot',
            size: '1/3',
            config: {
                title: 'Strategy vs Symbol Matrix',
                rowFields: ['{{strategy}}'],
                colFields: ['{{symbol}}'],
                valueField: '{{pl}}',
                aggregation: 'SUM'
            }
        }
      ]
  },
  {
    id: 'hr-workforce',
    name: 'Workforce Analytics',
    description: 'Visualize headcount, salaries, and department distribution.',
    category: 'HR',
    iconName: 'UserIcon',
    requiredFields: [
      { key: 'dept', label: 'Department', dataType: 'string' },
      { key: 'salary', label: 'Annual Salary', dataType: 'number' },
      { key: 'role', label: 'Job Title', dataType: 'string' },
      { key: 'status', label: 'Employment Status', dataType: 'string', optional: true },
    ],
    widgets: [
      {
        id: 'h-title',
        type: 'title',
        size: 'full',
        config: { text: 'HR Analytics Dashboard', fontFamily: 'Open Sans', fontSize: 28, textAlign: 'left' }
      },
      {
        id: 'h-kpi-count',
        type: 'kpi',
        size: '1/4',
        config: { title: 'Total Headcount', valueFormula: '{salary}', computation: 'COUNT' }
      },
      {
        id: 'h-kpi-avg-sal',
        type: 'kpi',
        size: '1/4',
        config: { title: 'Avg Salary', valueFormula: '{salary}', computation: 'AVERAGE' }
      },
      {
        id: 'h-kpi-cost',
        type: 'kpi',
        size: '1/4',
        config: { title: 'Total Payroll Cost', valueFormula: '{salary}', computation: 'SUM' }
      },
      {
        id: 'h-rank-roles',
        type: 'rank',
        size: '1/4',
        config: { title: 'Most Common Roles', categoryField: '{{role}}', valueField: '{{salary}}', aggregation: 'COUNT', limit: 5, order: 'desc' }
      },
      {
        id: 'h-chart-dept',
        type: 'chart',
        size: '1/2',
        config: {
          title: 'Headcount by Department',
          chartType: 'bar',
          xAxisKey: '{{dept}}',
          yAxisKeys: ['{{salary}}'], // Using salary count as proxy for headcount
          seriesConfig: { '{{salary}}': 'COUNT' },
          seriesColors: { '{{salary}}': '#8b5cf6' },
          seriesType: {},
          showDataLabels: true
        }
      },
       {
        id: 'h-chart-cost-dept',
        type: 'chart',
        size: '1/2',
        config: {
          title: 'Salary Cost by Department',
          chartType: 'pie',
          xAxisKey: '{{dept}}',
          yAxisKeys: ['{{salary}}'],
          seriesConfig: { '{{salary}}': 'SUM' },
          seriesColors: {},
          seriesType: {},
          showDataLabels: true
        }
      }
    ]
  },
  {
    id: 'marketing-campaign',
    name: 'Campaign Performance',
    description: 'Track spend, impressions, clicks, and conversions.',
    category: 'Marketing',
    iconName: 'SparklesIcon',
    requiredFields: [
      { key: 'campaign', label: 'Campaign Name', dataType: 'string' },
      { key: 'spend', label: 'Ad Spend', dataType: 'number' },
      { key: 'impressions', label: 'Impressions', dataType: 'number' },
      { key: 'clicks', label: 'Clicks', dataType: 'number' },
    ],
    widgets: [
       {
        id: 'm-title',
        type: 'title',
        size: 'full',
        config: { text: 'Marketing Performance', fontFamily: 'Lato', fontSize: 30, textAlign: 'left' }
      },
      {
        id: 'm-kpi-spend',
        type: 'kpi',
        size: '1/3',
        config: { title: 'Total Spend', valueFormula: '{spend}', computation: 'SUM' }
      },
      {
        id: 'm-kpi-ctr',
        type: 'kpi',
        size: '1/3',
        config: { title: 'Avg CTR (%)', valueFormula: '({clicks} / {impressions}) * 100', computation: 'AVERAGE' }
      },
      {
        id: 'm-kpi-cpc',
        type: 'kpi',
        size: '1/3',
        config: { title: 'Avg CPC', valueFormula: '{spend} / {clicks}', computation: 'AVERAGE' }
      },
      {
        id: 'm-chart-perf',
        type: 'chart',
        size: 'full',
        config: {
          title: 'Campaign Performance Overview',
          chartType: 'bar',
          xAxisKey: '{{campaign}}',
          yAxisKeys: ['{{spend}}', '{{clicks}}'],
          seriesConfig: { '{{spend}}': 'SUM', '{{clicks}}': 'SUM' },
          seriesColors: { '{{spend}}': '#64748b', '{{clicks}}': '#f59e0b' },
          seriesType: { '{{spend}}': 'bar', '{{clicks}}': 'line' },
          showDataLabels: true
        }
      },
      {
        id: 'm-rank-imp',
        type: 'rank',
        size: '1/2',
        config: { title: 'Top Campaigns by Reach', categoryField: '{{campaign}}', valueField: '{{impressions}}', aggregation: 'SUM', limit: 5, order: 'desc' }
      }
    ]
  },
  {
      id: 'project-tracker',
      name: 'Project Tracker',
      description: 'Monitor task status, priority, and team workload.',
      category: 'Project',
      iconName: 'ClipboardIcon',
      requiredFields: [
          { key: 'task', label: 'Task Name', dataType: 'string' },
          { key: 'assignee', label: 'Assignee', dataType: 'string' },
          { key: 'status', label: 'Status', dataType: 'string' },
          { key: 'hours', label: 'Estimated Hours', dataType: 'number' },
      ],
      widgets: [
          {
            id: 'p-title',
            type: 'title',
            size: 'full',
            config: { text: 'Project Status Report', fontFamily: 'Oswald', fontSize: 32, textAlign: 'left' }
          },
          {
            id: 'p-kpi-total',
            type: 'kpi',
            size: '1/3',
            config: { title: 'Total Tasks', valueFormula: '{hours}', computation: 'COUNT' }
          },
           {
            id: 'p-kpi-hours',
            type: 'kpi',
            size: '1/3',
            config: { title: 'Total Est. Hours', valueFormula: '{hours}', computation: 'SUM' }
          },
          {
             id: 'p-chart-status',
             type: 'chart',
             size: '1/3',
             config: {
                 title: 'Tasks by Status',
                 chartType: 'pie',
                 xAxisKey: '{{status}}',
                 yAxisKeys: ['{{hours}}'], // Using hours count as proxy
                 seriesConfig: { '{{hours}}': 'COUNT' },
                 seriesColors: {},
                 seriesType: {},
                 showDataLabels: true
             }
          },
          {
              id: 'p-chart-load',
              type: 'chart',
              size: '2/3',
              config: {
                  title: 'Workload by Assignee (Hours)',
                  chartType: 'bar',
                  xAxisKey: '{{assignee}}',
                  yAxisKeys: ['{{hours}}'],
                  seriesConfig: {'{{hours}}': 'SUM'},
                  seriesColors: {'{{hours}}': '#0ea5e9'},
                  seriesType: {},
                  showDataLabels: true
              }
          },
          {
            id: 'p-pivot-matrix',
            type: 'pivot',
            size: '1/3',
            config: {
              title: 'Status Matrix',
              rowFields: ['{{assignee}}'],
              colFields: ['{{status}}'],
              valueField: '{{hours}}',
              aggregation: 'COUNT'
            }
          }
      ]
  },
  {
    id: 'support-feedback',
    name: 'Customer Feedback Tracker',
    description: 'Monitor customer satisfaction, sentiment, and feedback channels.',
    category: 'Support',
    iconName: 'MailIcon',
    requiredFields: [
      { key: 'date', label: 'Date', dataType: 'date' },
      { key: 'rating', label: 'Rating / Score', dataType: 'number' },
      { key: 'channel', label: 'Channel (Email, Chat)', dataType: 'string' },
      { key: 'category', label: 'Topic / Category', dataType: 'string' },
      { key: 'sentiment', label: 'Sentiment', dataType: 'string', optional: true },
    ],
    widgets: [
      {
        id: 'cf-title',
        type: 'title',
        size: 'full',
        config: { text: 'Customer Feedback Insights', fontFamily: 'Lato', fontSize: 32, textAlign: 'left' }
      },
      {
        id: 'cf-kpi-total',
        type: 'kpi',
        size: '1/3',
        config: { title: 'Total Responses', valueFormula: '{rating}', computation: 'COUNT' }
      },
      {
        id: 'cf-kpi-avg',
        type: 'kpi',
        size: '1/3',
        config: { title: 'Average Rating', valueFormula: '{rating}', computation: 'AVERAGE' }
      },
      {
        id: 'cf-kpi-min',
        type: 'kpi',
        size: '1/3',
        config: { title: 'Lowest Score', valueFormula: '{rating}', computation: 'MIN' }
      },
      {
        id: 'cf-chart-trend',
        type: 'chart',
        size: '2/3',
        config: {
          title: 'Feedback Volume Over Time',
          chartType: 'area',
          xAxisKey: '{{date}}',
          yAxisKeys: ['{{rating}}'],
          seriesConfig: { '{{rating}}': 'COUNT' },
          seriesColors: { '{{rating}}': '#6366f1' },
          seriesType: {},
          showDataLabels: false
        }
      },
      {
        id: 'cf-chart-sentiment',
        type: 'chart',
        size: '1/3',
        config: {
          title: 'Responses by Channel',
          chartType: 'pie',
          xAxisKey: '{{channel}}',
          yAxisKeys: ['{{rating}}'],
          seriesConfig: { '{{rating}}': 'COUNT' },
          seriesColors: {},
          seriesType: {},
          showDataLabels: true
        }
      },
      {
        id: 'cf-chart-dist',
        type: 'chart',
        size: '1/2',
        config: {
           title: 'Avg Rating by Category',
           chartType: 'bar',
           xAxisKey: '{{category}}',
           yAxisKeys: ['{{rating}}'],
           seriesConfig: { '{{rating}}': 'AVERAGE' },
           seriesColors: { '{{rating}}': '#f59e0b' },
           seriesType: {},
           showDataLabels: true
        }
      },
      {
        id: 'cf-rank-topics',
        type: 'rank',
        size: '1/2',
        config: { title: 'Most Frequent Topics', categoryField: '{{category}}', valueField: '{{rating}}', aggregation: 'COUNT', limit: 5, order: 'desc' }
      },
      {
         id: 'cf-pivot-detail',
         type: 'pivot',
         size: 'full',
         config: {
             title: 'Feedback Matrix (Topic vs Channel)',
             rowFields: ['{{category}}'],
             colFields: ['{{channel}}'],
             valueField: '{{rating}}',
             aggregation: 'AVERAGE'
         }
      }
    ]
  }
];

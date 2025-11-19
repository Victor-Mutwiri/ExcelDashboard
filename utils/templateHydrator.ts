
import { AnyWidget, DashboardTemplate, ColumnConfig } from '../types';

/**
 * Replaces placeholders (e.g., {{revenue}}) in the template widgets with actual column IDs/Labels.
 */
export const hydrateTemplate = (
  template: DashboardTemplate,
  mapping: Record<string, string>,
  columnConfig: ColumnConfig[]
): AnyWidget[] => {
  const widgets = JSON.parse(JSON.stringify(template.widgets)) as AnyWidget[];

  // Helper to find column ID if needed for formulas, or use label for charts
  // In SheetSight, chart keys use labels, but formulas use {id}.
  // The mapping provides Key -> Label.
  
  const labelToIdMap = columnConfig.reduce((acc, col) => {
    acc[col.label] = col.id;
    return acc;
  }, {} as Record<string, string>);

  // Helper to replace text in strings
  const replaceText = (text: string): string => {
    if (!text) return text;
    let result = text;
    // Replace {{key}} -> Label
    Object.entries(mapping).forEach(([key, label]) => {
       // Use a global regex replace for chart keys and standard text
       result = result.replace(new RegExp(`{{${key}}}`, 'g'), label);
       
       // SPECIAL HANDLING FOR FORMULAS:
       // Formulas in KPI/Calc columns use single brace {id}.
       // The template might specify {revenue}. We need to map 'revenue' -> Label -> ID -> {ID}.
       // But the user might have defined the template formula as "{revenue} - {expense}".
       // We need to replace "{key}" with "{actual_col_id}".
       
       // Note: Our `kpi` and `calc` widgets in templates.ts use `{key}` syntax for formulas (single brace),
       // but `chart` widgets use `{{key}}` (double brace) for keys.
       // Let's handle single brace replacements for formulas specifically.
       
       if (labelToIdMap[label]) {
           const colId = labelToIdMap[label];
           result = result.replace(new RegExp(`{${key}}`, 'g'), `{${colId}}`);
       }
    });
    return result;
  };

  // Recursive function to traverse and replace
  const traverse = (obj: any) => {
    if (typeof obj === 'string') {
      return replaceText(obj);
    } else if (Array.isArray(obj)) {
      return obj.map(traverse);
    } else if (typeof obj === 'object' && obj !== null) {
      const newObj: any = {};
      Object.keys(obj).forEach(k => {
        // We also need to replace keys if they are dynamic, though mostly keys are static in config
        // But `seriesConfig` keys in charts are column names! e.g. { "{{revenue}}": "SUM" }
        const newKey = replaceText(k);
        newObj[newKey] = traverse(obj[k]);
      });
      return newObj;
    }
    return obj;
  };

  return widgets.map(widget => {
     // Assign new unique IDs to avoid conflicts if re-using templates
     const newWidget = traverse(widget);
     newWidget.id = `${newWidget.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
     return newWidget;
  });
};

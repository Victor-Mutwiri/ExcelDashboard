
import React, { useState, useRef } from 'react';
import { AnyWidget, RowData, ColumnConfig, WidgetSize } from '../types';
import WidgetWrapper from './WidgetWrapper';

interface DashboardCanvasProps {
  widgets: AnyWidget[];
  setWidgets: React.Dispatch<React.SetStateAction<AnyWidget[]>>;
  data: RowData[];
  columnConfig: ColumnConfig[];
  onDeleteWidget: (id: string) => void;
  onUpdateWidgetSize: (id: string, size: WidgetSize) => void;
  onToggleWidgetVisibility: (id: string) => void;
  onEditWidget: (id: string) => void;
  chartColors: string[];
}

const DashboardCanvas: React.FC<DashboardCanvasProps> = ({
  widgets,
  setWidgets,
  data,
  columnConfig,
  onDeleteWidget,
  onUpdateWidgetSize,
  onToggleWidgetVisibility,
  onEditWidget,
  chartColors
}) => {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleDragStart = (id: string) => {
    setDraggedId(id);
  };

  const handleDragEnter = (dropId: string) => {
    if (!draggedId || draggedId === dropId) return;

    const dragIndex = widgets.findIndex(w => w.id === draggedId);
    const dropIndex = widgets.findIndex(w => w.id === dropId);
    if (dragIndex === -1 || dropIndex === -1) return;

    const newWidgets = [...widgets];
    const [draggedItem] = newWidgets.splice(dragIndex, 1);
    newWidgets.splice(dropIndex, 0, draggedItem);
    
    setWidgets(newWidgets);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
  };
  
  const visibleWidgets = widgets.filter(w => !w.isHidden);

  return (
    <div ref={canvasRef} className="grid grid-cols-12 gap-4 md:gap-6 pb-8 md:pb-0">
      {visibleWidgets.map((widget) => (
        <WidgetWrapper
          key={widget.id}
          widget={widget}
          data={data}
          columnConfig={columnConfig}
          onDelete={() => onDeleteWidget(widget.id)}
          onUpdateSize={(size) => onUpdateWidgetSize(widget.id, size)}
          onHide={() => onToggleWidgetVisibility(widget.id)}
          onEdit={() => onEditWidget(widget.id)}
          onDragStart={() => handleDragStart(widget.id)}
          onDragEnter={() => handleDragEnter(widget.id)}
          onDragEnd={handleDragEnd}
          isDragging={draggedId === widget.id}
          chartColors={chartColors}
          gridContainerRef={canvasRef}
        />
      ))}
    </div>
  );
};

export default DashboardCanvas;

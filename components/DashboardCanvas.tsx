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
}

const DashboardCanvas: React.FC<DashboardCanvasProps> = ({
  widgets,
  setWidgets,
  data,
  columnConfig,
  onDeleteWidget,
  onUpdateWidgetSize,
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const dropTargetIndex = useRef<number | null>(null);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragEnter = (index: number) => {
    if (draggedIndex === null || draggedIndex === index) return;
    dropTargetIndex.current = index;

    const newWidgets = [...widgets];
    const draggedItem = newWidgets.splice(draggedIndex, 1)[0];
    newWidgets.splice(index, 0, draggedItem);
    
    setDraggedIndex(index);
    setWidgets(newWidgets);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    dropTargetIndex.current = null;
  };
  
  return (
    <div className="flex flex-wrap -m-3">
      {widgets.map((widget, index) => (
        <WidgetWrapper
          key={widget.id}
          widget={widget}
          data={data}
          columnConfig={columnConfig}
          onDelete={() => onDeleteWidget(widget.id)}
          onUpdateSize={(size) => onUpdateWidgetSize(widget.id, size)}
          index={index}
          onDragStart={handleDragStart}
          onDragEnter={handleDragEnter}
          onDragEnd={handleDragEnd}
          isDragging={draggedIndex === index}
        />
      ))}
    </div>
  );
};

export default DashboardCanvas;

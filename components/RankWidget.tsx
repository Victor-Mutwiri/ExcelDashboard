
import React, { useMemo } from 'react';
import { RankWidget, RowData, Computation } from '../types';
import { MedalIcon } from './Icons';

interface RankWidgetProps {
    widget: RankWidget;
    data: RowData[];
}

const aggregate = (values: number[], type: Computation): number => {
    if (values.length === 0) return 0;
    switch (type) {
        case 'SUM': return values.reduce((a, b) => a + b, 0);
        case 'AVERAGE': return values.reduce((a, b) => a + b, 0) / values.length;
        case 'MIN': return Math.min(...values);
        case 'MAX': return Math.max(...values);
        case 'COUNT': return values.length;
        default: return 0;
    }
};

const RankWidgetComponent: React.FC<RankWidgetProps> = ({ widget, data }) => {
    const { config } = widget;

    const rankedData = useMemo(() => {
        const groups: Record<string, number[]> = {};
        
        // Group Data
        data.forEach(row => {
            const key = String(row[config.categoryField] ?? 'Unknown');
            if (!groups[key]) groups[key] = [];
            
            const val = row[config.valueField];
            if (typeof val === 'number') {
                groups[key].push(val);
            } else if (config.aggregation === 'COUNT') {
                groups[key].push(1);
            }
        });

        // Aggregate and Sort
        const aggregated = Object.entries(groups).map(([key, values]) => ({
            key,
            value: aggregate(values, config.aggregation)
        }));

        aggregated.sort((a, b) => config.order === 'desc' ? b.value - a.value : a.value - b.value);

        return aggregated.slice(0, config.limit);
    }, [data, config]);

    const maxValue = Math.max(...rankedData.map(d => d.value));

    const getRankBadge = (index: number) => {
        if (index === 0) return <MedalIcon className="w-6 h-6 text-yellow-500" />; // Gold
        if (index === 1) return <MedalIcon className="w-6 h-6 text-gray-400" />;   // Silver
        if (index === 2) return <MedalIcon className="w-6 h-6 text-orange-400" />; // Bronze
        return <span className="text-sm font-bold text-[var(--text-tertiary)] w-6 text-center">{index + 1}</span>;
    };

    return (
        <div className="flex flex-col h-full overflow-y-auto pr-2">
            {rankedData.length === 0 ? (
                <div className="flex items-center justify-center h-full text-[var(--text-tertiary)]">
                    No data available.
                </div>
            ) : (
                <div className="space-y-3">
                    {rankedData.map((item, index) => {
                        const percent = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
                        return (
                            <div key={item.key} className="relative flex items-center p-2 rounded-lg bg-[var(--bg-contrast)] overflow-hidden group">
                                {/* Progress Bar Background */}
                                <div 
                                    className="absolute inset-y-0 left-0 bg-[var(--bg-accent)] opacity-10 transition-all duration-500" 
                                    style={{ width: `${percent}%` }}
                                ></div>

                                {/* Content */}
                                <div className="relative z-10 flex items-center w-full gap-3">
                                    <div className="flex-shrink-0 flex items-center justify-center w-8">
                                        {getRankBadge(index)}
                                    </div>
                                    <div className="flex-grow min-w-0">
                                        <p className="font-semibold truncate text-sm">{item.key}</p>
                                    </div>
                                    <div className="flex-shrink-0 text-right">
                                        <p className="font-bold font-mono text-[var(--color-accent)]">
                                            {item.value.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default RankWidgetComponent;

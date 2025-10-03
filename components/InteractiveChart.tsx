import React from 'react';
import { 
    BarChart, Bar, LineChart, Line, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    AreaChart, Area, PieChart, Pie, Cell, Brush
} from 'recharts';
import type { ChartData } from '../types';

interface InteractiveChartProps {
    chartData: ChartData;
}

const DEFAULT_COLORS = ['#00FFFF', '#FF00FF', '#FFAA00', '#82ca9d', '#8884d8', '#ffc658'];

const InteractiveChart: React.FC<InteractiveChartProps> = ({ chartData }) => {
    const { type, data, keys, title, colors = DEFAULT_COLORS, enableZoom, lineStyle, markerShape } = chartData;

    const getStrokeDashArray = () => {
        switch (lineStyle) {
            case 'dashed': return '5 5';
            case 'dotted': return '1 5';
            default: return 'none';
        }
    };

    const renderChart = () => {
        if (!keys) return <p className="text-red-400">Chart 'keys' are not defined.</p>;

        switch (type) {
            case 'bar':
                 if (!keys.xAxis || !keys.yAxis) return <p className="text-red-400">Bar chart requires xAxis and yAxis keys.</p>;
                return (
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
                        <XAxis dataKey={keys.xAxis} stroke="#A0AEC0" tick={{ fontSize: 12 }} />
                        <YAxis stroke="#A0AEC0" tick={{ fontSize: 12 }}/>
                        <Tooltip contentStyle={{ backgroundColor: '#1A202C', border: '1px solid #4A5568' }} cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }} />
                        <Legend />
                        <Bar dataKey={Array.isArray(keys.yAxis) ? keys.yAxis[0] : keys.yAxis} fill={colors[0]} />
                        {enableZoom && <Brush dataKey={keys.xAxis} height={20} stroke="#00FFFF" fill="#1C1C1C" />}
                    </BarChart>
                );
            case 'line':
                if (!keys.xAxis || !keys.yAxis) return <p className="text-red-400">Line chart requires xAxis and yAxis keys.</p>;
                const yAxisKeys = Array.isArray(keys.yAxis) ? keys.yAxis : [keys.yAxis];
                return (
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
                        <XAxis dataKey={keys.xAxis} stroke="#A0AEC0" tick={{ fontSize: 12 }} />
                        <YAxis stroke="#A0AEC0" tick={{ fontSize: 12 }}/>
                        <Tooltip contentStyle={{ backgroundColor: '#1A202C', border: '1px solid #4A5568' }} cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}/>
                        <Legend />
                        {yAxisKeys.map((key, index) => (
                           <Line key={key} type="monotone" dataKey={key} stroke={colors[index % colors.length]} strokeWidth={2} strokeDasharray={getStrokeDashArray()} activeDot={{ r: 8 }} />
                        ))}
                        {enableZoom && <Brush dataKey={keys.xAxis} height={20} stroke="#00FFFF" fill="#1C1C1C" />}
                    </LineChart>
                );
             case 'area':
                if (!keys.xAxis || !keys.yAxis) return <p className="text-red-400">Area chart requires xAxis and yAxis keys.</p>;
                const areaYKeys = Array.isArray(keys.yAxis) ? keys.yAxis : [keys.yAxis];
                return (
                    <AreaChart data={data}>
                        <defs>
                            {areaYKeys.map((key, index) => (
                                <linearGradient key={key} id={`color${index}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={colors[index % colors.length]} stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor={colors[index % colors.length]} stopOpacity={0}/>
                                </linearGradient>
                            ))}
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
                        <XAxis dataKey={keys.xAxis} stroke="#A0AEC0" tick={{ fontSize: 12 }} />
                        <YAxis stroke="#A0AEC0" tick={{ fontSize: 12 }}/>
                        <Tooltip contentStyle={{ backgroundColor: '#1A202C', border: '1px solid #4A5568' }} cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }} />
                        <Legend />
                        {areaYKeys.map((key, index) => (
                            <Area key={key} type="monotone" dataKey={key} stroke={colors[index % colors.length]} fillOpacity={1} fill={`url(#color${index})`} strokeDasharray={getStrokeDashArray()} />
                        ))}
                        {enableZoom && <Brush dataKey={keys.xAxis} height={20} stroke="#00FFFF" fill="#1C1C1C" />}
                    </AreaChart>
                );
            case 'scatter':
                 if (!keys.xAxis || !keys.yAxis) return <p className="text-red-400">Scatter chart requires xAxis and yAxis keys.</p>;
                 return (
                    <ScatterChart>
                        <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
                        <XAxis type="number" dataKey={keys.xAxis} name={keys.xAxis} stroke="#A0AEC0" tick={{ fontSize: 12 }}/>
                        <YAxis type="number" dataKey={Array.isArray(keys.yAxis) ? keys.yAxis[0] : keys.yAxis} name={Array.isArray(keys.yAxis) ? keys.yAxis[0] : keys.yAxis} stroke="#A0AEC0" tick={{ fontSize: 12 }}/>
                        <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#1A202C', border: '1px solid #4A5568' }}/>
                        <Legend />
                        <Scatter name={keys.name || 'Data'} data={data} fill={colors[0]} shape={markerShape || 'circle'}/>
                        {enableZoom && <Brush dataKey={keys.xAxis} height={20} stroke="#00FFFF" fill="#1C1C1C" />}
                    </ScatterChart>
                );
            case 'pie':
                if (!keys.nameKey || !keys.dataKey) return <p className="text-red-400">Pie chart requires nameKey and dataKey.</p>;
                return (
                     <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey={keys.dataKey}
                            nameKey={keys.nameKey}
                             // FIX: Corrected Pie label prop types to match recharts and added type guards.
                             // Recharts passes props that can be string | number | undefined, so we ensure they are numbers
                             // before performing arithmetic operations to prevent runtime errors and satisfy TypeScript.
                             label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }: { cx?: number | string, cy?: number | string, midAngle?: number, innerRadius?: number, outerRadius?: number, percent?: number }) => {
                                if (typeof cx !== 'number' || typeof cy !== 'number' || typeof midAngle !== 'number' || typeof innerRadius !== 'number' || typeof outerRadius !== 'number' || typeof percent !== 'number') {
                                    return null;
                                }
                                const radius = innerRadius + (outerRadius - innerRadius) * 1.1;
                                const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                                const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                                return (
                                    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={12}>
                                        {`${(percent * 100).toFixed(0)}%`}
                                    </text>
                                );
                            }}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                            ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#1A202C', border: '1px solid #4A5568' }} />
                        <Legend />
                    </PieChart>
                );
            default:
                return <p className="text-red-400">Unsupported chart type: {type}</p>;
        }
    };
    
    return (
        <div className="my-4 p-4 bg-gray-800/50 rounded-lg text-gray-200" style={{ width: '100%', height: 350 }}>
            {title && <h3 className="text-center font-orbitron text-cyan-400 mb-4">{title}</h3>}
             <ResponsiveContainer>
                {renderChart()}
             </ResponsiveContainer>
        </div>
    );
};

export default InteractiveChart;
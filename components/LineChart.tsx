'use client';

interface LineChartProps {
  data: { month: string; count: number }[];
  label: string;
}

export function LineChart({ data, label }: LineChartProps) {
  if (data.length === 0) {
    return <div className="text-center text-gray-500 text-sm py-20">No data available</div>;
  }

  // Format month for display
  const formatMonth = (monthKey: string) => {
    const [year, month] = monthKey.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  };

  const maxValue = Math.max(...data.map(d => d.count), 1);
  const width = 800;
  const height = 300;
  const padding = { top: 20, right: 40, bottom: 40, left: 60 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Calculate points for the line
  const points = data.map((d, i) => {
    const x = padding.left + (i / (data.length - 1)) * chartWidth;
    const y = padding.top + chartHeight - (d.count / maxValue) * chartHeight;
    return { x, y, ...d };
  });

  // Create path string for the line
  const linePath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ');

  // Create path for the area under the line
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - padding.bottom} L ${padding.left} ${height - padding.bottom} Z`;

  // Y-axis labels
  const yLabels = [0, 0.25, 0.5, 0.75, 1].map(factor => Math.round(maxValue * factor));

  // X-axis labels (show every nth label to avoid crowding)
  const labelInterval = Math.max(1, Math.floor(data.length / 8));
  const xLabels = data.filter((_, i) => i % labelInterval === 0 || i === data.length - 1);

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto"
        style={{ minWidth: '600px' }}
      >
        {/* Grid lines */}
        {yLabels.map((value, i) => {
          const y = padding.top + chartHeight - (value / maxValue) * chartHeight;
          return (
            <line
              key={i}
              x1={padding.left}
              y1={y}
              x2={width - padding.right}
              y2={y}
              stroke="#333"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
          );
        })}

        {/* Y-axis labels */}
        {yLabels.reverse().map((value, i) => {
          const y = padding.top + (i / (yLabels.length - 1)) * chartHeight;
          return (
            <text
              key={i}
              x={padding.left - 10}
              y={y + 5}
              textAnchor="end"
              fontSize="12"
              fill="#999"
            >
              {value}
            </text>
          );
        })}

        {/* Gradient definition for shadow */}
        <defs>
          <linearGradient id={`gradient-${label}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="white" stopOpacity="0.2" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Gradient shadow under the line */}
        <path
          d={areaPath}
          fill={`url(#gradient-${label})`}
        />

        {/* Line */}
        <path
          d={linePath}
          stroke="white"
          strokeWidth="1"
          fill="none"
        />

        {/* X-axis */}
        <line
          x1={padding.left}
          y1={height - padding.bottom}
          x2={width - padding.right}
          y2={height - padding.bottom}
          stroke="#333"
          strokeWidth="2"
        />

        {/* Y-axis */}
        <line
          x1={padding.left}
          y1={padding.top}
          x2={padding.left}
          y2={height - padding.bottom}
          stroke="#333"
          strokeWidth="2"
        />

        {/* X-axis labels */}
        {xLabels.map((d) => {
          const index = data.indexOf(d);
          const x = padding.left + (index / (data.length - 1)) * chartWidth;
          return (
            <text
              key={d.month}
              x={x}
              y={height - padding.bottom + 20}
              textAnchor="middle"
              fontSize="12"
              fill="#999"
            >
              {formatMonth(d.month)}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

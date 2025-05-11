
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface PieChartData {
  name: string;
  value: number;
}

interface MonthlyPieChartProps {
  title: string;
  data: PieChartData[];
  colors: string[];
}

const MonthlyPieChart = ({ title, data, colors }: MonthlyPieChartProps) => {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={colors[index % colors.length]} 
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MonthlyPieChart;

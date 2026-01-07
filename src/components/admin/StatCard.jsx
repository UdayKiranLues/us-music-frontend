import GlassCard from './GlassCard';

const StatCard = ({ title, value, icon: Icon, trend, color = 'orange' }) => {
  const colorClasses = {
    orange: 'from-accent-orange to-accent-red',
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
  };

  return (
    <GlassCard className="p-6" hover>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-400 text-sm font-medium mb-2">{title}</p>
          <h3 className="text-3xl font-bold text-white mb-1">{value}</h3>
          {trend && (
            <p
              className={`text-sm ${
                trend > 0 ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% from last month
            </p>
          )}
        </div>
        <div
          className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center`}
        >
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </GlassCard>
  );
};

export default StatCard;

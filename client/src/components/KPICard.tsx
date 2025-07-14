interface KPICardProps {
  title: string;
  value: number | string;
  change: string | null;
  icon: string;
  color: string;
  delay?: number;
}

export default function KPICard({ 
  title, 
  value, 
  icon, 
  color
}: KPICardProps) {

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'electric-blue':
        return 'bg-electric-blue/20 text-electric-blue';
      case 'verified-green':
        return 'bg-verified-green/20 text-verified-green';
      case 'purple-500':
        return 'bg-purple-500/20 text-purple-400';
      case 'red-500':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="glass-morphism p-6 rounded-xl hover:scale-105 transition-transform duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getColorClasses(color)}`}>
          <span className="text-xl">{icon}</span>
        </div>
      </div>
      <div className="text-2xl font-bold text-white mb-1">
        {typeof value === 'string' ? value : value.toLocaleString()}
      </div>
      <div className="text-sm text-gray-400">{title}</div>
    </div>
  );
}

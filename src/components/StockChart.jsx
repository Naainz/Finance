import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import Chart from 'chart.js/auto';

const StockChart = () => {
  const [stock, setStock] = useState('');
  const [chartData, setChartData] = useState(null);
  const [timeRange, setTimeRange] = useState('1D');

  const fetchStockData = async () => {
    if (!stock) return;

    const response = await fetch(`/api/fetch.json?stock=${stock}`);
    const data = await response.json();

    if (!data.error) {
      setChartData(data);
    } else {
      console.error(data.error);
    }
  };

  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
    fetchStockData();
  };

  useEffect(() => {
    if (chartData) {
      const ctx = document.getElementById('stockChart').getContext('2d');
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: chartData.dates,
          datasets: [{
            label: 'Stock Prices',
            data: chartData.prices,
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
          }]
        },
        options: {
          scales: {
            x: {
              type: 'time',
              time: {
                unit: timeRange === '1D' ? 'hour' : 
                       timeRange === '1W' ? 'day' : 
                       timeRange === '1M' ? 'week' : 
                       timeRange === '1Y' ? 'month' : 'year'
              }
            }
          }
        }
      });
    }
  }, [chartData, timeRange]);

  return (
    <div class="text-center">
      <h2 class="text-4xl font-bold mb-10">Stock Market Data</h2>
      <input 
        type="text" 
        value={stock} 
        onInput={(e) => setStock(e.target.value)} 
        class="mb-4 p-2 border border-gray-300 rounded"
        placeholder="Enter stock handle or title" 
      />
      <button 
        onClick={fetchStockData} 
        class="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Fetch Data
      </button>

      <div class="mt-8">
        <button onClick={() => handleTimeRangeChange('1D')} class="px-4 py-2">1D</button>
        <button onClick={() => handleTimeRangeChange('1W')} class="px-4 py-2">1W</button>
        <button onClick={() => handleTimeRangeChange('1M')} class="px-4 py-2">1M</button>
        <button onClick={() => handleTimeRangeChange('1Y')} class="px-4 py-2">1Y</button>
        <button onClick={() => handleTimeRangeChange('ALL')} class="px-4 py-2">ALL</button>
      </div>

      {chartData && (
        <div class="mt-8">
          <h3 class="text-2xl font-bold mb-4">Stock: {chartData.stock}</h3>
          <canvas id="stockChart"></canvas>
        </div>
      )}
    </div>
  );
};

export default StockChart;

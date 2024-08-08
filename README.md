# Econ-hub

Econ-hub is a one-stop-shop for stocks and other assistance for financial students. This project provides stock market data and news using Twelve Data and Financial Modeling Prep APIs. It features a charting tool for stock prices and news articles related to specific stocks.

## Features

- Fetch and display stock price data in various time ranges (1D, 1W, 1M, 1Y, ALL)
- View market cap of the stock
- Display company description
- View recent news articles related to a specific stock
- Dark mode support

## Setup Instructions

### Prerequisites

- Node.js (version 14 or later)
- NPM (version 6 or later)

### Installation

1. Clone the repository:

```sh
git clone https://github.com/yourusername/econ-hub.git
cd econ-hub
```

2. Install the dependencies:

```sh
npm install
```

3. Create a `.env` file in the root directory of the project and add the following environment variables:

```sh
TWELVE_DATA_API_KEY=your_twelve_data_api_key
FMP_API_KEY=your_fmp_api_key
FINNHUB_API_KEY=your_finnhub_api_key
```

4. Start the development server:

```sh
npm start
```

The application should now be running at [http://localhost:3000](http://localhost:3000), or another port if astro.js tells you so.

---
## Usage
### Stock Price Data

1. Enter a stock symbol in the input box and click the "Search" button.
2. Select a time range from the list.
3. The stock price data will be displayed in a chart.

### Stock News

1. Click the "View News" button to navigate to the news page for the selected stock.
2. The news page will display recent news articles related to the selected stock.
3. Use the time range buttons to filter news articles by date.
4. Click the "Custom" button to select a custom date range.

### Tech Stack

- Astro.js
- Preact
- Tailwind CSS
- Chart.js
- Twelve Data API
- Financial Modeling Prep API
- FinnHub API

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more information.
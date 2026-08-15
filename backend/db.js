import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, 'data', 'climate.db');
const db = new DatabaseSync(dbPath);

function computeCCI(temp, rain, ndvi, baseTemp, baseRain, baseNdvi) {
  const tempAnomaly = temp - baseTemp;
  const rainVariability = Math.abs(rain - baseRain) / Math.max(baseRain, 1);
  const vegLoss = Math.max(0, baseNdvi - ndvi);

  const tNorm = Math.max(0, Math.min(1, tempAnomaly / 3));
  const rNorm = Math.max(0, Math.min(1, rainVariability / 0.4));
  const vNorm = Math.max(0, Math.min(1, vegLoss / 0.2));

  const cci = (tNorm * 0.4 + rNorm * 0.35 + vNorm * 0.25) * 100;
  return { tempAnomaly, rainVariability, vegLoss, cci };
}

export function initializeDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS locations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      lat REAL NOT NULL,
      lng REAL NOT NULL,
      base_temp REAL NOT NULL,
      base_rain REAL NOT NULL,
      base_ndvi REAL NOT NULL,
      current_temp REAL NOT NULL,
      current_rain REAL NOT NULL,
      current_ndvi REAL NOT NULL,
      current_cci REAL NOT NULL
    );

    CREATE TABLE IF NOT EXISTS regional_series (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      region TEXT NOT NULL,
      year INTEGER NOT NULL,
      temp REAL NOT NULL,
      rain REAL NOT NULL,
      ndvi REAL NOT NULL,
      UNIQUE(region, year)
    );
  `);

  const locationCount = db.prepare('SELECT COUNT(*) AS count FROM locations').get().count;
  if (locationCount === 0) {
    const insertLocation = db.prepare(`
      INSERT INTO locations (name, lat, lng, base_temp, base_rain, base_ndvi, current_temp, current_rain, current_ndvi, current_cci)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const seedLocations = [
      ['New Delhi', 28.61, 77.21, 25.0, 790, 0.42, 27.4, 820, 0.38, 46.2],
      ['Mumbai', 19.08, 72.88, 27.5, 2200, 0.55, 28.9, 2140, 0.49, 51.1],
      ['Bengaluru', 12.97, 77.59, 23.5, 970, 0.58, 25.3, 1010, 0.52, 42.8],
      ['Chennai', 13.08, 80.27, 28.6, 1400, 0.50, 30.1, 1460, 0.44, 57.3],
      ['Kolkata', 22.57, 88.36, 26.8, 1830, 0.60, 28.2, 1750, 0.54, 49.7],
      ['Hyderabad', 17.38, 78.48, 26.0, 810, 0.48, 27.6, 840, 0.42, 44.5],
      ['Jaipur', 26.91, 75.78, 25.6, 650, 0.32, 27.8, 690, 0.28, 54.9],
      ['Ahmedabad', 23.02, 72.57, 27.2, 800, 0.38, 29.0, 760, 0.32, 60.4],
      ['Pune', 18.52, 73.85, 24.8, 720, 0.52, 26.4, 740, 0.46, 47.0],
      ['Lucknow', 26.85, 80.95, 25.3, 1010, 0.50, 27.1, 1040, 0.44, 49.3],
      ['Bhopal', 23.26, 77.41, 25.1, 1150, 0.56, 26.8, 1180, 0.48, 43.6],
      ['Guwahati', 26.14, 91.74, 24.0, 1700, 0.72, 25.5, 1780, 0.66, 39.2],
      ['Thiruvananthapuram', 8.52, 76.94, 27.8, 1830, 0.70, 28.9, 1880, 0.64, 36.1],
      ['Srinagar', 34.08, 74.80, 13.5, 710, 0.45, 14.7, 680, 0.39, 41.8],
      ['Leh', 34.16, 77.58, 5.5, 110, 0.18, 6.9, 95, 0.12, 48.3],
      ['Visakhapatnam', 17.69, 83.21, 27.3, 1100, 0.54, 28.7, 1130, 0.48, 45.8],
      ['Patna', 25.59, 85.13, 26.0, 1100, 0.55, 27.5, 1120, 0.49, 47.5],
      ['Bhubaneswar', 20.30, 85.82, 27.0, 1540, 0.62, 28.3, 1570, 0.56, 44.2],
    ];

    for (const row of seedLocations) {
      insertLocation.run(...row);
    }
  }

  const seriesCount = db.prepare('SELECT COUNT(*) AS count FROM regional_series').get().count;
  if (seriesCount === 0) {
    const insertSeries = db.prepare(`
      INSERT INTO regional_series (region, year, temp, rain, ndvi)
      VALUES (?, ?, ?, ?, ?)
    `);

    const seedSeries = {
      'All India': [
        [2015, 25.0, 1180, 0.52],
        [2016, 25.2, 1160, 0.52],
        [2017, 25.3, 1190, 0.51],
        [2018, 25.4, 1140, 0.51],
        [2019, 25.5, 1210, 0.50],
        [2020, 25.7, 1170, 0.50],
        [2021, 25.9, 1130, 0.49],
        [2022, 26.0, 1200, 0.49],
        [2023, 26.2, 1150, 0.48],
        [2024, 26.4, 1175, 0.48],
      ],
      'Northern India': [
        [2015, 24.5, 780, 0.44], [2016, 24.7, 760, 0.44], [2017, 24.9, 810, 0.43], [2018, 25.0, 740, 0.43],
        [2019, 25.2, 820, 0.42], [2020, 25.4, 770, 0.42], [2021, 25.5, 730, 0.41], [2022, 25.7, 790, 0.41],
        [2023, 25.9, 760, 0.40], [2024, 26.1, 750, 0.40],
      ],
      'Southern India': [
        [2015, 26.5, 1320, 0.60], [2016, 26.6, 1290, 0.60], [2017, 26.8, 1350, 0.59], [2018, 26.9, 1280, 0.59],
        [2019, 27.0, 1370, 0.58], [2020, 27.1, 1310, 0.58], [2021, 27.3, 1260, 0.57], [2022, 27.4, 1330, 0.57],
        [2023, 27.5, 1300, 0.56], [2024, 27.7, 1340, 0.56],
      ],
      'Eastern India': [
        [2015, 25.8, 1500, 0.62], [2016, 25.9, 1470, 0.62], [2017, 26.0, 1520, 0.61], [2018, 26.1, 1450, 0.61],
        [2019, 26.3, 1560, 0.60], [2020, 26.4, 1490, 0.60], [2021, 26.6, 1430, 0.59], [2022, 26.7, 1510, 0.59],
        [2023, 26.8, 1460, 0.58], [2024, 27.0, 1480, 0.58],
      ],
      'Western India': [
        [2015, 26.0, 880, 0.46], [2016, 26.2, 850, 0.46], [2017, 26.3, 910, 0.45], [2018, 26.5, 820, 0.45],
        [2019, 26.6, 930, 0.44], [2020, 26.8, 870, 0.44], [2021, 26.9, 800, 0.43], [2022, 27.1, 890, 0.43],
        [2023, 27.2, 840, 0.42], [2024, 27.4, 860, 0.42],
      ],
      'North-East India': [
        [2015, 22.4, 2300, 0.74], [2016, 22.5, 2260, 0.74], [2017, 22.6, 2350, 0.73], [2018, 22.7, 2240, 0.73],
        [2019, 22.8, 2400, 0.72], [2020, 22.9, 2280, 0.72], [2021, 23.1, 2220, 0.71], [2022, 23.2, 2330, 0.71],
        [2023, 23.3, 2260, 0.70], [2024, 23.5, 2310, 0.70],
      ],
      'Himalayan Belt': [
        [2015, 10.2, 620, 0.40], [2016, 10.4, 600, 0.40], [2017, 10.5, 640, 0.39], [2018, 10.7, 580, 0.39],
        [2019, 10.9, 660, 0.38], [2020, 11.1, 610, 0.38], [2021, 11.2, 570, 0.37], [2022, 11.4, 630, 0.37],
        [2023, 11.6, 590, 0.36], [2024, 11.9, 610, 0.36],
      ],
    };

    for (const [region, values] of Object.entries(seedSeries)) {
      for (const [year, temp, rain, ndvi] of values) {
        insertSeries.run(region, year, temp, rain, ndvi);
      }
    }
  }
}

export function getLocations(year = 2024) {
  const rows = db.prepare('SELECT * FROM locations ORDER BY name').all();
  const ratio = Math.max(0, Math.min(1, (year - 2000) / 24));

  return rows.map((row) => {
    const temp = row.base_temp + (row.current_temp - row.base_temp) * ratio;
    const rain = row.base_rain + (row.current_rain - row.base_rain) * ratio;
    const ndvi = row.base_ndvi + (row.current_ndvi - row.base_ndvi) * ratio;
    const cciData = computeCCI(temp, rain, ndvi, row.base_temp, row.base_rain, row.base_ndvi);

    return {
      id: row.id,
      name: row.name,
      lat: row.lat,
      lng: row.lng,
      temp: Number(temp.toFixed(1)),
      rain: Math.round(rain),
      ndvi: Number(ndvi.toFixed(2)),
      cci: Number(cciData.cci.toFixed(1)),
      tempAnomaly: Number(cciData.tempAnomaly.toFixed(2)),
      rainVariability: Number((cciData.rainVariability * 100).toFixed(1)),
      vegLoss: Number(cciData.vegLoss.toFixed(2)),
    };
  });
}

export function getAnalyticsSeries(region = 'All India') {
  const rows = db.prepare('SELECT year, temp, rain, ndvi FROM regional_series WHERE region = ? ORDER BY year').all(region);

  return {
    region,
    years: rows.map((row) => row.year),
    temp: rows.map((row) => Number(row.temp.toFixed(1))),
    rain: rows.map((row) => Math.round(row.rain)),
    ndvi: rows.map((row) => Number(row.ndvi.toFixed(2))),
  };
}

export function getRegions() {
  const rows = db.prepare('SELECT DISTINCT region FROM regional_series ORDER BY region').all();
  return rows.map((row) => row.region);
}

initializeDatabase();

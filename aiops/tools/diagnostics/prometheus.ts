import axios from 'axios';

export async function queryPrometheus(query: string, endpoint: string = 'http://localhost:9090') {
  try {
    const res = await axios.get(`${endpoint}/api/v1/query`, { params: { query } });
    return res.data;
  } catch (error) {
    return { error: 'Failed to query Prometheus' };
  }
}

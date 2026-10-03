import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '20s', target: 30 },
    { duration: '1m', target: 100 },
    { duration: '20s', target: 0 },
  ],
};

const BASE_URL = __ENV.API_GATEWAY_URL || 'http://localhost:8000';

export default function () {
  const payload = JSON.stringify({
    customerId: 'cust-101',
    items: [{ productId: 'prod-1', quantity: 1, unitPrice: 29.99 }]
  });
  const params = { headers: { 'Content-Type': 'application/json' } };
  const res = http.post(`${BASE_URL}/api/v1/orders`, payload, params);
  check(res, { 'order accepted': (r) => r.status === 200 || r.status === 201 });
  sleep(1);
}

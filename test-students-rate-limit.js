/**
 * Simple script to verify /api/students list rate limiting.
 */
const fetch = require('node-fetch');

async function run() {
  const base = process.env.BASE_URL || 'http://localhost:3000';
  const userId = process.env.TEST_USER_ID || 'staff01';
  const url = `${base}/api/students?search=&role=students+educators&page=1&limit=5`;
  let success = 0;
  let rateLimited = 0;
  for (let i = 0; i < 130; i++) {
    const res = await fetch(url, { headers: { 'x-user-id': userId } });
    if (res.status === 429) rateLimited++;
    else if (res.ok) success++;
  }
  console.log(JSON.stringify({ endpoint: '/api/students', success, rateLimited }));
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});



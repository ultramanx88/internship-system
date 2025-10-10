// Test validation pattern
const PREFIX_PATTERN = /^[A-Za-z0-9ก-๙_-]+$/;
const SUFFIX_PATTERN = /^[A-Za-z0-9ก-๙/_-]*$/;

console.log('PREFIX PATTERN:', PREFIX_PATTERN);
console.log('Test มทร:', PREFIX_PATTERN.test('มทร'));
console.log('Test DOC:', PREFIX_PATTERN.test('DOC'));
console.log('Test มทร-001:', PREFIX_PATTERN.test('มทร-001'));

console.log('\nSUFFIX PATTERN:', SUFFIX_PATTERN);
console.log('Test /2568:', SUFFIX_PATTERN.test('/2568'));
console.log('Test /2025:', SUFFIX_PATTERN.test('/2025'));
console.log('Test /2568-มทร:', SUFFIX_PATTERN.test('/2568-มทร'));

// Test document settings validation
const VALIDATION_RULES = {
  PREFIX: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 10,
    PATTERN: /^[A-Za-z0-9ก-๙_-]+$/
  },
  SUFFIX: {
    MAX_LENGTH: 20,
    PATTERN: /^[A-Za-z0-9ก-๙/_-]*$/
  }
};

const ERROR_MESSAGES = {
  INVALID_PREFIX: 'คำนำหน้าต้องเป็นตัวอักษร ตัวเลข หรือ _ - เท่านั้น (รองรับทั้งภาษาไทยและอังกฤษ)',
  INVALID_SUFFIX: 'คำต่อท้ายต้องเป็นตัวอักษร ตัวเลข หรือ / _ - เท่านั้น (รองรับทั้งภาษาไทยและอังกฤษ)'
};

function validateTemplate(template) {
  const errors = [];
  
  // Validate prefix
  if (!template.prefix || template.prefix.trim() === '') {
    errors.push('ต้องระบุคำนำหน้า');
  } else if (template.prefix.length < VALIDATION_RULES.PREFIX.MIN_LENGTH) {
    errors.push(`คำนำหน้าต้องมีอย่างน้อย ${VALIDATION_RULES.PREFIX.MIN_LENGTH} ตัวอักษร`);
  } else if (template.prefix.length > VALIDATION_RULES.PREFIX.MAX_LENGTH) {
    errors.push(`คำนำหน้าต้องไม่เกิน ${VALIDATION_RULES.PREFIX.MAX_LENGTH} ตัวอักษร`);
  } else if (!VALIDATION_RULES.PREFIX.PATTERN.test(template.prefix)) {
    errors.push(ERROR_MESSAGES.INVALID_PREFIX);
  }
  
  // Validate suffix
  if (template.suffix && template.suffix.length > VALIDATION_RULES.SUFFIX.MAX_LENGTH) {
    errors.push(`คำต่อท้ายต้องไม่เกิน ${VALIDATION_RULES.SUFFIX.MAX_LENGTH} ตัวอักษร`);
  } else if (template.suffix && !VALIDATION_RULES.SUFFIX.PATTERN.test(template.suffix)) {
    errors.push(ERROR_MESSAGES.INVALID_SUFFIX);
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

// Test cases
const testCases = [
  { prefix: 'มทร', suffix: '/2568' },
  { prefix: 'DOC', suffix: '/2025' },
  { prefix: 'มทร-001', suffix: '/2568-มทร' },
  { prefix: 'ABC123', suffix: '-TH' },
  { prefix: 'มทร@#$', suffix: '/2568' }, // Should fail
  { prefix: 'มทร', suffix: '/2568@#$' }  // Should fail
];

console.log('Testing Document Settings Validation:');
console.log('=====================================');

testCases.forEach((testCase, index) => {
  console.log(`\nTest ${index + 1}:`, testCase);
  const result = validateTemplate(testCase);
  console.log('Valid:', result.valid);
  if (!result.valid) {
    console.log('Errors:', result.errors);
  }
});

import {
  sanitizeString,
  sanitizeHtml,
  sanitizeSql,
  isValidEmail,
  isValidPhone,
  isValidThaiId,
  sanitizeUserInput,
  RateLimiter,
  generateCsrfToken,
  validateCsrfToken,
} from '../security';

describe('Security Utilities', () => {
  describe('sanitizeString', () => {
    it('should remove dangerous characters', () => {
      expect(sanitizeString('<script>alert("xss")</script>')).toBe('scriptalert("xss")/script');
      expect(sanitizeString('javascript:alert("xss")')).toBe('alert("xss")');
      expect(sanitizeString('onclick="alert(1)"')).toBe('alert(1)');
    });

    it('should handle empty and null inputs', () => {
      expect(sanitizeString('')).toBe('');
      expect(sanitizeString(null as any)).toBe('');
      expect(sanitizeString(undefined as any)).toBe('');
    });

    it('should trim whitespace', () => {
      expect(sanitizeString('  test  ')).toBe('test');
    });
  });

  describe('sanitizeHtml', () => {
    it('should remove script tags', () => {
      const input = '<div>Hello</div><script>alert("xss")</script><p>World</p>';
      const result = sanitizeHtml(input);
      expect(result).toBe('<div>Hello</div><p>World</p>');
    });

    it('should remove iframe tags', () => {
      const input = '<div>Hello</div><iframe src="malicious.com"></iframe><p>World</p>';
      const result = sanitizeHtml(input);
      expect(result).toBe('<div>Hello</div><p>World</p>');
    });

    it('should remove object and embed tags', () => {
      const input = '<div>Hello</div><object data="malicious.swf"></object><embed src="malicious.swf"></embed><p>World</p>';
      const result = sanitizeHtml(input);
      expect(result).toBe('<div>Hello</div><p>World</p>');
    });
  });

  describe('sanitizeSql', () => {
    it('should remove SQL injection patterns', () => {
      expect(sanitizeSql("'; DROP TABLE users; --")).toBe('DROP TABLE users');
      expect(sanitizeSql("' OR '1'='1")).toBe('OR 1=1');
      expect(sanitizeSql("UNION SELECT * FROM users")).toBe('');
    });

    it('should remove quotes and semicolons', () => {
      expect(sanitizeSql('test"string\'value')).toBe('teststringvalue');
      expect(sanitizeSql('test;value')).toBe('testvalue');
    });
  });

  describe('isValidEmail', () => {
    it('should validate correct email formats', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
      expect(isValidEmail('test+tag@example.org')).toBe(true);
    });

    it('should reject invalid email formats', () => {
      expect(isValidEmail('invalid-email')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });
  });

  describe('isValidPhone', () => {
    it('should validate Thai phone numbers', () => {
      expect(isValidPhone('0812345678')).toBe(true);
      expect(isValidPhone('+66812345678')).toBe(true);
      expect(isValidPhone('02-123-4567')).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      expect(isValidPhone('123')).toBe(false);
      expect(isValidPhone('+1234567890')).toBe(false);
      expect(isValidPhone('08123456789')).toBe(false);
    });
  });

  describe('isValidThaiId', () => {
    it('should validate correct Thai ID format', () => {
      // This is a valid Thai ID for testing
      expect(isValidThaiId('1234567890123')).toBe(true);
    });

    it('should reject invalid Thai ID format', () => {
      expect(isValidThaiId('123456789012')).toBe(false); // Too short
      expect(isValidThaiId('12345678901234')).toBe(false); // Too long
      expect(isValidThaiId('123456789012a')).toBe(false); // Contains letter
    });
  });

  describe('sanitizeUserInput', () => {
    it('should sanitize string input', () => {
      const result = sanitizeUserInput('<script>alert("xss")</script>');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Potentially malicious content detected');
    });

    it('should sanitize object input', () => {
      const input = {
        name: 'John',
        email: '<script>alert("xss")</script>',
        age: 25,
      };
      
      const result = sanitizeUserInput(input);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Potentially malicious content detected');
    });

    it('should handle valid input', () => {
      const input = {
        name: 'John Doe',
        email: 'john@example.com',
        age: 25,
      };
      
      const result = sanitizeUserInput(input);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('RateLimiter', () => {
    let rateLimiter: RateLimiter;

    beforeEach(() => {
      rateLimiter = new RateLimiter(2, 1000); // 2 requests per second
    });

    it('should allow requests within limit', () => {
      expect(rateLimiter.isAllowed('user1')).toBe(true);
      expect(rateLimiter.isAllowed('user1')).toBe(true);
    });

    it('should block requests over limit', () => {
      rateLimiter.isAllowed('user1');
      rateLimiter.isAllowed('user1');
      expect(rateLimiter.isAllowed('user1')).toBe(false);
    });

    it('should track different users separately', () => {
      rateLimiter.isAllowed('user1');
      rateLimiter.isAllowed('user1');
      expect(rateLimiter.isAllowed('user2')).toBe(true);
    });

    it('should return remaining requests count', () => {
      expect(rateLimiter.getRemainingRequests('user1')).toBe(2);
      rateLimiter.isAllowed('user1');
      expect(rateLimiter.getRemainingRequests('user1')).toBe(1);
    });
  });

  describe('CSRF Token', () => {
    it('should generate valid CSRF token', () => {
      const token = generateCsrfToken();
      expect(token).toHaveLength(64);
      expect(/^[0-9a-f]+$/.test(token)).toBe(true);
    });

    it('should validate correct CSRF token', () => {
      const token = generateCsrfToken();
      expect(validateCsrfToken(token, token)).toBe(true);
    });

    it('should reject incorrect CSRF token', () => {
      const token1 = generateCsrfToken();
      const token2 = generateCsrfToken();
      expect(validateCsrfToken(token1, token2)).toBe(false);
    });

    it('should reject invalid token format', () => {
      expect(validateCsrfToken('invalid', 'invalid')).toBe(false);
      expect(validateCsrfToken('short', 'short')).toBe(false);
    });
  });
});

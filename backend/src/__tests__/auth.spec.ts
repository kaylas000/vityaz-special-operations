import { describe, it, expect, beforeEach } from '@jest/globals';
import { AuthService } from '../modules/auth/auth.service';

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
  });

  describe('validateTONAddress', () => {
    it('should validate valid TON address', () => {
      const valid = authService.validateTONAddress(
        'EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c'
      );
      expect(valid).toBe(true);
    });

    it('should reject invalid TON address', () => {
      const valid = authService.validateTONAddress('invalid');
      expect(valid).toBe(false);
    });
  });

  describe('generateAuthToken', () => {
    it('should generate valid JWT token', () => {
      const token = authService.generateToken({
        userId: 'user123',
        tonAddress: 'EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c',
      });
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
    });

    it('should generate different tokens for different users', () => {
      const token1 = authService.generateToken({
        userId: 'user1',
        tonAddress: 'EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c',
      });
      const token2 = authService.generateToken({
        userId: 'user2',
        tonAddress: 'EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c',
      });
      expect(token1).not.toBe(token2);
    });
  });
});

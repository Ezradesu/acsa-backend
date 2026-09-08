import { validateEnvironment } from './env.validation';

describe('validateEnvironment', () => {
  it('membolehkan konfigurasi development yang belum lengkap', () => {
    expect(validateEnvironment({ NODE_ENV: 'development' })).toEqual({
      NODE_ENV: 'development',
    });
  });

  it('menolak konfigurasi production yang belum lengkap', () => {
    expect(() => validateEnvironment({ NODE_ENV: 'production' })).toThrow(
      'Konfigurasi production belum lengkap',
    );
  });
});

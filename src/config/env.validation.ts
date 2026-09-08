const productionRequiredVariables = [
  'DATABASE_URL',
  'JWT_SECRET',
  'SUPABASE_URL',
  'SUPABASE_SERVICE_KEY',
  'SUPABASE_STORAGE_BUCKET',
  'FRONTEND_URL',
  'CORS_ALLOWED_ORIGINS',
  'SMTP_HOST',
  'SMTP_USER',
  'SMTP_PASS',
  'SMTP_FROM',
  'MIDTRANS_SERVER_KEY',
  'MIDTRANS_CLIENT_KEY',
  'REDIS_URL',
  'ELASTICSEARCH_NODE',
] as const;

export function validateEnvironment(
  values: Record<string, unknown>,
): Record<string, unknown> {
  if (values.NODE_ENV !== 'production') return values;

  const missing = productionRequiredVariables.filter((key) => {
    const value = values[key];
    return typeof value !== 'string' || value.trim() === '';
  });

  if (missing.length > 0) {
    throw new Error(
      `Konfigurasi production belum lengkap: ${missing.join(', ')}`,
    );
  }

  return values;
}

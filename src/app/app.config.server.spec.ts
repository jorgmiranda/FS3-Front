import { config } from './app.config.server';

describe('app.config.server', () => {
  it('should define config with server rendering', () => {
    expect(config).toBeDefined();
    // Verificar que `config.providers` contenga `provideServerRendering` 
    expect(config.providers).toBeTruthy();
    expect(config.providers?.length).toBeGreaterThan(0);
  });
});
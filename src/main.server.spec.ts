describe('main.server.ts', () => {
  it('should execute main.server without error', async () => {
    // Importa y ejecuta main.server
    const mod = await import('./main.server');
    expect(true).toBeTrue();
  });
});
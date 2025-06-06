describe('Basic Tests', () => {
  it('should pass a simple test', () => {
    expect(1 + 1).toBe(2)
  })

  it('should handle string operations', () => {
    expect('Apply4Me').toContain('Apply')
  })

  it('should work with arrays', () => {
    const institutions = ['UCT', 'Wits', 'Stellenbosch']
    expect(institutions).toHaveLength(3)
    expect(institutions).toContain('UCT')
  })

  it('should handle async operations', async () => {
    const promise = Promise.resolve('success')
    await expect(promise).resolves.toBe('success')
  })
})

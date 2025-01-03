const { describe, it, expect } = require('@xufa/testing');
const { Fifo } = require('../../lib');

function getFifo() {
  const fifo = new Fifo({ capacity: 4 });
  fifo.put({ id: 'a' });
  fifo.put({ id: 'b' });
  fifo.put({ id: 'c' });
  fifo.put({ id: 'd' });
  fifo.put({ id: 'e' });
  return fifo;
}

describe('Fifo', () => {
  describe('clear', () => {
    it('Should clear whole cache', () => {
      const fifo = getFifo();
      expect(fifo.size).toEqual(4);
      fifo.clear();
      expect(fifo.size).toEqual(0);
    });
  });
  describe('evict', () => {
    it('should evict one element', () => {
      const fifo = getFifo();
      expect(fifo.first.id).toEqual('b');
      expect(fifo.last.id).toEqual('e');
      expect(fifo.size).toEqual(4);
      fifo.evict();
      expect(fifo.first.id).toEqual('c');
      expect(fifo.size).toEqual(3);
    });
    it('Should not crash when evicting from empty cache', () => {
      const fifo = new Fifo();
      expect(fifo.size).toEqual(0);
      fifo.evict();
      expect(fifo.size).toEqual(0);
    });
  });
});

//   describe('get', () => {
//     it('deletes expired entries', async () => {
//       cache = new FifoMap(4, 500)
//       populateCache(cache)
//       await setTimeout(300)
//       cache.set(items[2], items[2])
//       const item1Pre = cache.get(items[1])
//       const item2Pre = cache.get(items[2])

//       await setTimeout(300)

//       const item1Post = cache.get(items[1])
//       const item2Post = cache.get(items[2])

//       expect(item1Pre).toBe(false)
//       expect(item1Post).toBeUndefined()
//       expect(item2Pre).toBe(items[2])
//       expect(item2Post).toBe(items[2])
//     })
//   })

//   describe('getMany', () => {
//     it('deletes expired entries', async () => {
//       cache = new FifoMap(4, 500)
//       populateCache(cache)
//       await setTimeout(300)
//       cache.set(items[2], items[2])
//       const itemsPre = cache.getMany([items[1], items[2]])

//       await setTimeout(300)

//       const itemsPost = cache.getMany([items[1], items[2]])

//       expect(itemsPre[0]).toBe(false)
//       expect(itemsPost[0]).toBeUndefined()
//       expect(itemsPre[1]).toBe(items[2])
//       expect(itemsPost[1]).toBe(items[2])
//     })
//   })

//   describe('set', () => {
//     it('Does not set expiration time on resetting entry when ttl is 0', () => {
//       cache = new FifoMap(1000, 0)

//       cache.set(items[0], false)
//       cache.set(items[0], items[0])

//       expect(cache.expiresAt(items[0])).toBe(0)
//     })
//   })

//   describe('delete', () => {
//     it('It should delete', () => {
//       assert.strictEqual(cache.first.key, 'b', "Should be 'b'")
//       assert.strictEqual(cache.last.key, 'e', "Should be 'e'")
//       assert.strictEqual(cache.size, 4, "Should be '4'")
//       assert.strictEqual(cache.items.get('e').next, null, "Should be 'null'")
//       assert.strictEqual(cache.items.get('e').prev.key, 'd', "Should be 'd'")
//       assert.strictEqual(cache.items.get('d').next.key, 'e', "Should be 'e'")
//       assert.strictEqual(cache.items.get('d').prev.key, 'c', "Should be 'c'")
//       assert.strictEqual(cache.items.get('c').next.key, 'd', "Should be 'd'")
//       assert.strictEqual(cache.items.get('c').prev.key, 'b', "Should be 'b'")
//       assert.strictEqual(cache.items.get('b').next.key, 'c', "Should be 'c'")
//       assert.strictEqual(cache.items.get('b').prev, null, "Should be 'null'")
//       cache.delete('c')
//       assert.strictEqual(cache.first.key, 'b', "Should be 'b'")
//       assert.strictEqual(cache.last.key, 'e', "Should be 'e'")
//       assert.strictEqual(cache.size, 3, "Should be '3'")
//       assert.strictEqual(cache.items.get('e').next, null, "Should be 'null'")
//       assert.strictEqual(cache.items.get('e').prev.key, 'd', "Should be 'd'")
//       assert.strictEqual(cache.items.get('d').next.key, 'e', "Should be 'e'")
//       assert.strictEqual(cache.items.get('d').prev.key, 'b', "Should be 'b'")
//       assert.strictEqual(cache.items.get('b').next.key, 'd', "Should be 'd'")
//       assert.strictEqual(cache.items.get('b').prev, null, "Should be 'null'")
//       cache.delete('e')
//       assert.strictEqual(cache.first.key, 'b', "Should be 'b'")
//       assert.strictEqual(cache.last.key, 'd', "Should be 'd'")
//       assert.strictEqual(cache.size, 2, "Should be '2'")
//       cache.get('b')
//       assert.strictEqual(cache.first.key, 'b', "Should be 'b'")
//       assert.strictEqual(cache.first.prev, null, "Should be 'null'")
//       assert.strictEqual(cache.first.next.key, 'd', "Should be 'd'")
//       assert.strictEqual(cache.last.key, 'd', "Should be 'd'")
//       assert.strictEqual(cache.last.prev.key, 'b', "Should be 'b'")
//       assert.strictEqual(cache.last.next, null, "Should be 'null'")
//       assert.strictEqual(cache.size, 2, "Should be '2'")
//     })

//     it('Adjusts first item after it is deleted', () => {
//       expect(cache.first.key).toBe('b')
//       expect(cache.last.key).toBe('e')
//       expect(cache.size).toBe(4)

//       cache.delete(cache.first.key)

//       expect(cache.first.key).toBe('c')
//       expect(cache.last.key).toBe('e')
//       expect(cache.size).toBe(3)
//     })
//   })

//   describe('deleteMany', () => {
//     it('It should delete', () => {
//       assert.strictEqual(cache.first.key, 'b', "Should be 'b'")
//       assert.strictEqual(cache.last.key, 'e', "Should be 'e'")
//       assert.strictEqual(cache.size, 4, "Should be '4'")
//       assert.strictEqual(cache.items.get('e').next, null, "Should be 'null'")
//       assert.strictEqual(cache.items.get('e').prev.key, 'd', "Should be 'd'")
//       assert.strictEqual(cache.items.get('d').next.key, 'e', "Should be 'e'")
//       assert.strictEqual(cache.items.get('d').prev.key, 'c', "Should be 'c'")
//       assert.strictEqual(cache.items.get('c').next.key, 'd', "Should be 'd'")
//       assert.strictEqual(cache.items.get('c').prev.key, 'b', "Should be 'b'")
//       assert.strictEqual(cache.items.get('b').next.key, 'c', "Should be 'c'")
//       assert.strictEqual(cache.items.get('b').prev, null, "Should be 'null'")
//       cache.deleteMany(['c', 'e'])
//       assert.strictEqual(cache.first.key, 'b', "Should be 'b'")
//       assert.strictEqual(cache.size, 2, "Should be '2'")
//       assert.strictEqual(cache.items.get('d').next, null, "Should be 'null'")
//       assert.strictEqual(cache.items.get('d').prev.key, 'b', "Should be 'b'")
//       assert.strictEqual(cache.items.get('b').next.key, 'd', "Should be 'd'")
//       assert.strictEqual(cache.items.get('b').prev, null, "Should be 'null'")
//       assert.strictEqual(cache.first.key, 'b', "Should be 'b'")
//       assert.strictEqual(cache.last.key, 'd', "Should be 'd'")
//       assert.strictEqual(cache.size, 2, "Should be '2'")
//       cache.get('b')
//       assert.strictEqual(cache.first.key, 'b', "Should be 'b'")
//       assert.strictEqual(cache.first.prev, null, "Should be 'null'")
//       assert.strictEqual(cache.first.next.key, 'd', "Should be 'd'")
//       assert.strictEqual(cache.last.key, 'd', "Should be 'd'")
//       assert.strictEqual(cache.last.prev.key, 'b', "Should be 'b'")
//       assert.strictEqual(cache.last.next, null, "Should be 'null'")
//       assert.strictEqual(cache.size, 2, "Should be '2'")
//     })

//     it('Adjusts first item after it is deleted', () => {
//       expect(cache.first.key).toBe('b')
//       expect(cache.last.key).toBe('e')
//       expect(cache.size).toBe(4)

//       cache.deleteMany([cache.first.key, cache.first.next.key])

//       expect(cache.first.key).toBe('d')
//       expect(cache.last.key).toBe('e')
//       expect(cache.size).toBe(2)
//     })
//   })

//   describe('core', () => {
//     it('It should handle a small evict', () => {
//       assert.strictEqual(cache.first.key, 'b', "Should be 'b'")
//       assert.strictEqual(cache.last.key, 'e', "Should be 'e'")
//       assert.strictEqual(cache.size, 4, "Should be '4'")
//       assert.strictEqual(cache.items.get('e').next, null, "Should be 'null'")
//       assert.strictEqual(cache.items.get('e').prev.key, 'd', "Should be 'd'")
//       assert.strictEqual(cache.items.get('d').next.key, 'e', "Should be 'e'")
//       assert.strictEqual(cache.items.get('d').prev.key, 'c', "Should be 'c'")
//       assert.strictEqual(cache.items.get('c').next.key, 'd', "Should be 'd'")
//       assert.strictEqual(cache.items.get('c').prev.key, 'b', "Should be 'b'")
//       assert.strictEqual(cache.items.get('b').next.key, 'c', "Should be 'c'")
//       assert.strictEqual(cache.items.get('b').prev, null, "Should be 'null'")
//       cache.delete('c')
//       assert.strictEqual(cache.first.key, 'b', "Should be 'b'")
//       assert.strictEqual(cache.last.key, 'e', "Should be 'e'")
//       assert.strictEqual(cache.size, 3, "Should be '3'")
//       assert.strictEqual(cache.items.get('e').next, null, "Should be 'null'")
//       assert.strictEqual(cache.items.get('e').prev.key, 'd', "Should be 'd'")
//       assert.strictEqual(cache.items.get('d').next.key, 'e', "Should be 'e'")
//       assert.strictEqual(cache.items.get('d').prev.key, 'b', "Should be 'b'")
//       assert.strictEqual(cache.items.get('b').next.key, 'd', "Should be 'd'")
//       assert.strictEqual(cache.items.get('b').prev, null, "Should be 'null'")
//       cache.delete('e')
//       assert.strictEqual(cache.first.key, 'b', "Should be 'b'")
//       assert.strictEqual(cache.last.key, 'd', "Should be 'd'")
//       assert.strictEqual(cache.size, 2, "Should be '2'")
//       cache.get('b')
//       assert.strictEqual(cache.first.key, 'b', "Should be 'b'")
//       assert.strictEqual(cache.first.prev, null, "Should be 'null'")
//       assert.strictEqual(cache.first.next.key, 'd', "Should be 'd'")
//       assert.strictEqual(cache.last.key, 'd', "Should be 'd'")
//       assert.strictEqual(cache.last.prev.key, 'b', "Should be 'b'")
//       assert.strictEqual(cache.last.next, null, "Should be 'null'")
//       assert.strictEqual(cache.size, 2, "Should be '2'")
//     })

//     it('It should handle an empty evict', () => {
//       cache = new FifoMap(1)
//       assert.strictEqual(cache.first, null, "Should be 'null'")
//       assert.strictEqual(cache.last, null, "Should be 'null'")
//       assert.strictEqual(cache.size, 0, "Should be 'null'")
//       cache.evict()
//       assert.strictEqual(cache.first, null, "Should be 'null'")
//       assert.strictEqual(cache.last, null, "Should be 'null'")
//       assert.strictEqual(cache.size, 0, "Should be 'null'")
//     })

//     it('It should expose expiration time', () => {
//       cache = new FifoMap(1, 6e4)
//       cache.set(items[0], false)
//       assert.strictEqual(typeof cache.expiresAt(items[0]), 'number', 'Should be a number')
//       assert.strictEqual(cache.expiresAt('invalid'), undefined, 'Should be undefined')
//     })

//     it('It should reset the TTL after resetting value', async () => {
//       cache = new FifoMap(1, 100)
//       cache.set(items[0], false)
//       const n1 = cache.expiresAt(items[0])
//       assert.strictEqual(typeof n1, 'number', 'Should be a number')
//       assert.strictEqual(n1 > 0, true, 'Should be greater than zero')
//       await setTimeout(50)

//       cache.set(items[0], false)
//       const n2 = cache.expiresAt(items[0])
//       assert.strictEqual(typeof n2, 'number', 'Should be a number')
//       assert.strictEqual(n2 > 0, true, 'Should be greater than zero')
//       assert.strictEqual(n2 > n1, true, 'Should be greater than first expiration timestamp')
//     })
//   })
// })

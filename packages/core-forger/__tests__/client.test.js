'use strict'

const app = require('./__support__/setup')
const block = require('./__fixtures__/block')
const nock = require('nock')

jest.setTimeout(30000)

const host = `http://127.0.0.1:${process.env.ARK_P2P_PORT || 4000}`

let Client
let client

beforeAll(async () => {
  await app.setUp()
  nock.disableNetConnect()
})

afterAll(async () => {
  await app.tearDown()
  nock.enableNetConnect()
})

beforeEach(() => {
  Client = require('../lib/client')
  client = new Client(host)

  nock(host).get('/peer/status').reply(200)
})

afterEach(() => {
  nock.cleanAll()
})

describe('Client', () => {
  it('should be an object', () => {
    expect(client).toBeObject()
  })

  describe('constructor', () => {
    it('accepts 1 or more hosts as parameter', () => {
      expect(new Client(host).hosts).toEqual([host])

      const hosts = [host, 'http://localhost:4000']

      expect(new Client(hosts).hosts).toEqual(hosts)
    })
  })

  describe('broadcast', () => {
    it('should be a function', () => {
      expect(client.broadcast).toBeFunction()
    })

    describe('when the host is available', () => {
      it('should be truthy if broadcasts', async () => {
        nock(host).post('/internal/blocks', body => body.block.id === block.data.id).reply(200)

        await client.__chooseHost()

        const wasBroadcasted = await client.broadcast(block.toRawJson())
        expect(wasBroadcasted).toBeTruthy()
      })
    })
  })

  describe('getRound', () => {
    it('should be a function', () => {
      expect(client.getRound).toBeFunction()
    })

    describe('when the host is available', () => {
      it('should be ok', async () => {
        const expectedResponse = {'foo': 'bar'}
        nock(host).get('/internal/rounds/current').reply(200, {data: expectedResponse})

        const response = await client.getRound()

        expect(response).toEqual(expectedResponse)
      })
    })
  })

  describe('getTransactions', () => {
    it('should be a function', () => {
      expect(client.getTransactions).toBeFunction()
    })

    describe('when the host is available', () => {
      it('should be ok', async () => {
        const expectedResponse = {'foo': 'bar'}
        nock(host).get('/internal/transactions/forging').reply(200, {data: expectedResponse})

        await client.__chooseHost()
        const response = await client.getTransactions()

        expect(response).toEqual(expectedResponse)
      })
    })
  })

  describe('getNetworkState', () => {
    it('should be a function', () => {
      expect(client.getNetworkState).toBeFunction()
    })

    describe('when the host is available', () => {
      it('should be ok', async () => {
        const expectedResponse = {'foo': 'bar'}
        nock(host).get('/internal/network/state').reply(200, {data: expectedResponse})

        await client.__chooseHost()
        const response = await client.getNetworkState()

        expect(response).toEqual(expectedResponse)
      })
    })
  })

  describe('syncCheck', () => {
    it('should be a function', () => {
      expect(client.syncCheck).toBeFunction()
    })

    it('should induce network sync', async () => {
      const action = nock(host).get('/internal/blockchain/sync').reply(200)

      await client.syncCheck()

      expect(action.done())
    })
  })

  describe('getUsernames', () => {
    it('should be a function', () => {
      expect(client.getUsernames).toBeFunction()
    })

    it('should fetch usernames', async () => {
      const expectedResponse = {'foo': 'bar'}
      nock(host).get('/internal/utils/usernames').reply(200, {data: expectedResponse})

      const response = await client.getUsernames()

      expect(response).toEqual(expectedResponse)
    })
  })

  describe('emitEvent', () => {
    it('should be a function', () => {
      expect(client.emitEvent).toBeFunction()
    })
    it('should emit events', async () => {
      const action = nock(host).post('/internal/utils/events', body => body.event === 'foo' && body.data === 'bar').reply(200)

      await client.__chooseHost()
      await client.emitEvent('foo', 'bar')

      expect(action.done())
    })
  })
})

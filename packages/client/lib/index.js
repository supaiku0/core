const shuffle = require('lodash.shuffle')
const HttpClient = require('./http')
const resources = require('./resources')
const initialPeers = require('./peers')
const sortPeers = require('./utils/sort-peers')

module.exports = class ApiClient {
  /**
   * Finds all the available peers, sorted by block heigh and delay
   *
   * @param {String} network - Network name
   * @param {Number} version - API version
   */
  static async findPeers (network, version) {
    if (!initialPeers.hasOwnProperty(network)) {
      throw new Error(`Network "${network}" is not supported`)
    }

    const networkPeers = initialPeers[network]
    let peers = null

    // Shuffle the peers to avoid connecting always to the first ones
    shuffle(networkPeers)

    // Connect to each peer to get an updated list of peers until a success response
    for (let i = 0; i < networkPeers.length; i++) {
      const peer = networkPeers[i]

      const client = new ApiClient(peer.ip, version)
      const response = await client.resource('peers').all()
      const { data } = response.data

      if (data.success && data.peers) {
        peers = data.peers
        break
      }
    }

    // Return at least the initial (hardcoded) peers
    if (!peers) {
      return networkPeers
    }

    return sortPeers(peers.filter(peer => {
      // Ignore local and unavailable peers
      return peer.ip !== '127.0.0.1' && peer.status === 'OK'
    }))
  }

  /**
   * Connects to a random peer of the network
   *
   * @param {String} network - Network name
   * @param {Number} version - API version
   */
  static async connect (network, version) {
    const peers = await ApiClient.findPeers(network, version)
    return new ApiClient(peers[0].ip, version)
  }

  /**
   * @constructor
   * @param {String} host
   * @param {Number} version - API version
   */
  constructor (host, version) {
    this.setConnection(host)
    this.setVersion(version || 1)
  }

  /**
   * Create a HTTP connection to the API.
   * @param {String} host
   */
  setConnection (host) {
    this.http = new HttpClient(host, this.version)
  }

  /**
   * Get the HTTP connection to the API.
   * @return {Object}
   */
  getConnection () {
    return this.http
  }

  /**
   * Set the API Version.
   * @param {Number} version
   */
  setVersion (version) {
    if (!version) {
      throw new Error('A valid API version is required')
    }

    this.version = version
    this.http.setVersion(version)

    return this
  }

  /**
   * Create an instance of a version specific resource.
   * @param  {String}   name
   * @return {Resource}
   */
  resource (name) {
    return new resources[`v${this.version}`][name](this.http)
  }
}

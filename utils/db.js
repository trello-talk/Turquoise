const rdb = require("rethinkdb")
const { EventEmitter } = require("eventemitter3")

module.exports = class Database extends EventEmitter {
  async connect({host = 'localhost', port, user, password, database}) {
    let err, conn = await rdb.connect({host, port, user, password})
    if(err) return this.onError(err)
    console.log('[DB]', 'Connected')
    if(database) conn.use(database)
    conn.on('close', this.onClose.bind(this));
    conn.on('timeout', this.onTimeout.bind(this));
    this.conn = conn
    this.host = host
    this.port = port
    this.user = user
    this.password = password
    this.database = database
  }

  get r() {
    return rdb
  }

  getProfile(id) {
    return rdb.table('profiles').get(id).run(this.conn)
  }

  getTicket(ticket) {
    return rdb.table('tickets').get(ticket).run(this.conn)
  }

  addTicket(ticket, profile, token, user) {
    return rdb.table('tickets').insert({
      id: ticket, profile, expire: Date.now() + (86400000*3), token, user: user.id, username: user.username + "#" + user.discriminator
    }).run(this.conn)
  }

  addToken(id, trelloToken, trelloID) {
    return rdb.table('users').insert({ 
      current: null,
      id,
      trelloID,
      trelloToken
  }).run(this.conn);
  }

  async getAllProfiles() {
    const cursor = await rdb.table('profiles').run(this.conn)
    const data = await cursor.toArray()
    await cursor.close()
    return data
  }

  async reconnect() {
    this.conn = await this.conn.reconnect({noreplyWait: false})
    conn.on('close', this.onClose.bind(this));
    conn.on('timeout', this.onTimeout.bind(this));
  }

  onError(err) {
    console.log('[DB]', 'Error', err)
    this.emit('error', err)
  }

  async onClose() {
    console.log('[DB]', 'Closed')
    this.emit('close')
    await this.reconnect()
  }

  async onTimeout() {
    console.log('[DB]', 'Connection Timeout')
    this.emit('timeout')
    await this.reconnect()
  }
}

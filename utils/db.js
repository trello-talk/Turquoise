/*
 This file is part of Turquoise.
 Copyright (c) Snazzah 2016-2019
 Copyright (c) Yamboy1 (and contributors) 2019 - 2020

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

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

  getUser(id) {
    return rdb.table('users').get(id).default(null).run(this.conn);
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

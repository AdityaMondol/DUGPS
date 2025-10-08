import database from '../config/nativeDatabase.js'

class User {
  constructor(userData) {
    this.id = userData.id
    this.first_name = userData.first_name || userData.firstName
    this.last_name = userData.last_name || userData.lastName
    this.email = userData.email
    this.password = userData.password
    this.role = userData.role
    this.created_at = userData.created_at
    this.updated_at = userData.updated_at
  }

  static async findOne(query) {
    const record = await database.findOne('users', query)
    return record ? new User(record) : null
  }

  static async findById(id) {
    const record = await database.findById('users', id)
    return record ? new User(record) : null
  }

  static async find(query = {}) {
    const records = await database.find('users', query)
    return records.map(record => new User(record))
  }

  async save() {
    if (this.id) {
      // Update existing user
      const updated = await database.updateById('users', this.id, {
        first_name: this.first_name,
        last_name: this.last_name,
        email: this.email,
        password: this.password,
        role: this.role
      })
      return updated
    } else {
      // Create new user
      const userData = {
        first_name: this.first_name,
        last_name: this.last_name,
        email: this.email,
        password: this.password,
        role: this.role
      }
      const created = await database.insert('users', userData)
      this.id = created.id
      this.created_at = created.created_at
      this.updated_at = created.updated_at
      return created
    }
  }

  static async findByIdAndDelete(id) {
    const user = await User.findById(id)
    if (user) {
      await database.deleteById('users', id)
      return user
    }
    return null
  }

  toJSON() {
    return {
      id: this.id,
      _id: this.id, // For compatibility with existing frontend code
      first_name: this.first_name,
      last_name: this.last_name,
      email: this.email,
      role: this.role,
      created_at: this.created_at,
      updated_at: this.updated_at
    }
  }

  // Remove password from JSON output
  select(fields) {
    const result = this.toJSON()
    if (fields === '-password') {
      delete result.password
    }
    return result
  }
}

export default User
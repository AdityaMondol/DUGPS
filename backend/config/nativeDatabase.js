import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

class NativeDatabase {
  constructor() {
    this.dbPath = path.join(__dirname, '..', 'database')
    this.tables = {
      users: 'users.json',
      notices: 'notices.json',
      media: 'media.json',
      feedbacks: 'feedbacks.json'
    }
    this.isConnected = false
    this.init()
  }

  async init() {
    try {
      // Create database directory if it doesn't exist
      await fs.mkdir(this.dbPath, { recursive: true })
      
      // Initialize table files if they don't exist
      for (const [table, filename] of Object.entries(this.tables)) {
        const filePath = path.join(this.dbPath, filename)
        try {
          await fs.access(filePath)
        } catch (error) {
          // File doesn't exist, create it with empty array
          await fs.writeFile(filePath, JSON.stringify([], null, 2))
          console.log(`📄 Created table: ${table}`)
        }
      }
      
      this.isConnected = true
      console.log('✅ Native file database initialized successfully')
      console.log('📁 Database path:', this.dbPath)
      return true
    } catch (error) {
      console.error('❌ Database initialization error:', error.message)
      this.isConnected = false
      return false
    }
  }

  async readTable(tableName) {
    try {
      const filePath = path.join(this.dbPath, this.tables[tableName])
      const data = await fs.readFile(filePath, 'utf8')
      return JSON.parse(data)
    } catch (error) {
      console.error(`Error reading table ${tableName}:`, error.message)
      return []
    }
  }

  async writeTable(tableName, data) {
    try {
      const filePath = path.join(this.dbPath, this.tables[tableName])
      await fs.writeFile(filePath, JSON.stringify(data, null, 2))
      return true
    } catch (error) {
      console.error(`Error writing table ${tableName}:`, error.message)
      return false
    }
  }

  // Generic CRUD operations
  async insert(tableName, record) {
    try {
      const data = await this.readTable(tableName)
      
      // Generate ID if not provided
      if (!record.id) {
        record.id = this.generateId()
      }
      
      // Add timestamps
      record.created_at = new Date().toISOString()
      record.updated_at = new Date().toISOString()
      
      data.push(record)
      await this.writeTable(tableName, data)
      console.log(`💾 Inserted record in ${tableName}: ${record.id}`)
      return record
    } catch (error) {
      console.error(`❌ Insert failed in ${tableName}:`, error.message)
      throw new Error(`Insert failed: ${error.message}`)
    }
  }

  async findOne(tableName, query) {
    try {
      const data = await this.readTable(tableName)
      return data.find(record => this.matchQuery(record, query)) || null
    } catch (error) {
      throw new Error(`FindOne failed: ${error.message}`)
    }
  }

  async find(tableName, query = {}) {
    try {
      const data = await this.readTable(tableName)
      if (Object.keys(query).length === 0) {
        return data
      }
      return data.filter(record => this.matchQuery(record, query))
    } catch (error) {
      throw new Error(`Find failed: ${error.message}`)
    }
  }

  async findById(tableName, id) {
    return this.findOne(tableName, { id })
  }

  async update(tableName, query, updateData) {
    try {
      const data = await this.readTable(tableName)
      let updated = false
      
      const updatedData = data.map(record => {
        if (this.matchQuery(record, query)) {
          updated = true
          return {
            ...record,
            ...updateData,
            updated_at: new Date().toISOString()
          }
        }
        return record
      })
      
      if (updated) {
        await this.writeTable(tableName, updatedData)
        return true
      }
      return false
    } catch (error) {
      throw new Error(`Update failed: ${error.message}`)
    }
  }

  async updateById(tableName, id, updateData) {
    return this.update(tableName, { id }, updateData)
  }

  async delete(tableName, query) {
    try {
      const data = await this.readTable(tableName)
      const originalLength = data.length
      const filteredData = data.filter(record => !this.matchQuery(record, query))
      
      if (filteredData.length !== data.length) {
        await this.writeTable(tableName, filteredData)
        const deletedCount = originalLength - filteredData.length
        console.log(`🗑️ Deleted ${deletedCount} record(s) from ${tableName}`)
        return true
      }
      return false
    } catch (error) {
      console.error(`❌ Delete failed in ${tableName}:`, error.message)
      throw new Error(`Delete failed: ${error.message}`)
    }
  }

  async deleteById(tableName, id) {
    return this.delete(tableName, { id })
  }

  // Helper methods
  matchQuery(record, query) {
    return Object.entries(query).every(([key, value]) => {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        // Handle special operators like { $regex: ... }
        return this.handleSpecialOperators(record[key], value)
      }
      return record[key] === value
    })
  }

  handleSpecialOperators(fieldValue, operators) {
    for (const [operator, operatorValue] of Object.entries(operators)) {
      switch (operator) {
        case '$regex':
          return new RegExp(operatorValue, 'i').test(fieldValue)
        case '$in':
          return operatorValue.includes(fieldValue)
        case '$ne':
          return fieldValue !== operatorValue
        case '$gt':
          return fieldValue > operatorValue
        case '$lt':
          return fieldValue < operatorValue
        default:
          return false
      }
    }
    return false
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  async testConnection() {
    try {
      if (!this.isConnected) {
        await this.init()
      }
      
      // Test by reading a table
      await this.readTable('users')
      return { success: true, message: 'Native database connection test passed' }
    } catch (error) {
      return { success: false, message: error.message }
    }
  }

  isAvailable() {
    return this.isConnected
  }

  async getStats() {
    try {
      const stats = {}
      for (const [tableName] of Object.entries(this.tables)) {
        const data = await this.readTable(tableName)
        stats[tableName] = data.length
      }
      return stats
    } catch (error) {
      return { error: error.message }
    }
  }
}

// Create singleton instance
const database = new NativeDatabase()

export default database
export const isDatabaseAvailable = () => database.isAvailable()
export const connectDB = () => database.init()
export const testDB = () => database.testConnection()
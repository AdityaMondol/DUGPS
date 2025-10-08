import database from '../config/nativeDatabase.js'

class Notice {
  constructor(noticeData) {
    this.id = noticeData.id
    this.title = noticeData.title
    this.content = noticeData.content
    this.category = noticeData.category
    this.priority = noticeData.priority
    this.tags = noticeData.tags || []
    this.expiry_date = noticeData.expiry_date
    this.author_id = noticeData.author_id
    this.author_name = noticeData.author_name
    this.created_at = noticeData.created_at
    this.updated_at = noticeData.updated_at
  }

  static async find(query = {}) {
    const records = await database.find('notices', query)
    return records.map(record => new Notice(record))
  }

  static async findById(id) {
    const record = await database.findById('notices', id)
    return record ? new Notice(record) : null
  }

  async save() {
    if (this.id) {
      // Update existing notice
      const updated = await database.updateById('notices', this.id, {
        title: this.title,
        content: this.content,
        category: this.category,
        priority: this.priority,
        tags: this.tags,
        expiry_date: this.expiry_date,
        author_id: this.author_id,
        author_name: this.author_name
      })
      return updated
    } else {
      // Create new notice
      const noticeData = {
        title: this.title,
        content: this.content,
        category: this.category,
        priority: this.priority,
        tags: this.tags,
        expiry_date: this.expiry_date,
        author_id: this.author_id,
        author_name: this.author_name
      }
      const created = await database.insert('notices', noticeData)
      this.id = created.id
      this.created_at = created.created_at
      this.updated_at = created.updated_at
      return created
    }
  }

  static async findByIdAndDelete(id) {
    const notice = await Notice.findById(id)
    if (notice) {
      await database.deleteById('notices', id)
      return notice
    }
    return null
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      content: this.content,
      category: this.category,
      priority: this.priority,
      tags: this.tags,
      expiry_date: this.expiry_date,
      author_id: this.author_id,
      author_name: this.author_name,
      created_at: this.created_at,
      updated_at: this.updated_at
    }
  }
}

export default Notice
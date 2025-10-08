import database from '../config/nativeDatabase.js'

class Media {
  constructor(mediaData) {
    this.id = mediaData.id
    this.title = mediaData.title
    this.description = mediaData.description
    this.category = mediaData.category
    this.tags = mediaData.tags || []
    this.file_name = mediaData.file_name
    this.file_path = mediaData.file_path
    this.file_size = mediaData.file_size
    this.mime_type = mediaData.mime_type
    this.author_id = mediaData.author_id
    this.author_name = mediaData.author_name
    this.created_at = mediaData.created_at
    this.updated_at = mediaData.updated_at
  }

  static async find(query = {}) {
    const records = await database.find('media', query)
    return records.map(record => new Media(record))
  }

  static async findById(id) {
    const record = await database.findById('media', id)
    return record ? new Media(record) : null
  }

  async save() {
    if (this.id) {
      // Update existing media
      const updated = await database.updateById('media', this.id, {
        title: this.title,
        description: this.description,
        category: this.category,
        tags: this.tags,
        file_name: this.file_name,
        file_path: this.file_path,
        file_size: this.file_size,
        mime_type: this.mime_type,
        author_id: this.author_id,
        author_name: this.author_name
      })
      return updated
    } else {
      // Create new media
      const mediaData = {
        title: this.title,
        description: this.description,
        category: this.category,
        tags: this.tags,
        file_name: this.file_name,
        file_path: this.file_path,
        file_size: this.file_size,
        mime_type: this.mime_type,
        author_id: this.author_id,
        author_name: this.author_name
      }
      const created = await database.insert('media', mediaData)
      this.id = created.id
      this.created_at = created.created_at
      this.updated_at = created.updated_at
      return created
    }
  }

  static async findByIdAndDelete(id) {
    const media = await Media.findById(id)
    if (media) {
      await database.deleteById('media', id)
      return media
    }
    return null
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      category: this.category,
      tags: this.tags,
      file_name: this.file_name,
      file_path: this.file_path,
      file_size: this.file_size,
      mime_type: this.mime_type,
      author_id: this.author_id,
      author_name: this.author_name,
      created_at: this.created_at,
      updated_at: this.updated_at
    }
  }
}

export default Media
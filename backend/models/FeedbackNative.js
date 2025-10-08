import database from '../config/nativeDatabase.js'

class Feedback {
  constructor(feedbackData) {
    this.id = feedbackData.id
    this.content = feedbackData.content
    this.user_id = feedbackData.user_id
    this.author_name = feedbackData.author_name
    this.created_at = feedbackData.created_at
    this.updated_at = feedbackData.updated_at
  }

  static async find(query = {}) {
    const records = await database.find('feedbacks', query)
    return records.map(record => new Feedback(record))
  }

  static async findById(id) {
    const record = await database.findById('feedbacks', id)
    return record ? new Feedback(record) : null
  }

  async save() {
    if (this.id) {
      // Update existing feedback
      const updated = await database.updateById('feedbacks', this.id, {
        content: this.content,
        user_id: this.user_id,
        author_name: this.author_name
      })
      return updated
    } else {
      // Create new feedback
      const feedbackData = {
        content: this.content,
        user_id: this.user_id,
        author_name: this.author_name
      }
      const created = await database.insert('feedbacks', feedbackData)
      this.id = created.id
      this.created_at = created.created_at
      this.updated_at = created.updated_at
      return created
    }
  }

  static async findByIdAndDelete(id) {
    const feedback = await Feedback.findById(id)
    if (feedback) {
      await database.deleteById('feedbacks', id)
      return feedback
    }
    return null
  }

  static async deleteByUserAndId(userId, id) {
    const feedback = await Feedback.findById(id)
    if (feedback && feedback.user_id === userId) {
      await database.deleteById('feedbacks', id)
      return feedback
    }
    return null
  }

  toJSON() {
    return {
      id: this.id,
      content: this.content,
      user_id: this.user_id,
      author_name: this.author_name,
      created_at: this.created_at,
      updated_at: this.updated_at
    }
  }
}

export default Feedback
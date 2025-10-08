import Notice from '../models/NoticeNative.js'
import User from '../models/UserNative.js'

// Migration script to update existing notices with author names
async function updateNoticeAuthors() {
  try {
    console.log('🔄 Starting notice author name migration...')
    
    // Get all notices
    const notices = await Notice.find({})
    console.log(`📋 Found ${notices.length} notices to process`)
    
    for (const notice of notices) {
      if (!notice.author_name || notice.author_name.trim() === '') {
        console.log(`🔧 Updating notice: "${notice.title}" (ID: ${notice.id})`)
        
        // Get the user who created this notice
        const user = await User.findById(notice.author_id)
        if (user) {
          const authorName = `${user.first_name} ${user.last_name}`.trim()
          console.log(`👤 Setting author name to: ${authorName}`)
          
          // Update the notice
          notice.author_name = authorName
          await notice.save()
          console.log(`✅ Updated notice "${notice.title}"`)
        } else {
          console.log(`❌ User not found for notice "${notice.title}" (author_id: ${notice.author_id})`)
        }
      } else {
        console.log(`⏭️ Notice "${notice.title}" already has author name: ${notice.author_name}`)
      }
    }
    
    console.log('🎉 Migration completed successfully!')
  } catch (error) {
    console.error('💥 Migration failed:', error)
  }
}

// Run the migration
updateNoticeAuthors()
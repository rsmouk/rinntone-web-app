import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting seed...')

  // Create ad placements
  const placements = [
    { name: 'Header', slug: 'header' },
    { name: 'Footer', slug: 'footer' },
    { name: 'In-Content', slug: 'in-content' },
    { name: 'Download Page', slug: 'download-page' },
    { name: 'Sidebar', slug: 'sidebar' }
  ]

  for (const placement of placements) {
    await prisma.adPlacement.upsert({
      where: { slug: placement.slug },
      update: {},
      create: placement
    })
  }
  console.log('Ad placements created')

  // Create default categories
  const categories = [
    { name: 'Pop', slug: 'pop', icon: '🎵', description: 'Popular music ringtones' },
    { name: 'Rock', slug: 'rock', icon: '🎸', description: 'Rock music ringtones' },
    { name: 'Classical', slug: 'classical', icon: '🎻', description: 'Classical music ringtones' },
    { name: 'Electronic', slug: 'electronic', icon: '🎧', description: 'Electronic & EDM ringtones' },
    { name: 'Sound Effects', slug: 'sound-effects', icon: '🔊', description: 'Fun sound effect ringtones' },
    { name: 'Notification', slug: 'notification', icon: '🔔', description: 'Short notification sounds' },
    { name: 'Alarm', slug: 'alarm', icon: '⏰', description: 'Alarm tones' },
    { name: 'Nature', slug: 'nature', icon: '🌿', description: 'Nature and ambient sounds' }
  ]

  for (const [index, category] of categories.entries()) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: { ...category, order: index }
    })
  }
  console.log('Categories created')

  // Create default tags
  const tags = [
    'trending', 'new', 'popular', 'iphone', 'android', 
    'funny', 'calm', 'loud', 'short', 'remix',
    'movie', 'game', 'meme', 'classic', 'modern'
  ]

  for (const tagName of tags) {
    await prisma.tag.upsert({
      where: { slug: tagName },
      update: {},
      create: { name: tagName.charAt(0).toUpperCase() + tagName.slice(1), slug: tagName }
    })
  }
  console.log('Tags created')

  // Create admin user
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@ringtone.com'
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'
  const hashedPassword = await hash(adminPassword, 12)

  await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash: hashedPassword,
      name: 'Administrator'
    }
  })
  console.log(`Admin user created: ${adminEmail}`)

  // Create default site settings
  const settings = [
    { key: 'site_name', value: 'RingtonePro' },
    { key: 'site_description', value: 'Download free ringtones for your phone' },
    { key: 'download_timer', value: '5' },
    { key: 'items_per_page', value: '20' },
    { key: 'enable_ads', value: 'true' }
  ]

  for (const setting of settings) {
    await prisma.siteSetting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting
    })
  }
  console.log('Site settings created')

  console.log('Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

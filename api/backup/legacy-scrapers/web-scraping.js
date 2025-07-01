import puppeteer from 'puppeteer'
import * as cheerio from 'cheerio'

// Helper function to extract news items
function extractNewsItems($, newsArray, source, filterGold = false) {
  let newsSelector = 'article'
  let articles = $(newsSelector)

  if (articles.length === 0) {
    newsSelector = '.articleItem'
    articles = $(newsSelector)
  }

  if (articles.length === 0) {
    newsSelector = '[data-test="article"]'
    articles = $(newsSelector)
  }

  if (articles.length === 0) {
    newsSelector = '.js-article-item'
    articles = $(newsSelector)
  }

  if (articles.length === 0) {
    newsSelector = 'div[class*="article"]'
    articles = $(newsSelector)
  }

  console.log(`Found ${articles.length} articles in ${source}`)

  articles.each((i, el) => {
    if (newsArray.length >= 20) return // Limit total articles to avoid spam

    const $el = $(el)

    // Try multiple title selectors
    let title = $el.find('[data-test="article-title-link"]').text().trim()
    if (!title) {
      title = $el.find('a').first().text().trim()
    }
    if (!title) {
      title = $el.find('h3').text().trim()
    }
    if (!title) {
      title = $el.find('h2').text().trim()
    }
    if (!title) {
      title = $el.find('[class*="title"]').text().trim()
    }
    if (!title) {
      title = $el.find('[class*="headline"]').text().trim()
    }

    // Filter for gold-related content if requested
    if (filterGold && title) {
      const goldKeywords = ['gold', 'precious metal', 'bullion', 'xau', 'auusd']
      const hasGoldKeyword = goldKeywords.some((keyword) => title.toLowerCase().includes(keyword))
      if (!hasGoldKeyword) {
        return // Skip non-gold articles
      }
    }

    // Extract description for more context - try to get as much content as possible
    let description = $el.find('[data-test="article-description"]').text().trim()
    if (!description) {
      description = $el.find('p').first().text().trim()
    }
    if (!description) {
      description = $el.find('.articleSummary').text().trim()
    }
    if (!description) {
      description = $el.find('[class*="summary"]').text().trim()
    }
    if (!description) {
      description = $el.find('[class*="description"]').text().trim()
    }
    if (!description) {
      description = $el.find('[class*="excerpt"]').text().trim()
    }
    if (!description) {
      description = $el.find('[class*="content"]').text().trim()
    }
    
    // If still no description, try to extract from the full article text
    if (!description) {
      const allText = $el.text().trim()
      const lines = allText.split('\n').map(line => line.trim()).filter(line => line.length > 30)
      
      // Look for lines that seem like article content (not metadata)
      for (let i = 1; i < lines.length && i < 5; i++) {
        const line = lines[i]
        if (line && !line.includes('ago') && !line.includes('By ') && !line.includes('•')) {
          description = line
          break
        }
      }
    }
    
    // Try to get more content if description seems incomplete (ends with ...)
    if (description && description.endsWith('...')) {
      const moreContent = $el.find('[class*="text"]').text().trim()
      if (moreContent && moreContent.length > description.length) {
        description = moreContent
      }
    }

    let time = $el.find('time').attr('datetime') || $el.find('time').text().trim()
    if (!time) {
      time = $el.find('[class*="date"]').text().trim()
    }
    if (!time) {
      time = $el.find('[class*="time"]').text().trim()
    }

    // Extract author/source
    let author = $el.find('[data-test="news-provider-name"]').text().trim()
    if (!author) {
      author = $el.find('[class*="source"]').text().trim()
    }
    const newsSource = author || source

    let link = $el.find('a').first().attr('href')
    if (link && !link.startsWith('http')) {
      link = 'https://www.investing.com' + link
    }

    if (title && title.length > 5) {
      // Check if we already have this article (avoid duplicates)
      const isDuplicate = newsArray.some((existing) => existing.title === title)
      if (!isDuplicate) {
        newsArray.push({
          title,
          description: description || '',
          time: time || 'Recent',
          source: newsSource,
          link,
          category: source
        })
      }
    }
  })
}

async function scrape() {
  const browser = await puppeteer.launch({ headless: true })
  const page = await browser.newPage()
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' + 'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0 Safari/537.36')

  let price = ''
  let change = ''
  const newsItems = []

  try {
    // 1. Load gold futures page for price
    console.log('Loading gold price page...')
    await page.goto('https://www.investing.com/commodities/gold', { waitUntil: 'networkidle2' })
    await new Promise((resolve) => setTimeout(resolve, 3000)) // Wait for dynamic content to load

    const htmlPrice = await page.content()
    const $p = cheerio.load(htmlPrice)

    // 4. Extract current price - try multiple selectors
    price = $p('[data-test="instrument-price-last"]').first().text().trim()
    if (!price) {
      price = $p('.text-2xl').first().text().trim()
    }
    if (!price) {
      price = $p('[class*="price"]').first().text().trim()
    }

    change = $p('[data-test="instrument-price-change"]').first().text().trim()
    if (!change) {
      change = $p('[class*="change"]').first().text().trim()
    }

    console.log('Price found:', price)
    console.log('Change found:', change)

    // 2. Load gold-specific news pages
    console.log('Loading gold news pages...')

    // First try gold-specific news
    await page.goto('https://www.investing.com/commodities/gold-news', { waitUntil: 'networkidle2' })
    await new Promise((resolve) => setTimeout(resolve, 3000))

    let htmlNews = await page.content()
    let $n = cheerio.load(htmlNews)

    // Extract gold news
    extractNewsItems($n, newsItems, 'Gold News')

    // Also try general commodities news for gold-related articles
    console.log('Loading commodities news for additional gold content...')
    await page.goto('https://www.investing.com/news/commodities-news', { waitUntil: 'networkidle2' })
    await new Promise((resolve) => setTimeout(resolve, 2000))

    htmlNews = await page.content()
    $n = cheerio.load(htmlNews)

    // Extract commodities news that mentions gold
    extractNewsItems($n, newsItems, 'Commodities News', true)

    console.log(`Total parsed ${newsItems.length} news items`)

    console.log(`Parsed ${newsItems.length} news items`)
  } catch (error) {
    console.error('Error during scraping:', error.message)
  } finally {
    await browser.close()
  }

  // 5. Enhanced Output
  console.log('\n💰 Gold Futures Price:', price || 'N/A', change || '')
  console.log('\n📰 Latest Gold-Related News:')
  if (newsItems.length === 0) {
    console.log('No news items found')
  } else {
    // Sort by relevance - gold-specific news first, then by time
    const sortedNews = newsItems.sort((a, b) => {
      // Prioritize articles with gold in title
      const aHasGold = a.title.toLowerCase().includes('gold')
      const bHasGold = b.title.toLowerCase().includes('gold')

      if (aHasGold && !bHasGold) return -1
      if (!aHasGold && bHasGold) return 1

      // Then sort by time (newer first)
      return new Date(b.time) - new Date(a.time)
    })

    sortedNews.slice(0, 8).forEach((n, idx) => {
      console.log(`\n${idx + 1}. 📈 ${n.title}`)
      console.log(`   ⏰ ${n.time} | 📰 ${n.source}`)
      if (n.description && n.description.length > 0) {
        // Clean up the description by removing redundant metadata
        let cleanDescription = n.description
          .replace(/By[A-Za-z\s.]+•\d+\s+(minutes?|hours?|days?)\s+ago/g, '') // Remove "By Author • X minutes ago"
          .replace(/By[A-Za-z\s.]+$/g, '') // Remove trailing "By Author"
          .replace(/\s+/g, ' ') // Replace multiple spaces with single space
          .replace(/\.{3,}/g, '...') // Replace multiple dots with ellipsis
          .trim()
        
        console.log(`   📝 ${cleanDescription}`)
      } else {
        console.log(`   📝 No description available`)
      }
      if (n.link) console.log(`   🔗 ${n.link}`)
    })
  }
}

scrape().catch(console.error)

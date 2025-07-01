import React from 'react'

const KeyEventsCard = ({ eventsData, loading }) => {
  if (loading) {
    return (
      <div className='glass-card p-4 sm:p-6 rounded-xl h-full'>
        <h2 className='text-lg sm:text-xl font-semibold text-gray-200 mb-4'>📅 Key Events</h2>
        <div className='flex items-center justify-center py-8'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400'></div>
          <span className='ml-3 text-gray-300'>Loading events...</span>s
        </div>
      </div>
    )
  }

  if (!eventsData || eventsData.length === 0) {
    return (
      <div className='glass-card p-4 sm:p-6 rounded-xl h-full'>
        <h2 className='text-lg sm:text-xl font-semibold text-gray-200 mb-4'>📅 Key Events</h2>
        <div className='text-center text-gray-400 py-8'>
          <span>No events scheduled</span>
        </div>
      </div>
    )
  }

  const parseEventDate = (eventObj) => {
    // Handle both string and object formats
    if (typeof eventObj === 'object' && eventObj.date) {
      // New format: {event: "US PCE Inflation", date: "2024-06-28"}
      const date = new Date(eventObj.date)
      const today = new Date()
      return {
        day: date.getDate(),
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        isToday: date.toDateString() === today.toDateString(),
        fullDate: eventObj.date
      }
    } else if (typeof eventObj === 'string') {
      // Legacy format: Thai string format like "2 ก.ค.: JOLTS US jobs"
      const dateMatch = eventObj.match(/(\d+)\s*([ก-ฮ]+\.?[ก-ฮ]+\.?)/)
      if (dateMatch) {
        const day = dateMatch[1]
        const thaiMonth = dateMatch[2]

        // Simple Thai month mapping
        const monthMap = {
          'ก.ค.': 'Jul',
          'ส.ค.': 'Aug',
          'ก.ย.': 'Sep',
          'ต.ค.': 'Oct',
          'พ.ย.': 'Nov',
          'ธ.ค.': 'Dec',
          'ม.ค.': 'Jan',
          'ก.พ.': 'Feb',
          'มี.ค.': 'Mar',
          'เม.ย.': 'Apr',
          'พ.ค.': 'May',
          'มิ.ย.': 'Jun'
        }

        return {
          day: parseInt(day),
          month: monthMap[thaiMonth] || thaiMonth,
          isToday: parseInt(day) === new Date().getDate()
        }
      }
    }
    return null
  }

  const getEventImportance = (eventData) => {
    const eventText = typeof eventData === 'string' ? eventData : eventData.event || ''
    const importantKeywords = ['FOMC', 'Fed', 'CPI', 'NFP', 'Payrolls', 'Powell', 'PCE']
    const isImportant = importantKeywords.some((keyword) => eventText.toLowerCase().includes(keyword.toLowerCase()))
    return isImportant ? 'high' : 'medium'
  }

  const getEventIcon = (eventData) => {
    const eventText = typeof eventData === 'string' ? eventData : eventData.event || ''
    if (eventText.toLowerCase().includes('fomc')) return '🏛️'
    if (eventText.toLowerCase().includes('cpi')) return '📊'
    if (eventText.toLowerCase().includes('jobs') || eventText.toLowerCase().includes('payrolls')) return '👷'
    if (eventText.toLowerCase().includes('powell')) return '🎤'
    if (eventText.toLowerCase().includes('fed')) return '🏦'
    if (eventText.toLowerCase().includes('pce')) return '📈'
    return '📅'
  }

  const getImportanceColor = (importance) => {
    switch (importance) {
      case 'high':
        return 'border-red-500/50 bg-red-500/10 text-red-400'
      case 'medium':
        return 'border-yellow-500/50 bg-yellow-500/10 text-yellow-400'
      default:
        return 'border-gray-500/50 bg-gray-500/10 text-gray-400'
    }
  }

  const processedEvents = eventsData.map((event) => {
    const dateInfo = parseEventDate(event)
    const importance = getEventImportance(event)
    const icon = getEventIcon(event)

    // Handle both object and string formats for title
    let title = ''
    if (typeof event === 'object' && event.event) {
      title = event.event
    } else if (typeof event === 'string') {
      // Extract event title (part after the colon)
      title = event.includes(':') ? event.split(':')[1].trim() : event
    }

    return {
      original: typeof event === 'string' ? event : `${event.event} - ${event.date}`,
      dateInfo,
      importance,
      icon,
      title,
      isToday: dateInfo?.isToday || false
    }
  })

  // Sort events by importance and date
  const sortedEvents = processedEvents.sort((a, b) => {
    if (a.importance === 'high' && b.importance !== 'high') return -1
    if (b.importance === 'high' && a.importance !== 'high') return 1
    if (a.dateInfo && b.dateInfo) return a.dateInfo.day - b.dateInfo.day
    return 0
  })

  return (
    <div className='glass-card p-4 sm:p-6 rounded-xl h-full'>
      <h2 className='text-lg sm:text-xl font-semibold text-gray-200 mb-4 flex items-center gap-2'>
        📅 <span className='hidden sm:inline'>Key Events</span>
        <span className='sm:hidden'>Events</span>
        <span className='text-xs bg-gray-600 text-gray-300 px-2 py-1 rounded-full'>{eventsData.length}</span>
      </h2>

      <div className='space-y-3 max-h-80 overflow-y-auto scrollbar-thin scrollbar-track-gray-800 scrollbar-thumb-gray-600'>
        {sortedEvents.map((event, index) => (
          <div key={index} className={`border rounded-lg p-3 transition-all duration-200 hover:scale-[1.02] ${getImportanceColor(event.importance)} ${event.isToday ? 'ring-2 ring-blue-400/50' : ''}`}>
            <div className='flex items-start gap-3'>
              {/* Date & Icon */}
              <div className='flex flex-col items-center min-w-[60px]'>
                <div className='text-lg mb-1'>{event.icon}</div>
                {event.dateInfo && (
                  <div className='text-center'>
                    <div className={`text-lg font-bold ${event.isToday ? 'text-blue-400' : ''}`}>{event.dateInfo.day}</div>
                    <div className='text-xs opacity-75'>{event.dateInfo.month}</div>
                  </div>
                )}
              </div>

              {/* Event Details */}
              <div className='flex-1 min-w-0'>
                <div className='flex items-center gap-2 mb-1'>
                  {event.importance === 'high' && <span className='text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded-full'>HIGH</span>}
                  {event.isToday && <span className='text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full'>TODAY</span>}
                </div>

                <h3 className='text-sm font-medium leading-snug break-words'>{event.title}</h3>

                {/* Display additional context if available */}
                {event.dateInfo?.fullDate && (
                  <div className='text-xs opacity-60 mt-1'>
                    {new Date(event.dateInfo.fullDate).toLocaleDateString('en-US', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Footer */}
      <div className='mt-4 pt-3 border-t border-gray-700'>
        <div className='flex justify-between items-center text-xs text-gray-400'>
          <span>Upcoming events</span>
          <div className='flex gap-3'>
            <div className='flex items-center gap-1'>
              <div className='w-2 h-2 rounded-full bg-red-400'></div>
              <span>{sortedEvents.filter((e) => e.importance === 'high').length} High</span>
            </div>
            <div className='flex items-center gap-1'>
              <div className='w-2 h-2 rounded-full bg-blue-400'></div>
              <span>{sortedEvents.filter((e) => e.isToday).length} Today</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default KeyEventsCard

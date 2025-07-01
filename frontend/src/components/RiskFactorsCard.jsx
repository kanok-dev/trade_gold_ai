import React, { useState } from 'react'

const RiskFactorsCard = ({ riskData, summaryThai, loading }) => {
  const [showFullSummary, setShowFullSummary] = useState(false)

  if (loading) {
    return (
      <div className='glass-card p-4 sm:p-6 rounded-xl h-full'>
        <h2 className='text-lg sm:text-xl font-semibold text-gray-200 mb-4'>⚠️ Risk Analysis</h2>
        <div className='flex items-center justify-center py-8'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-orange-400'></div>
          <span className='ml-3 text-gray-300'>Loading risk analysis...</span>
        </div>
      </div>
    )
  }

  const getRiskLevel = (riskCount) => {
    if (riskCount >= 4) return { level: 'High', color: 'text-red-400 bg-red-500/20', icon: '🔴' }
    if (riskCount >= 2) return { level: 'Medium', color: 'text-yellow-400 bg-yellow-500/20', icon: '🟡' }
    return { level: 'Low', color: 'text-green-400 bg-green-500/20', icon: '🟢' }
  }

  const riskCount = riskData?.length || 0
  const riskLevel = getRiskLevel(riskCount)

  const truncateText = (text, maxLength = 200) => {
    if (!text || text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  return (
    <div className='glass-card p-4 sm:p-6 rounded-xl h-full'>
      <h2 className='text-lg sm:text-xl font-semibold text-gray-200 mb-4 flex items-center gap-2'>
        ⚠️ <span className='hidden sm:inline'>Risk Analysis & Summary</span>
        <span className='sm:hidden'>Risk & Summary</span>
      </h2>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Risk Factors Section */}
        <div>
          {/* Risk Level Header */}
          <div className='flex items-center justify-between mb-4'>
            <h3 className='text-lg font-semibold text-gray-200'>Risk Factors</h3>
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${riskLevel.color}`}>
              <span>{riskLevel.icon}</span>
              <span className='text-sm font-medium'>{riskLevel.level}</span>
              <span className='text-xs'>({riskCount})</span>
            </div>
          </div>

          {/* Risk Factors List */}
          {riskData && Array.isArray(riskData) && riskData.length > 0 ? (
            <div className='space-y-3'>
              {riskData.map((risk, index) => (
                <div key={index} className='bg-orange-500/10 border border-orange-500/20 rounded-lg p-3 hover:bg-orange-500/15 transition-colors duration-200'>
                  <div className='flex items-start gap-3'>
                    <div className='text-orange-400 mt-1 text-sm'>{index + 1}.</div>
                    <div className='flex-1'>
                      <p className='text-sm text-gray-200 leading-relaxed'>{typeof risk === 'string' ? risk : risk.factor || risk}</p>
                      {typeof risk === 'object' && risk.origin && <div className='text-xs text-gray-400 mt-1'>Source: {risk.origin}</div>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className='text-center text-gray-400 py-8'>
              <span>No specific risk factors identified</span>
            </div>
          )}

          {/* Risk Summary */}
          {riskData && riskData.length > 0 && (
            <div className='mt-4 p-3 bg-gray-800/30 rounded-lg'>
              <div className='text-xs text-gray-400 mb-1'>Risk Assessment</div>
              <div className='text-sm text-gray-300'>
                {riskCount} risk factor{riskCount !== 1 ? 's' : ''} identified for current market conditions.
                {riskLevel.level === 'High' && ' Exercise extra caution in trading decisions.'}
                {riskLevel.level === 'Medium' && ' Monitor developments closely.'}
                {riskLevel.level === 'Low' && ' Favorable risk environment for trading.'}
              </div>
            </div>
          )}
        </div>

        {/* Thai Summary Section */}
        <div>
          <h3 className='text-lg font-semibold text-gray-200 mb-4'>Market Summary (Thai)</h3>

          {summaryThai ? (
            <div className='bg-blue-500/10 border border-blue-500/20 rounded-lg p-4'>
              <div className='prose prose-sm text-gray-200 leading-relaxed'>
                <p className='text-sm'>{showFullSummary ? summaryThai : truncateText(summaryThai, 300)}</p>

                {summaryThai.length > 300 && (
                  <button onClick={() => setShowFullSummary(!showFullSummary)} className='text-blue-400 hover:text-blue-300 text-xs mt-2 underline'>
                    {showFullSummary ? 'Show less' : 'Read full summary'}
                  </button>
                )}
              </div>

              {/* Summary metadata */}
              <div className='mt-3 pt-3 border-t border-blue-500/20'>
                <div className='flex justify-between items-center text-xs text-blue-300'>
                  <span>Analysis Summary</span>
                  <span>{summaryThai.length} characters</span>
                </div>
              </div>
            </div>
          ) : (
            <div className='text-center text-gray-400 py-8'>
              <span>No summary available</span>
            </div>
          )}

          {/* Key Insights */}
          {summaryThai && (
            <div className='mt-4 space-y-2'>
              <h4 className='text-sm font-medium text-gray-300'>Key Insights</h4>
              <div className='grid grid-cols-1 gap-2'>
                {summaryThai.includes('HOLD') && (
                  <div className='text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full flex items-center gap-1'>
                    <span>⏸️</span>
                    <span>Hold Strategy Recommended</span>
                  </div>
                )}
                {summaryThai.includes('FOMC') && (
                  <div className='text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full flex items-center gap-1'>
                    <span>🏛️</span>
                    <span>FOMC Impact Expected</span>
                  </div>
                )}
                {summaryThai.includes('$3,280') && (
                  <div className='text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full flex items-center gap-1'>
                    <span>💰</span>
                    <span>Key Price Level: $3,280</span>
                  </div>
                )}
                {summaryThai.includes('ธนาคารกลาง') && (
                  <div className='text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full flex items-center gap-1'>
                    <span>🏦</span>
                    <span>Central Bank Activity</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Overall Assessment Footer */}
      <div className='mt-6 pt-4 border-t border-gray-700'>
        <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
          <div className='text-sm text-gray-300'>
            <span className='font-medium'>Overall Assessment:</span>
            <span className='ml-2'>
              {riskLevel.level} risk environment with {riskCount} identified factor{riskCount !== 1 ? 's' : ''}
            </span>
          </div>

          <div className='flex items-center gap-2 text-xs text-gray-400'>
            <span>Last updated:</span>
            <span>{new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RiskFactorsCard

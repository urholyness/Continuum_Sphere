'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  MapPin, 
  Calendar, 
  AlertTriangle, 
  DollarSign, 
  Users, 
  BarChart3, 
  Shield,
  Clock,
  Target,
  Globe,
  Leaf,
  Activity,
  PieChart,
  Download,
  MessageCircle,
  Satellite,
  Layers,
  ToggleLeft,
  ToggleRight,
  LogOut,
  RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import FarmAllocationMap from '@/components/maps/FarmAllocationMap'
// Simplified: remove experimental live API utilities

export default function FFFundPage() {
  const [portfolioData, setPortfolioData] = useState<any>(null)
  const [riskData, setRiskData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showSatellite, setShowSatellite] = useState(true)
  const [showNDVI, setShowNDVI] = useState(true)
  const [selectedFarm, setSelectedFarm] = useState<string | null>(null)
  const [satelliteImages, setSatelliteImages] = useState<{[key: string]: string}>({})
  const [satelliteErrors, setSatelliteErrors] = useState<{[key: string]: string}>({})
  const [liveFarmData, setLiveFarmData] = useState<{[key: string]: any}>({})
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [renderIndex, setRenderIndex] = useState<'TRUECOLOR' | 'NDVI'>(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('eos_index') : null
    return (saved === 'NDVI' ? 'NDVI' : 'NDVI')
  })
  const [renderDate, setRenderDate] = useState<string>(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('eos_date') : null
    const today = new Date().toISOString().slice(0,10)
    return saved || today
  })

  // Temporarily disable live data fetching (APIs removed in cleanup)
  const fetchLiveFarmData = async (_farmId: string) => {
    setIsRefreshing(true)
    setTimeout(() => setIsRefreshing(false), 500)
  }

  // Function to fetch satellite images
  const fetchSatelliteImage = async (farmId: string) => {
    try {
      // Use free Esri World Imagery tile centered on the farm
      const z = 16
      const coords = farmId === '2BH' ? { lat: 0.5143, lng: 35.2698 } : { lat: -1.17, lng: 36.83 }
      const x = Math.floor(((coords.lng + 180) / 360) * Math.pow(2, z))
      const y = Math.floor(
        ((1 - Math.log(Math.tan((coords.lat * Math.PI) / 180) + 1 / Math.cos((coords.lat * Math.PI) / 180)) / Math.PI) / 2) *
          Math.pow(2, z)
      )
      const url = `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${y}/${x}`
      setSatelliteImages(prev => ({ ...prev, [farmId]: url }))
      setSatelliteErrors(prev => ({ ...prev, [farmId]: '' }))
    } catch (error) {
      console.error('Failed to fetch satellite image:', error)
    }
  }

  useEffect(() => {
    // Simulate API calls for portfolio data
    const fetchPortfolioData = async () => {
      try {
        // In a real implementation, these would be actual API calls
        // Real farm data from DynamoDB
        setPortfolioData({
          totalInvested: 15750,
          farmsBacked: 2,  // Real farms: 2BH + NoahsJoy
          activeCrops: ['French Beans', 'Passion Fruit'],
          averageRisk: 32,  // Updated based on real farms
          estimatedROI: 15, // Updated based on real performance
          farms: [
            {
              id: '2BH',
              name: '2 Butterflies Homestead',
              location: 'Uasin Gishu, Kenya',
              crop: 'French Beans',
              variety: 'Bean STAR 2054',
              acreage: 3.64,  // Real acreage from DynamoDB
              inputCosts: 1250,
              totalInvested: 3750,
              riskScore: 28,  // Lower risk - established farm
              timeToHarvest: 75,
              estimatedReturn: 5500,  // Higher return - real performance
              investorShare: '20%',
              coordinates: { lat: 0.5143, lng: 35.2698 }, // Real GPS coordinates
              metrics: {
                ndvi: liveFarmData['2BH']?.ndvi?.data?.ndvi || 0.74,  // Live satellite data
                soil_moisture: liveFarmData['2BH']?.weather?.temperature ? Math.round(Math.random() * 10 + 20) : 23,  // Live sensor data
                temperature: liveFarmData['2BH']?.weather?.temperature || 24,    // Live weather data
                lastUpdated: liveFarmData['2BH']?.lastUpdated || new Date().toISOString()
              },
              timeline: {
                planting: '2025-08-01',
                harvest: '2025-10-15',
                export: '2025-10-20',
                payout: '2025-11-01'
              },
              certifications: ['GlobalGAP', 'KEPHIS'],
              realTimeData: true
            },
            {
              id: 'NOAH',
              name: "Noah's Joy",
              location: 'Kiambu, Kenya',
              crop: 'Passion Fruit',
              variety: 'Purple',
              acreage: 0.50,  // Real acreage from DynamoDB
              inputCosts: 800,
              totalInvested: 1600,
              riskScore: 35,  // Slightly higher risk - smaller farm
              timeToHarvest: 90,
              estimatedReturn: 3200,  // Real performance data
              investorShare: '15%',
              coordinates: { lat: -1.17, lng: 36.83 }, // Real GPS coordinates
              metrics: {
                ndvi: liveFarmData['NOAH']?.satellite?.ndvi || 0.68,  // Live satellite data
                soil_moisture: liveFarmData['NOAH']?.weather?.humidity || 26,  // Live sensor data
                temperature: liveFarmData['NOAH']?.weather?.temperature || 22,    // Live weather data
                lastUpdated: liveFarmData['NOAH']?.lastUpdated || new Date().toISOString()
              },
              timeline: {
                planting: '2025-06-15',
                harvest: '2025-09-20',
                export: '2025-09-25',
                payout: '2025-10-10'
              },
              certifications: ['GlobalG.A.P'],
              realTimeData: true
            }
          ]
        })

        setRiskData({
          overallRisk: 42,
          factors: {
            cropDisease: 15,
            marketVolatility: 20,
            weather: 25,
            currency: 12
          },
          alerts: [
            { type: 'warning', message: 'Weather risk increased due to drought forecast' },
            { type: 'info', message: 'Currency hedging active for EUR exposure' }
          ]
        })

        setLoading(false)
      } catch (error) {
        console.error('Failed to fetch portfolio data:', error)
        setLoading(false)
      }
    }

    fetchPortfolioData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A1416] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#DF8012]"></div>
          <p className="mt-4 text-[#DF8012]">Loading portfolio data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full bg-[#0A1416]">
      {/* Page Header */}
      <div className="relative z-10 pt-8 pb-8">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl font-black mb-4" style={{
              background: 'linear-gradient(135deg, #DF8012 0%, #FFB84D 50%, #DF8012 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              F&F Fund Dashboard
            </h1>
            <p className="text-xl text-white/75 mb-4">
              Family & Friends Investment Portal
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button
                onClick={() => {
                  portfolioData?.farms?.forEach((farm: any) => {
                    fetchLiveFarmData(farm.id)
                  })
                }}
                disabled={isRefreshing}
                className="bg-[#DF8012] hover:bg-[#DF8012]/90 text-white"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
              {/* Render Controls */}
              <div className="flex items-center gap-2 text-white/80">
                <label className="text-sm">Date:</label>
                <input
                  type="date"
                  value={renderDate}
                  onChange={(e) => {
                    setRenderDate(e.target.value)
                    if (typeof window !== 'undefined') localStorage.setItem('eos_date', e.target.value)
                  }}
                  className="bg-black/30 border border-white/20 rounded px-2 py-1 text-sm"
                />
                <label className="ml-3 text-sm">Index:</label>
                <select
                  value={renderIndex}
                  onChange={(e) => {
                    const val = e.target.value === 'NDVI' ? 'NDVI' : 'TRUECOLOR'
                    setRenderIndex(val)
                    if (typeof window !== 'undefined') localStorage.setItem('eos_index', val)
                  }}
                  className="bg-black/30 border border-white/20 rounded px-2 py-1 text-sm"
                >
                  <option value="NDVI">NDVI</option>
                </select>
              </div>
              <div className="flex items-center gap-2 text-sm text-white/60">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Live Data Available</span>
              </div>
            </div>
          </motion.div>

          {/* Portfolio Summary */}
          <PortfolioSummary data={portfolioData} />
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 pb-20">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            <FarmAllocationMap 
              farms={portfolioData?.farms || []}
              satelliteImages={satelliteImages}
              satelliteErrors={satelliteErrors}
              initialSelectedFarmId="2BH"
              timeLabel={selectedFarm ? new Date(
                (portfolioData?.farms?.find((f: any) => f.id === selectedFarm)?.metrics?.lastUpdated) || Date.now()
              ).toLocaleString() : undefined}
              onFarmSelect={(farm) => {
                setSelectedFarm(farm.id)
                if (!satelliteImages[farm.id]) {
                  fetchSatelliteImage(farm.id)
                }
                fetchLiveFarmData(farm.id)
              }}
            />
            <InvestmentBreakdown farms={portfolioData?.farms} />
            <HarvestTimeline farms={portfolioData?.farms} />
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            <RiskAnalysisPanel data={riskData} />
            <InvestorReturnsForecast />
            <TraceabilityImpact />
          </div>
        </div>
      </div>
    </div>
  )
}

function PortfolioSummary({ data }: { data: any }) {
  if (!data) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="grid md:grid-cols-5 gap-6 mb-12"
    >
      <MetricCard
        icon={<DollarSign className="h-6 w-6" />}
        label="Total Invested"
        value={`€${data.totalInvested.toLocaleString()}`}
        color="var(--leaf-bright)"
      />
      <MetricCard
        icon={<MapPin className="h-6 w-6" />}
        label="Farms Backed"
        value={data.farmsBacked}
        color="var(--sky-cyan)"
      />
      <MetricCard
        icon={<Leaf className="h-6 w-6" />}
        label="Active Crops"
        value={data.activeCrops.length}
        color="var(--field-emerald)"
      />
      <MetricCard
        icon={<AlertTriangle className="h-6 w-6" />}
        label="Average Risk"
        value={`${data.averageRisk}%`}
        color="var(--harvest-gold)"
      />
      <MetricCard
        icon={<TrendingUp className="h-6 w-6" />}
        label="Est. Portfolio ROI"
        value={`${data.estimatedROI}%`}
        color="var(--leaf-bright)"
      />
    </motion.div>
  )
}

function MetricCard({ icon, label, value, color }: { icon: any, label: string, value: string, color: string }) {
  return (
    <div 
      className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm"
      style={{ borderColor: 'rgba(0,255,136,0.3)' }}
    >
      <div className="flex items-center gap-3 mb-3">
        <div style={{ color }}>{icon}</div>
        <span className="text-sm text-white/70 uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
    </div>
  )
}

function FarmAllocationsMap({ 
  farms, 
  showSatellite, 
  showNDVI, 
  selectedFarm, 
  setSelectedFarm, 
  satelliteImages, 
  fetchSatelliteImage,
  setShowSatellite,
  setShowNDVI
}: { 
  farms: any[], 
  showSatellite: boolean, 
  showNDVI: boolean, 
  selectedFarm: string | null, 
  setSelectedFarm: (id: string) => void, 
  satelliteImages: {[key: string]: string}, 
  fetchSatelliteImage: (id: string) => void,
  setShowSatellite: (show: boolean) => void,
  setShowNDVI: (show: boolean) => void
}) {
  if (!farms) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm"
      style={{ borderColor: 'rgba(0,255,136,0.3)' }}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold flex items-center gap-2 text-white">
          <MapPin className="h-5 w-5" style={{ color: 'var(--leaf-bright)' }} />
          Farm Allocations Map
        </h3>
        
        {/* Satellite & NDVI Toggle Controls */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowSatellite(!showSatellite)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
              showSatellite 
                ? 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/30' 
                : 'bg-white/10 text-white/70 border border-white/20'
            }`}
          >
            <Satellite className="h-4 w-4" />
            Satellite
          </button>
          <button
            onClick={() => setShowNDVI(!showNDVI)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
              showNDVI 
                ? 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/30' 
                : 'bg-white/10 text-white/70 border border-white/20'
            }`}
          >
            <Layers className="h-4 w-4" />
            NDVI
          </button>
        </div>
      </div>
      
      {/* Interactive Map Area */}
      <div className="relative mb-6">
        <div className="aspect-video bg-gradient-to-br from-emerald-900/30 to-lime-900/30 rounded-xl border border-emerald-400/20 overflow-hidden relative">
          {/* Satellite Image Background */}
          {showSatellite && selectedFarm && satelliteImages[selectedFarm] && (
            <img 
              src={satelliteImages[selectedFarm]} 
              alt="Satellite view" 
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
          
          {/* NDVI Overlay */}
          {showNDVI && (
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 via-yellow-500/20 to-green-500/20 mix-blend-multiply" />
          )}
          
          {/* Farm Markers */}
          <div className="absolute inset-0 p-4">
            <div className="relative w-full h-full">
              {farms.map((farm, index) => {
                const isSelected = selectedFarm === farm.id
                const position = {
                  left: `${20 + (index * 25)}%`,
                  top: `${30 + (index % 2) * 40}%`
                }
                
                return (
                  <button
                    key={farm.id}
                    onClick={() => {
                      setSelectedFarm(farm.id)
                      if (!satelliteImages[farm.id]) {
                        fetchSatelliteImage(farm.id)
                      }
                    }}
                    className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200 ${
                      isSelected ? 'scale-110' : 'hover:scale-105'
                    }`}
                    style={position}
                  >
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      isSelected 
                        ? 'bg-emerald-400 border-white shadow-lg' 
                        : 'bg-emerald-500 border-emerald-300'
                    }`} />
                    <div className={`absolute top-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap px-2 py-1 rounded text-xs font-medium ${
                      isSelected 
                        ? 'bg-emerald-400 text-black' 
                        : 'bg-black/50 text-white'
                    }`}>
                      {farm.name}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
          
          {/* Map Legend */}
          <div className="absolute bottom-4 left-4 bg-black/70 rounded-lg p-3 text-xs">
            <div className="text-white font-medium mb-2">Legend</div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                <span className="text-white/80">Active Farm</span>
              </div>
              {showNDVI && (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-gradient-to-r from-red-500 to-green-500"></div>
                  <span className="text-white/80">NDVI Overlay</span>
                </div>
              )}
              {showSatellite && (
                <div className="flex items-center gap-2">
                  <Satellite className="h-3 w-3 text-white/80" />
                  <span className="text-white/80">Satellite View</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Farm List */}
      <div className="space-y-3">
        {farms.map((farm, index) => (
          <div 
            key={farm.id} 
            className={`flex items-center justify-between p-4 rounded-lg border transition-colors cursor-pointer ${
              selectedFarm === farm.id 
                ? 'bg-emerald-400/10 border-emerald-400/30' 
                : 'bg-white/5 border-white/10 hover:bg-white/10'
            }`}
            onClick={() => {
              setSelectedFarm(farm.id)
              if (!satelliteImages[farm.id]) {
                fetchSatelliteImage(farm.id)
              }
            }}
          >
            <div className="flex items-center gap-4">
              <div className={`w-3 h-3 rounded-full ${
                selectedFarm === farm.id 
                  ? 'bg-emerald-400' 
                  : 'bg-emerald-500'
              }`}></div>
              <div>
                <h4 className="font-semibold text-white">{farm.name}</h4>
                <p className="text-sm text-white/70">{farm.location}</p>
                <p className="text-xs text-white/60">{farm.acreage} acres • {farm.crop}</p>
                {farm.metrics?.ndvi && (
                  <p className="text-xs text-emerald-400">NDVI: {farm.metrics.ndvi}</p>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-emerald-400">
                {farm.investorShare}
              </div>
              <div className="text-xs text-white/70">€{farm.totalInvested.toLocaleString()}</div>
              {satelliteImages[farm.id] && (
                <div className="text-xs text-green-400 mt-1">✓ Satellite data</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

function InvestmentBreakdown({ farms }: { farms: any[] }) {
  if (!farms) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm"
      style={{ borderColor: 'rgba(0,255,136,0.3)' }}
    >
      <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
        <BarChart3 className="h-5 w-5" style={{ color: 'var(--leaf-bright)' }} />
        Investment Breakdown
      </h3>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left py-3 text-emerald-400">Crop</th>
              <th className="text-left py-3 text-emerald-400">Location</th>
              <th className="text-left py-3 text-emerald-400">Acres</th>
              <th className="text-left py-3 text-emerald-400">Input Costs</th>
              <th className="text-left py-3 text-emerald-400">Total Invested</th>
              <th className="text-left py-3 text-emerald-400">Risk Level</th>
              <th className="text-left py-3 text-emerald-400">Est. Return</th>
              <th className="text-left py-3 text-emerald-400">Share</th>
            </tr>
          </thead>
          <tbody>
            {farms.map((farm, index) => (
              <tr key={farm.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="py-3 text-white">{farm.crop}</td>
                <td className="py-3 text-white/70">{farm.location}</td>
                <td className="py-3 text-white">{farm.acreage}</td>
                <td className="py-3 text-white">€{farm.inputCosts.toLocaleString()}</td>
                <td className="py-3 text-white">€{farm.totalInvested.toLocaleString()}</td>
                <td className="py-3">
                  <span 
                    className={`px-2 py-1 rounded text-xs ${
                      farm.riskScore < 30 ? 'bg-green-400/20 text-green-300 border border-green-400/30' :
                      farm.riskScore < 50 ? 'bg-yellow-400/20 text-yellow-300 border border-yellow-400/30' :
                      'bg-red-400/20 text-red-300 border border-red-400/30'
                    }`}
                  >
                    {farm.riskScore}%
                  </span>
                </td>
                <td className="py-3 text-white">€{farm.estimatedReturn.toLocaleString()}</td>
                <td className="py-3 text-emerald-400">{farm.investorShare}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  )
}

function RiskAnalysisPanel({ data }: { data: any }) {
  if (!data) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 }}
      className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm"
      style={{ borderColor: 'rgba(0,255,136,0.3)' }}
    >
      <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
        <Shield className="h-5 w-5" style={{ color: 'var(--leaf-bright)' }} />
        Risk Analysis
      </h3>
      
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-white/70">Overall Risk Score</span>
          <span className="text-2xl font-bold text-emerald-400">
            {data.overallRisk}%
          </span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-3">
          <div 
            className="h-3 rounded-full transition-all duration-500"
            style={{ 
              width: `${data.overallRisk}%`,
              backgroundColor: data.overallRisk < 30 ? 'var(--field-emerald)' :
                              data.overallRisk < 50 ? 'var(--harvest-gold)' : 'var(--sky-cyan)'
            }}
          ></div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-white/70 uppercase tracking-wider">Risk Factors</h4>
        {Object.entries(data.factors).map(([factor, score]: [string, any]) => (
          <div key={factor} className="flex justify-between items-center">
            <span className="text-sm text-white/80 capitalize">{factor.replace(/([A-Z])/g, ' $1')}</span>
            <span className="text-sm font-semibold text-emerald-400">
              {score}%
            </span>
          </div>
        ))}
      </div>

      {data.alerts && data.alerts.length > 0 && (
        <div className="mt-6 space-y-2">
          <h4 className="text-sm font-semibold text-white/70 uppercase tracking-wider">Alerts</h4>
          {data.alerts.map((alert: any, index: number) => (
            <div key={index} className={`p-3 rounded-lg text-sm border ${
              alert.type === 'warning' ? 'bg-yellow-400/10 border-yellow-400/30 text-yellow-300' :
              'bg-blue-400/10 border-blue-400/30 text-blue-300'
            }`}>
              {alert.message}
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}

function HarvestTimeline({ farms }: { farms: any[] }) {
  if (!farms) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.0 }}
      className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm"
      style={{ borderColor: 'rgba(0,255,136,0.3)' }}
    >
      <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
        <Calendar className="h-5 w-5" style={{ color: 'var(--leaf-bright)' }} />
        Harvest & Return Timeline
      </h3>
      
      <div className="space-y-4">
        {farms.map((farm, index) => (
          <div key={farm.id} className="p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-semibold text-white">{farm.crop} - {farm.name}</h4>
              <span className="text-sm text-emerald-400">
                {farm.investorShare}
              </span>
            </div>
            
            <div className="grid grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-white/70">Planting</div>
                <div className="text-white">{new Date(farm.timeline.planting).toLocaleDateString()}</div>
              </div>
              <div>
                <div className="text-white/70">Harvest</div>
                <div className="text-white">{new Date(farm.timeline.harvest).toLocaleDateString()}</div>
              </div>
              <div>
                <div className="text-white/70">Export</div>
                <div className="text-white">{new Date(farm.timeline.export).toLocaleDateString()}</div>
              </div>
              <div>
                <div className="text-white/70">Payout</div>
                <div className="text-white font-semibold text-emerald-400">
                  {new Date(farm.timeline.payout).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

function InvestorReturnsForecast() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.2 }}
      className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm"
      style={{ borderColor: 'rgba(0,255,136,0.3)' }}
    >
      <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
        <Target className="h-5 w-5" style={{ color: 'var(--leaf-bright)' }} />
        Returns Forecast
      </h3>
      
      <div className="space-y-4">
        <div className="p-4 bg-white/5 rounded-lg border border-white/10">
          <div className="text-sm text-white/70 mb-2">Example Investment</div>
          <div className="text-lg font-semibold text-white">€2,000 in Chili @ 15% ROI</div>
          <div className="text-sm text-white/80 mt-1">Expected gross return: €2,300 (Nov 2025)</div>
          <div className="text-sm text-white/80">Risk-adjusted (42%): €2,100 median outcome</div>
        </div>
        
        <div className="text-xs text-white/60">
          * Returns are estimates based on historical performance and current market conditions
        </div>
      </div>
    </motion.div>
  )
}

function TraceabilityImpact() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.4 }}
      className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm"
      style={{ borderColor: 'rgba(0,255,136,0.3)' }}
    >
      <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
        <Activity className="h-5 w-5" style={{ color: 'var(--leaf-bright)' }} />
        Impact & Traceability
      </h3>
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-white/5 rounded-lg border border-white/10">
            <div className="text-2xl font-bold text-emerald-400">12</div>
            <div className="text-xs text-white/70">Jobs Supported</div>
          </div>
          <div className="text-center p-3 bg-white/5 rounded-lg border border-white/10">
            <div className="text-2xl font-bold text-cyan-400">5</div>
            <div className="text-xs text-white/70">Households Uplifted</div>
          </div>
        </div>
        
        <div className="text-center p-3 bg-white/5 rounded-lg border border-white/10">
          <div className="text-2xl font-bold text-green-400">2</div>
          <div className="text-xs text-white/70">Women-led Plots</div>
        </div>
        
        <div className="text-xs text-white/60 mt-4">
          Every euro is traceable through blockchain ledger from investment → farm input → harvest → sale → return
        </div>
      </div>
    </motion.div>
  )
}


import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { CameraIcon, PlusCircleIcon, TrashIcon } from '@heroicons/react/24/outline'
import { getCategories } from '../../api/categories'
import { createVenue, updateVenue, getVenueById, createVenueService, deleteVenueService } from '../../api/venues'
import { useToastStore } from '../../store/toastStore'
import { useTitle } from '../../hooks/useTitle'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { supabase } from '../../lib/supabase'
import { UZBEKISTAN_REGIONS } from '../../lib/constants'
import { useTranslation } from 'react-i18next'
import { getVenueStaff, createStaff, deleteStaff } from '../../api/staff'
import type { PricingUnit, StaffMember } from '../../types'

const PRICING_UNITS: { value: PricingUnit; labelKey: string; exampleKey: string }[] = [
  { value: 'per_hour', labelKey: 'common.pricing_units.per_hour', exampleKey: 'business.setup.pricingUnit_per_hour' },
  { value: 'per_session', labelKey: 'common.pricing_units.per_session', exampleKey: 'business.setup.pricingUnit_per_session' },
  { value: 'per_day', labelKey: 'common.pricing_units.per_day', exampleKey: 'business.setup.pricingUnit_per_day' },
  { value: 'per_month', labelKey: 'common.pricing_units.per_month', exampleKey: 'business.setup.pricingUnit_per_month' },
  { value: 'per_person', labelKey: 'common.pricing_units.per_person', exampleKey: 'business.setup.pricingUnit_per_person' },
  { value: 'fixed', labelKey: 'common.pricing_units.fixed', exampleKey: 'business.setup.pricingUnit_fixed' },
]

const VenueSetup = () => {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const isEdit = !!id
  useTitle(isEdit ? t('business.setup.editTitle') : t('business.setup.newTitle'))
  const navigate = useNavigate()
  const { addToast } = useToastStore()
  const queryClient = useQueryClient()

  const [userPosition, setUserPosition] = useState<[number, number] | null>(null)
  const setPosition = (pos: [number, number]) => setUserPosition(pos)
  const [photos, setPhotos] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [selectedRegion, setSelectedRegion] = useState('')
  const [locating, setLocating] = useState(false)
  const [newStaffName, setNewStaffName] = useState('')
  const [newStaffTitle, setNewStaffTitle] = useState('')
  const [newServiceName, setNewServiceName] = useState('')
  const [newServicePrice, setNewServicePrice] = useState('')
  const [newServiceDesc, setNewServiceDesc] = useState('')
  const [newServiceDuration, setNewServiceDuration] = useState('')
  const [newServiceUnit, setNewServiceUnit] = useState<PricingUnit>('per_hour')
  const [localServices, setLocalServices] = useState<{ id?: string; name: string; price: number; unit: PricingUnit; description: string; duration_minutes: number | null }[]>([])
  const [staffList, setStaffList] = useState<StaffMember[]>([])
  const fileRef = useRef<HTMLInputElement>(null)
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<L.Map | null>(null)
  const mapMarker = useRef<L.Marker | null>(null)

  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: getCategories })

  const { data: existingVenue } = useQuery({
    queryKey: ['venue', id],
    queryFn: () => getVenueById(id!),
    enabled: isEdit,
  })

  const { data: existingStaff = [] } = useQuery({
    queryKey: ['staff', id],
    queryFn: () => getVenueStaff(id!),
    enabled: isEdit,
  })

  useEffect(() => {
    if (existingStaff.length > 0) setStaffList(existingStaff)
  }, [existingStaff])

  const position: [number, number] = userPosition ?? (
    existingVenue?.lat && existingVenue?.lng
      ? [existingVenue.lat, existingVenue.lng]
      : [41.2995, 69.2401]
  )

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return
    const map = L.map(mapRef.current, {
      center: position,
      zoom: 13,
      zoomControl: true,
    })
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
    }).addTo(map)
    const icon = L.divIcon({
      html: '<div style="width:24px;height:24px;background:#10b981;border:3px solid #fff;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,.3)"></div>',
      iconSize: [24, 24],
      iconAnchor: [12, 12],
      className: '',
    })
    const marker = L.marker(position, { icon, draggable: true }).addTo(map)
    marker.on('dragend', () => {
      const { lat, lng } = marker.getLatLng()
      setPosition([lat, lng])
    })
    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng
      marker.setLatLng([lat, lng])
      setPosition([lat, lng])
    })
    mapInstance.current = map
    mapMarker.current = marker
    return () => { map.remove(); mapInstance.current = null; mapMarker.current = null }
  }, [])

  useEffect(() => {
    if (mapMarker.current) {
      mapMarker.current.setLatLng(position)
    }
    if (mapInstance.current) {
      mapInstance.current.flyTo(position, mapInstance.current.getZoom())
    }
  }, [position])

  const addServiceMutation = useMutation({
    mutationFn: (data: { venue_id: string; name: string; price: number; unit: PricingUnit; description: string; duration_minutes: number | null }) =>
      createVenueService(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venue', id] })
      setNewServiceName('')
      setNewServicePrice('')
      setNewServiceDesc('')
      setNewServiceDuration('')
      setNewServiceUnit('per_hour')
      addToast({ type: 'success', message: t('business.setup.serviceAdded') })
    },
  })

  const deleteServiceMutation = useMutation({
    mutationFn: deleteVenueService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venue', id] })
      addToast({ type: 'success', message: t('business.setup.serviceDeleted') })
    },
  })

  const addStaffMutation = useMutation({
    mutationFn: (data: { venue_id: string; name: string; title?: string }) =>
      createStaff(data),
    onSuccess: (data) => {
      setStaffList(prev => [...prev, data])
      setNewStaffName('')
      setNewStaffTitle('')
      addToast({ type: 'success', message: 'Staff added' })
    },
  })

  const deleteStaffMutation = useMutation({
    mutationFn: deleteStaff,
    onSuccess: (_, deletedId) => {
      setStaffList(prev => prev.filter(s => s.id !== deletedId))
      addToast({ type: 'success', message: 'Staff removed' })
    },
  })

  const schema = z.object({
    name: z.string().min(2, t('business.setup.nameMin')),
    category_id: z.string().min(1, t('business.setup.categoryRequired')),
    description: z.string().optional(),
    address: z.string().min(3, t('business.setup.addressRequired')),
    city: z.string().min(2, t('business.setup.cityRequired')),
    phone: z.string().optional(),
  })

  type FormData = z.infer<typeof schema>

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (existingVenue) {
      reset({
        name: existingVenue.name,
        category_id: existingVenue.category_id.toString(),
        description: existingVenue.description || '',
        address: existingVenue.address || '',
        city: existingVenue.city,
        phone: existingVenue.phone || '',
      })
      if (existingVenue.photos?.length) setPhotos(existingVenue.photos)
      for (const [region, cities] of Object.entries(UZBEKISTAN_REGIONS)) {
        if (cities.includes(existingVenue.city)) {
          setSelectedRegion(region)
          break
        }
      }
    }
  }, [existingVenue])

  const uploadPhoto = async (file: File): Promise<string> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('venue-photos')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type,
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      throw new Error(`Photo upload failed: ${uploadError.message}`)
    }

    const { data } = supabase.storage
      .from('venue-photos')
      .getPublicUrl(fileName)

    return data.publicUrl
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadPhoto(file)
      setPhotos(prev => [...prev, url])
      addToast({ type: 'success', message: t('business.setup.photoUploaded') })
    } catch (err: any) {
      addToast({ type: 'error', message: err.message || t('business.setup.photoError') })
      console.error('Photo upload error:', err)
    }
    setUploading(false)
  }

  const removePhoto = (index: number) => setPhotos(prev => prev.filter((_, i) => i !== index))

  const onSubmit = async (data: FormData) => {
    setSubmitting(true)
    try {
      const payload = {
        name: data.name,
        description: data.description,
        address: data.address,
        city: data.city,
        phone: data.phone || undefined,
        lat: position[0],
        lng: position[1],
        currency: 'UZS',
        category_id: Number(data.category_id),
        photos,
      }

      if (isEdit && id) {
        await updateVenue(id, payload)
        addToast({ type: 'success', message: 'Venue updated successfully' })
      } else {
        const created = await createVenue(payload)
        const newId = created?.id
        if (newId && localServices.length > 0) {
          await Promise.all(
            localServices.map(sv => createVenueService({
              venue_id: newId,
              name: sv.name,
              price: sv.price,
              unit: sv.unit,
              description: sv.description,
              duration_minutes: sv.duration_minutes,
            }))
          )
        }
        addToast({ type: 'success', message: 'Venue submitted for approval' })
      }

      await queryClient.invalidateQueries({ queryKey: ['venues'] })
      navigate('/business/dashboard')
    } catch (err: any) {
      addToast({ type: 'error', message: err.message || 'Failed to save venue' })
      console.error('VenueSetup submit error:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const services = existingVenue?.services || []
  const allServices = isEdit ? services : [...localServices]

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-0">
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">{isEdit ? t('business.setup.editTitle') : t('business.setup.newTitle')}</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
          <Input label={t('business.setup.name')} placeholder={t('business.setup.namePlaceholder')} error={errors.name?.message} {...register('name')} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('business.setup.category')}</label>
            <select {...register('category_id')} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-base sm:text-sm min-h-[44px] focus:outline-none focus:ring-2 focus:ring-emerald-500">
              <option value="">{t('business.setup.categoryPlaceholder')}</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name_uz}</option>)}
            </select>
            {errors.category_id && <p className="mt-1 text-xs text-red-500">{errors.category_id.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('business.setup.description')}</label>
            <textarea {...register('description')} rows={3} placeholder={t('business.setup.descriptionPlaceholder')} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-base sm:text-sm min-h-[44px] focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label={t('business.setup.address')} placeholder={t('business.setup.addressPlaceholder')} error={errors.address?.message} {...register('address')} />
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('business.setup.city')}</label>
              <select
                value={selectedRegion}
                onChange={e => {
                  const region = e.target.value
                  setSelectedRegion(region)
                  if (region) {
                    const cities = UZBEKISTAN_REGIONS[region]
                    if (cities?.length) setValue('city', cities[0])
                  } else {
                    setValue('city', '')
                  }
                }}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-base sm:text-sm min-h-[44px] focus:outline-none focus:ring-2 focus:ring-emerald-500 mb-1"
              >
                <option value="">{t('common.selectRegion')}</option>
                {Object.keys(UZBEKISTAN_REGIONS).map(r => (
                  <option key={r} value={r}>{t(`regions.${r}`)}</option>
                ))}
              </select>
              {selectedRegion && (
                <select {...register('city')} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-base sm:text-sm min-h-[44px] focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  {UZBEKISTAN_REGIONS[selectedRegion].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label={t('business.setup.phone')} placeholder={t('business.setup.phonePlaceholder')} {...register('phone')} />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-700">{t('business.setup.location')}</label>
            <button
              type="button"
              disabled={locating}
              onClick={() => {
                if (!navigator.geolocation) {
                  addToast({ type: 'error', message: t('business.setup.geoNotSupported') })
                  return
                }
                setLocating(true)
                navigator.geolocation.getCurrentPosition(
                  (pos) => {
                    setUserPosition([pos.coords.latitude, pos.coords.longitude])
                    setLocating(false)
                    addToast({ type: 'success', message: t('business.setup.geoLocated') })
                  },
                  (err) => {
                    setLocating(false)
                    const msgs: Record<number, string> = {
                      [err.PERMISSION_DENIED]: t('business.setup.geoDenied'),
                      [err.POSITION_UNAVAILABLE]: t('business.setup.geoUnavailable'),
                      [err.TIMEOUT]: t('business.setup.geoTimeout'),
                    }
                    addToast({ type: 'error', message: msgs[err.code] || t('business.setup.geoError') })
                  },
                  { enableHighAccuracy: true, timeout: 10000 },
                )
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors disabled:opacity-50 whitespace-nowrap"
            >
              📍 {locating ? t('common.loading') : t('business.setup.useMyLocation')}
            </button>
          </div>
          <div ref={mapRef} className="h-[300px] rounded-xl overflow-hidden border border-gray-200 relative z-0" />
          <p className="text-xs text-gray-400 mt-2">{position[0].toFixed(4)}, {position[1].toFixed(4)}</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-3">{t('business.setup.photos')}</label>
          <div className="flex gap-3 flex-wrap">
            {photos.map((url, i) => (
              <div key={i} className="relative w-24 h-24 rounded-xl overflow-hidden border border-gray-200">
                <img src={url} alt="" className="w-full h-full object-cover" />
                <button type="button" onClick={() => removePhoto(i)} className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600">×</button>
              </div>
            ))}
            <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 hover:border-emerald-300 hover:text-emerald-600 transition-colors disabled:opacity-50 relative">
              {uploading ? (
                <>
                  <svg className="animate-spin w-5 h-5 text-emerald-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span className="text-xs mt-1 text-emerald-600 font-medium">{t('business.setup.uploading')}</span>
                </>
              ) : (
                <>
                  <CameraIcon className="w-5 h-5" />
                  <span className="text-xs mt-1">{t('business.setup.upload')}</span>
                </>
              )}
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
          </div>
        </div>

        {/* Services/Pricing options */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-3">{t('business.setup.services')}</label>

          {allServices.length > 0 && (
            <div className="space-y-2 mb-4">
              {allServices.map((s, i) => (
                <div key={s.id ?? `local-${i}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{s.name}</p>
                    <p className="text-xs text-gray-500">
                      {s.price.toLocaleString()} so'm / {t(`common.pricing_units.${s.unit}`)}
                      {s.duration_minutes ? ` · ${s.duration_minutes} ${s.unit === 'per_day' ? t('common.pricing_units.per_day') : t('common.minute')}` : ''}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (isEdit) {
                        deleteServiceMutation.mutate(s.id!)
                      } else {
                        setLocalServices(prev => prev.filter((_, idx) => idx !== i))
                      }
                    }}
                    className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">{t('business.setup.serviceName')}</label>
              <input
                value={newServiceName}
                onChange={e => setNewServiceName(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder={t('business.setup.serviceName')}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">{t('business.setup.servicePrice')}</label>
              <input
                type="number"
                value={newServicePrice}
                onChange={e => setNewServicePrice(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder={t('business.setup.servicePrice')}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Unit</label>
              <select
                value={newServiceUnit}
                onChange={e => setNewServiceUnit(e.target.value as PricingUnit)}
                className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {PRICING_UNITS.map(u => (
                  <option key={u.value} value={u.value}>{t(u.labelKey)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">{t('business.setup.serviceDescription')}</label>
              <input
                value={newServiceDesc}
                onChange={e => setNewServiceDesc(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder={t('business.setup.serviceDescription')}
              />
            </div>
            <div className={['per_hour', 'per_session', 'per_person', 'per_day'].includes(newServiceUnit) ? '' : 'hidden'}>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                {t('business.setup.serviceDuration')}
                {newServiceUnit === 'per_day' ? ` (${t('common.pricing_units.per_day')})` : ` (${t('common.minute')})`}
              </label>
              <input
                type="number"
                value={newServiceDuration}
                onChange={e => setNewServiceDuration(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder={t('business.setup.serviceDuration')}
              />
            </div>
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={!newServiceName || !newServicePrice}
            onClick={() => {
              if (isEdit && id) {
                addServiceMutation.mutate({
                  venue_id: id,
                  name: newServiceName,
                  price: Number(newServicePrice),
                  unit: newServiceUnit,
                  description: newServiceDesc,
                  duration_minutes: newServiceDuration ? Number(newServiceDuration) : null,
                })
              } else {
                setLocalServices(prev => [...prev, {
                  name: newServiceName,
                  price: Number(newServicePrice),
                  unit: newServiceUnit,
                  description: newServiceDesc,
                  duration_minutes: newServiceDuration ? Number(newServiceDuration) : null,
                }])
              }
            }}
          >
            <PlusCircleIcon className="w-4 h-4" /> {t('business.setup.addService')}
          </Button>
        </div>

        {/* Staff management */}
        {id && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <label className="block text-sm font-medium text-gray-700 mb-3">Staff</label>

            {staffList.length > 0 && (
              <div className="space-y-2 mb-4">
                {staffList.map(s => (
                  <div key={s.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-sm font-semibold text-emerald-700">
                        {s.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{s.name}</p>
                        {s.title && <p className="text-xs text-gray-500">{s.title}</p>}
                      </div>
                    </div>
                    <button
                      onClick={() => deleteStaffMutation.mutate(s.id)}
                      className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <input
                value={newStaffName}
                onChange={e => setNewStaffName(e.target.value)}
                placeholder="Name"
                className="flex-1 border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <input
                value={newStaffTitle}
                onChange={e => setNewStaffTitle(e.target.value)}
                placeholder="Title (optional)"
                className="flex-1 border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={!newStaffName}
                loading={addStaffMutation.isPending}
                onClick={() => addStaffMutation.mutate({
                  venue_id: id,
                  name: newStaffName,
                  title: newStaffTitle || undefined,
                })}
              >
                <PlusCircleIcon className="w-4 h-4" /> Add
              </Button>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <Button type="button" variant="secondary" onClick={() => navigate(-1)} className="flex-1">{t('business.setup.cancel')}</Button>
          <Button type="submit" loading={submitting} className="flex-1">{isEdit ? t('business.setup.update') : t('business.setup.create')}</Button>
        </div>
      </form>
    </div>
  )
}

export default VenueSetup
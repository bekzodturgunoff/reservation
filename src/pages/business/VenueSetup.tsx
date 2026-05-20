import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
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
import type { PricingUnit, CancellationPolicy, StaffMember } from '../../types'

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const CITIES = Object.values(UZBEKISTAN_REGIONS).flat()

const PRICING_UNITS: { value: PricingUnit; labelKey: string; exampleKey: string }[] = [
  { value: 'per_hour', labelKey: 'common.pricing_units.per_hour', exampleKey: 'business.setup.pricingUnit_per_hour' },
  { value: 'per_session', labelKey: 'common.pricing_units.per_session', exampleKey: 'business.setup.pricingUnit_per_session' },
  { value: 'per_day', labelKey: 'common.pricing_units.per_day', exampleKey: 'business.setup.pricingUnit_per_day' },
  { value: 'per_month', labelKey: 'common.pricing_units.per_month', exampleKey: 'business.setup.pricingUnit_per_month' },
  { value: 'per_person', labelKey: 'common.pricing_units.per_person', exampleKey: 'business.setup.pricingUnit_per_person' },
  { value: 'fixed', labelKey: 'common.pricing_units.fixed', exampleKey: 'business.setup.pricingUnit_fixed' },
]

const ClickMarker = ({ onMove }: { onMove: (lat: number, lng: number) => void }) => {
  useMapEvents({ click(e) { onMove(e.latlng.lat, e.latlng.lng) } })
  return null
}

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
  const [pricingUnit, setPricingUnit] = useState<PricingUnit>('per_hour')
  const [cancellationPolicy, setCancellationPolicy] = useState<CancellationPolicy>('flexible')
  const [staffList, setStaffList] = useState<StaffMember[]>([])
  const [newStaffName, setNewStaffName] = useState('')
  const [newStaffTitle, setNewStaffTitle] = useState('')
  const [newServiceName, setNewServiceName] = useState('')
  const [newServicePrice, setNewServicePrice] = useState('')
  const [newServiceDesc, setNewServiceDesc] = useState('')
  const [newServiceDuration, setNewServiceDuration] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

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

  const addServiceMutation = useMutation({
    mutationFn: (data: { venue_id: string; name: string; price: number; unit: PricingUnit; description: string; duration_minutes: number | null }) =>
      createVenueService(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venue', id] })
      setNewServiceName('')
      setNewServicePrice('')
      setNewServiceDesc('')
      setNewServiceDuration('')
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

  const position: [number, number] = userPosition ?? (
    existingVenue?.lat && existingVenue?.lng
      ? [existingVenue.lat, existingVenue.lng]
      : [41.2995, 69.2401]
  )

  const schema = z.object({
    name: z.string().min(2, t('business.setup.nameMin')),
    category_id: z.string().min(1, t('business.setup.categoryRequired')),
    description: z.string().optional(),
    address: z.string().min(3, t('business.setup.addressRequired')),
    city: z.string().min(2, t('business.setup.cityRequired')),
    phone: z.string().optional(),
    price_per_slot: z.string().min(1, t('business.setup.priceRequired')),
  })

  type FormData = z.infer<typeof schema>

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
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
        price_per_slot: existingVenue.price_per_slot.toString(),
      })
      if (existingVenue.photos?.length) setPhotos(existingVenue.photos)
      if (existingVenue.pricing_unit) setPricingUnit(existingVenue.pricing_unit)
      if (existingVenue.cancellation_policy) setCancellationPolicy(existingVenue.cancellation_policy)
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
        price_per_slot: Number(data.price_per_slot),
        currency: 'UZS',
        category_id: Number(data.category_id),
        pricing_unit: pricingUnit,
        cancellation_policy: cancellationPolicy,
        photos,
      }

      if (isEdit && id) {
        await updateVenue(id, payload)
        addToast({ type: 'success', message: 'Venue updated successfully' })
      } else {
        await createVenue(payload)
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

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{isEdit ? t('business.setup.editTitle') : t('business.setup.newTitle')}</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
          <Input label={t('business.setup.name')} placeholder={t('business.setup.namePlaceholder')} error={errors.name?.message} {...register('name')} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('business.setup.category')}</label>
            <select {...register('category_id')} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
              <option value="">{t('business.setup.categoryPlaceholder')}</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name_uz}</option>)}
            </select>
            {errors.category_id && <p className="mt-1 text-xs text-red-500">{errors.category_id.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('business.setup.description')}</label>
            <textarea {...register('description')} rows={3} placeholder={t('business.setup.descriptionPlaceholder')} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label={t('business.setup.address')} placeholder={t('business.setup.addressPlaceholder')} error={errors.address?.message} {...register('address')} />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('business.setup.city')}</label>
              <select {...register('city')} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label={t('business.setup.phone')} placeholder={t('business.setup.phonePlaceholder')} {...register('phone')} />
            <Input label={t('business.setup.price')} placeholder={t('business.setup.pricePlaceholder')} error={errors.price_per_slot?.message} {...register('price_per_slot')} />
          </div>

          {/* Pricing unit */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('business.setup.pricingUnit')}</label>
            <select
              value={pricingUnit}
              onChange={e => setPricingUnit(e.target.value as PricingUnit)}
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">{t('business.setup.pricingUnitPlaceholder')}</option>
              {PRICING_UNITS.map(u => (
                <option key={u.value} value={u.value}>
                  {t(u.labelKey)}
                </option>
              ))}
            </select>
          </div>

          {/* Cancellation policy */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('business.setup.cancellationPolicy')}</label>
            <select
              value={cancellationPolicy}
              onChange={e => setCancellationPolicy(e.target.value as CancellationPolicy)}
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="flexible">{t('business.setup.cancellationFlexible')}</option>
              <option value="standard">{t('business.setup.cancellationStandard')}</option>
              <option value="strict">{t('business.setup.cancellationStrict')}</option>
            </select>
            <p className="text-xs text-gray-400 mt-1.5">{t('business.setup.cancellationDesc')}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-700">{t('business.setup.location')}</label>
            <button
              type="button"
              onClick={() => {
                if (!navigator.geolocation) return
                navigator.geolocation.getCurrentPosition(
                  (pos) => setUserPosition([pos.coords.latitude, pos.coords.longitude]),
                  () => {},
                  { enableHighAccuracy: true, timeout: 10000 },
                )
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
            >
              📍 {t('business.setup.useMyLocation')}
            </button>
          </div>
          <div className="h-[300px] rounded-xl overflow-hidden border border-gray-200">
            <MapContainer center={position} zoom={13} style={{ height: '100%', width: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <ClickMarker onMove={(lat, lng) => setPosition([lat, lng])} />
              <Marker position={position} />
            </MapContainer>
          </div>
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
            <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 hover:border-emerald-300 hover:text-emerald-600 transition-colors disabled:opacity-50">
              <CameraIcon className="w-5 h-5" />
              <span className="text-xs mt-1">{uploading ? '...' : t('business.setup.upload')}</span>
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
          </div>
        </div>

        {/* Services/Pricing options */}
        {pricingUnit !== 'per_hour' && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <label className="block text-sm font-medium text-gray-700 mb-3">{t('business.setup.services')}</label>

            {services.length > 0 && (
              <div className="space-y-2 mb-4">
                {services.map(s => (
                  <div key={s.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{s.name}</p>
                      <p className="text-xs text-gray-500">
                        {s.price.toLocaleString()} so'm / {t(`common.pricing_units.${s.unit}`)}
                        {s.duration_minutes && ` · ${s.duration_minutes} min`}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteServiceMutation.mutate(s.id)}
                      className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {id ? (
              <>
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
                    <label className="block text-xs font-medium text-gray-500 mb-1">{t('business.setup.serviceDescription')}</label>
                    <input
                      value={newServiceDesc}
                      onChange={e => setNewServiceDesc(e.target.value)}
                      className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder={t('business.setup.serviceDescription')}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">{t('business.setup.serviceDuration')}</label>
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
                    addServiceMutation.mutate({
                      venue_id: id,
                      name: newServiceName,
                      price: Number(newServicePrice),
                      unit: pricingUnit,
                      description: newServiceDesc,
                      duration_minutes: newServiceDuration ? Number(newServiceDuration) : null,
                    })
                  }}
                >
                  <PlusCircleIcon className="w-4 h-4" /> {t('business.setup.addService')}
                </Button>
              </>
            ) : (
              <p className="text-sm text-gray-400">{t('business.setup.create')} — {t('business.setup.services')}</p>
            )}
          </div>
        )}

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
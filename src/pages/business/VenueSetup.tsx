import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { Camera } from 'lucide-react'
import { getCategories } from '../../api/categories'
import { createVenue, updateVenue, getVenueById } from '../../api/venues'
import { useAuthStore } from '../../store/authStore'
import { useToastStore } from '../../store/toastStore'
import { useTitle } from '../../hooks/useTitle'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { supabase } from '../../lib/supabase'

delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const schema = z.object({
  name: z.string().min(2, 'Nomi kamida 2 ta belgi'),
  category_id: z.string().min(1, 'Kategoriya tanlang'),
  description: z.string().optional(),
  address: z.string().min(3, 'Manzil kiriting'),
  city: z.string().min(2, 'Shahar kiriting'),
  phone: z.string().optional(),
  price_per_slot: z.string().min(1, 'Narxni kiriting'),
})

type FormData = z.infer<typeof schema>

const CITIES = ['Tashkent', 'Samarkand', 'Buxoro', 'Namangan', 'Andijon', "Farg'ona"]

const ClickMarker = ({ onMove }: { onMove: (lat: number, lng: number) => void }) => {
  useMapEvents({ click(e) { onMove(e.latlng.lat, e.latlng.lng) } })
  return null
}

const VenueSetup = () => {
  const { id } = useParams<{ id: string }>()
  const isEdit = !!id
  useTitle(isEdit ? 'Venue ni tahrirlash' : 'Yangi venue')
  const navigate = useNavigate()
  const user = useAuthStore(state => state.user)
  const { addToast } = useToastStore()

  const [position, setPosition] = useState<[number, number]>([41.2995, 69.2401])
  const [photos, setPhotos] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: getCategories })

  const { data: existingVenue } = useQuery({
    queryKey: ['venue', id],
    queryFn: () => getVenueById(id!),
    enabled: isEdit,
  })

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
      if (existingVenue.lat && existingVenue.lng) setPosition([existingVenue.lat, existingVenue.lng])
      if (existingVenue.photos?.length) setPhotos(existingVenue.photos)
    }
  }, [existingVenue])

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return
    setUploading(true)
    try {
      const ext = file.name.split('.').pop()
      const path = `${user.id}/${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage.from('venue-photos').upload(path, file)
      if (uploadError) throw uploadError
      const { data } = supabase.storage.from('venue-photos').getPublicUrl(path)
      setPhotos(prev => [...prev, data.publicUrl])
      addToast({ type: 'success', message: 'Rasm yuklandi' })
    } catch { addToast({ type: 'error', message: 'Rasm yuklanmadi' }) }
    setUploading(false)
  }

  const removePhoto = (index: number) => setPhotos(prev => prev.filter((_, i) => i !== index))

  const onSubmit = async (data: FormData) => {
    if (!user) return
    setSubmitting(true)
    const venueData = {
      owner_id: user.id,
      name: data.name,
      category_id: Number(data.category_id),
      description: data.description || undefined,
      address: data.address,
      city: data.city,
      lat: position[0],
      lng: position[1],
      phone: data.phone || undefined,
      photos,
      price_per_slot: Number(data.price_per_slot),
      currency: 'UZS',
      status: 'pending' as const,
    }
    try {
      if (isEdit && id) { await updateVenue(id, venueData); addToast({ type: 'success', message: 'Venue yangilandi' }) }
      else { await createVenue(venueData); addToast({ type: 'success', message: "Venue qo'shildi! Admin tekshiruvidan keyin faollashtiriladi" }) }
      navigate('/business/dashboard')
    } catch { addToast({ type: 'error', message: 'Xatolik yuz berdi' }) }
    setSubmitting(false)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{isEdit ? 'Venue ni tahrirlash' : "Yangi venue qo'shish"}</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
          <Input label="Nomi *" placeholder="Venue nomi" error={errors.name?.message} {...register('name')} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Kategoriya *</label>
            <select {...register('category_id')} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
              <option value="">Tanlang</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name_uz}</option>)}
            </select>
            {errors.category_id && <p className="mt-1 text-xs text-red-500">{errors.category_id.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Tavsif</label>
            <textarea {...register('description')} rows={3} placeholder="Venue haqida qisqacha..." className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Manzil *" placeholder="Ko'cha, uy" error={errors.address?.message} {...register('address')} />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Shahar *</label>
              <select {...register('city')} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Telefon" placeholder="+998901234567" {...register('phone')} />
            <Input label="Narx (so'm) *" placeholder="50000" error={errors.price_per_slot?.message} {...register('price_per_slot')} />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Joylashuv (xaritada bosing)</label>
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
          <label className="block text-sm font-medium text-gray-700 mb-3">Rasmlar</label>
          <div className="flex gap-3 flex-wrap">
            {photos.map((url, i) => (
              <div key={i} className="relative w-24 h-24 rounded-xl overflow-hidden border border-gray-200">
                <img src={url} alt="" className="w-full h-full object-cover" />
                <button type="button" onClick={() => removePhoto(i)} className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600">×</button>
              </div>
            ))}
            <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 hover:border-emerald-300 hover:text-emerald-600 transition-colors disabled:opacity-50">
              <Camera className="w-5 h-5" />
              <span className="text-xs mt-1">{uploading ? '...' : 'Yuklash'}</span>
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
          </div>
        </div>

        <div className="flex gap-3">
          <Button type="button" variant="secondary" onClick={() => navigate(-1)} className="flex-1">Bekor qilish</Button>
          <Button type="submit" loading={submitting} className="flex-1">{isEdit ? 'Yangilash' : "Qo'shish"}</Button>
        </div>
      </form>
    </div>
  )
}

export default VenueSetup

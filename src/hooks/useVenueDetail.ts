import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getVenueById } from '../api/venues'
import { getReviewsByVenue } from '../api/reviews'
import { getVenueStaff } from '../api/staff'
import { useAuthStore } from '../store/authStore'
import type { Slot, VenueService, StaffMember } from '../types'

export const useVenueDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const user = useAuthStore(state => state.user)

  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null)
  const [selectedService, setSelectedService] = useState<VenueService | null>(null)
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null)
  const [photoIndex, setPhotoIndex] = useState(0)

  const { data: venue, isLoading } = useQuery({
    queryKey: ['venue', id],
    queryFn: () => getVenueById(id!),
    enabled: !!id,
  })

  const { data: reviews = [] } = useQuery({
    queryKey: ['reviews', id],
    queryFn: () => getReviewsByVenue(id!),
    enabled: !!id,
  })

  const { data: staff = [] } = useQuery({
    queryKey: ['staff', id],
    queryFn: () => getVenueStaff(id!),
    enabled: !!id,
  })

  const services = venue?.services || []

  const effectivePrice = selectedService ? selectedService.price : (venue?.price_per_slot || 0)
  const effectiveUnit = selectedService
    ? selectedService.unit
    : venue?.pricing_unit || 'per_hour'

  const handleBook = () => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: `/venues/${venue!.id}` } } })
      return
    }
    if (selectedSlot) {
      const params = new URLSearchParams()
      if (selectedService) params.set('serviceId', selectedService.id)
      if (selectedStaff) params.set('staffId', selectedStaff.id)
      navigate(`/booking/${venue!.id}/${selectedSlot.id}?${params.toString()}`)
    }
  }

  return {
    id,
    venue,
    reviews,
    staff,
    isLoading,
    selectedSlot,
    selectedService,
    selectedStaff,
    photoIndex,
    effectivePrice,
    effectiveUnit,
    services,
    user,
    setSelectedSlot,
    setSelectedService,
    setSelectedStaff,
    setPhotoIndex,
    handleBook,
  }
}

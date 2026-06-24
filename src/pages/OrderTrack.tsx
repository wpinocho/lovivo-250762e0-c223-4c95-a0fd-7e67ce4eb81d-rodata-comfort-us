import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import OrderTrackUI from '@/pages/ui/OrderTrackUI'

const OrderTrack = () => {
  const { token } = useParams<{ token?: string }>()

  useEffect(() => {
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex,nofollow'
    document.head.appendChild(meta)
    return () => {
      document.head.removeChild(meta)
    }
  }, [])

  return <OrderTrackUI token={token} />
}

export default OrderTrack
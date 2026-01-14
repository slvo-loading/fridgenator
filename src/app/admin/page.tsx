'use client'
import { useRouter } from 'next/navigation'

export default function Admin() {
    const router = useRouter()
    return (
        <div>hi
            <button onClick={() => router.push('/dashboard')}>
                go to dashboard
            </button>
        </div>
    )
}
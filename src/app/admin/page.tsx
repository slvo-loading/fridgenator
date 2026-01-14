'use client'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useAuth } from '../lib/AuthContext'

export default function Admin() {
    const router = useRouter()
    const { isAdmin } = useAuth()

    useEffect(() => {
        if (!isAdmin) {
            router.push('/dashboard')
        }
    }, [])

    return (
        <div>hi
            <button onClick={() => router.push('/dashboard')}>
                go to dashboard
            </button>
        </div>
    )
}
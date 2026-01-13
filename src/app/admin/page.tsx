'use client'
import { useAuth } from '../lib/AuthContext'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Admin() {
    const { isAdmin } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!isAdmin) {
            router.push('/dashboard')
        }
    }, [])

    return (
        <div>
            admin page
        </div>
    )
}
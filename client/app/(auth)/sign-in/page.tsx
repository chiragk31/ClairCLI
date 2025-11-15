"use client";
import React from 'react'
import LoginForm from '@/components/login-form'
import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { Spinner } from '@/components/ui/spinner';

const Page = () => {
  const { data, isPending } = authClient.useSession()
  const router = useRouter();

  // Wait for loading
  if (isPending) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Spinner />
      </div>
    )
  }

  // If logged in → redirect to home/dashboard
  if (data?.session && data?.user) {
    router.push("/")
    return null
  }

  // If not logged in → show login form
  return <LoginForm />
}

export default Page

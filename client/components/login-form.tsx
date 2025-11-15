"use client";
import React from 'react'
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from './ui/button';
import { Card,CardContent } from './ui/card';
import { authClient } from '@/lib/auth-client';
import { useState } from 'react';
const LoginForm = () => {
    const router = useRouter();
    const [isLoading, setIsloading] = useState(false);
  return (
      <div className='flex flex-col gap-6 justify-center items-center'>

          <div className='flex flex-col items-center justify-center space-y-4'>
              
        <Image src={'/login.jpg'}  alt="login" height={300} width={300} />
              <h1 className='text-6xl font-extrabold text-indigo-400'> --Welcome to Clair Cli--</h1>
              <p className='text-base font-medium text-zinc-400 '>Login for allowing device flow</p>

      </div>
      <Card className='border-dashed border-2'>
        <CardContent>
          <div className='grid gap-6'>
            <div className='flex flex-col gap-4'>
              <Button variant={"outline"} className='w-full h-full'
                type='button' onClick={() => authClient.signIn.social({ provider: "github", callbackURL: "http://localhost:3000" })}>
                <Image src={"/github.svg"} alt='Github' height={16} width={16} className='size-4 dark:invert ' />
                continue with github

              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  )
}

export default LoginForm
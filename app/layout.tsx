"use client";

import type { Metadata } from 'next'
import { Josefin_Sans } from 'next/font/google'
import 'rsuite/dist/rsuite.min.css';
import './globals.css'
import { useEffect, useState } from 'react';
import * as fcl from "@onflow/fcl";
import Button from 'rsuite/Button';
import Link from 'next/link';

const dosis = Josefin_Sans({ subsets: ['latin'] })

const metadata: Metadata = {
  title: 'FlowNet AI',
  description: 'Created by @shashank42 and @parth',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState({loggedIn: null, addr: null});
  useEffect(() => {fcl.currentUser.subscribe(setUser)}, []);
  

  const logout = () => {
    fcl.unauthenticate();
  }

  const AuthedState = () => {
    return (
      <div style={{display: 'flex', flexDirection: 'column'}}>
        <Button style={{padding: 12, paddingLeft: 32, paddingRight: 32}} className='cta-button hover' onClick={logout}>LOGOUT</Button>
        <div style={{fontSize: 12}}>Address {user? `${user.addr}` : "No Address"}</div>
      </div>
    )
  }

  const UnauthenticatedState = () => {
    return (
      <div style={{display: 'flex'}}>
        <Button className='hover cta-button' style={{margin: 4, padding: 12, paddingLeft: 32, paddingRight: 32}} onClick={fcl.logIn}>LOG IN</Button>
      </div>
    )
  }

  return (
    <html lang="en">
      <head>
        <title>FlowNet AI</title>
      </head>
      <body className={dosis.className}>
        <>
        <div style={{display: 'flex', justifyContent: 'space-between', padding: 24}}>
          <div style={{display: 'flex', justifyContent: 'center', alignContent: 'center', alignItems: 'center'}}>
            <Link href="/"><h1 style={{color: 'black', fontWeight: 700}}>FLOWNET AI</h1></Link>
            <Link href="/recent" style={{marginLeft: 48, fontSize: 16, color: 'black'}}>Recent Generations</Link>
          </div>


          <div style={{display: 'flex', justifyContent: 'center', alignContent: 'center', alignItems: 'center'}}>              
            {user.loggedIn
              ? <AuthedState />
              : <UnauthenticatedState />
            }
          </div>
        </div>

          {children}
        </>
      </body>
    </html>
  )
}

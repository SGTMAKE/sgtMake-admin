import React from 'react'
import AdminQuotesPage from './helper'
import Nav from '@/components/nav/nav'

export default function Quotes() {
  return (
     <Nav>
    <div className=' dark:bg-dark'><AdminQuotesPage/></div>
    </Nav>
  )
}

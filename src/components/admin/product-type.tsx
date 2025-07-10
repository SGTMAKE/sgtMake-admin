import Link from 'next/link'
import React from 'react'
export default function ProductType({path}: {path?: string}) {
  return (
    <div className="flex py-2  gap-2 md:gap-4">
          <Link href="/dashboard/products"  className=" data-[state=active]:text-white rounded-md p-4 bg-orange-100 dark:bg-[#424242] " style={{backgroundColor: path?.includes('products') ? '#f97316' : ""}}>
            Basic Product
          </Link>
          <Link href="/dashboard/fasteners" className=" data-[state=active]:text-white rounded-md p-4 bg-orange-100 dark:bg-[#424242]" style={{backgroundColor: path?.includes('fasteners') ? '#f97316' : ""}}>
            Fastener
          </Link>
          <Link href="/dashboard/connectors-wires"  className=" data-[state=active]:text-white rounded-md p-4 bg-orange-100 dark:bg-[#424242]" style={{backgroundColor: path?.includes('connectors-wires') ? '#f97316' : ""}}>
            Connectors & Wires
          </Link>
        </div>
  )
}

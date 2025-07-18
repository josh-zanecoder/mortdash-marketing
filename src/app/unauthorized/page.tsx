'use client'

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { motion } from "framer-motion"
import { ExclamationTriangleIcon, ArrowLeftIcon } from "@heroicons/react/24/outline"

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-md p-8 shadow-xl bg-white/80 backdrop-blur-sm border-red-100">
          <div className="text-center space-y-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 150 }}
              className="w-20 h-20 mx-auto bg-red-50 rounded-full flex items-center justify-center"
            >
              <ExclamationTriangleIcon className="w-10 h-10 text-red-500" />
            </motion.div>

            <div className="space-y-3">
              <h1 className="text-3xl font-bold text-gray-900">Access Denied</h1>
              <p className="text-gray-600 max-w-sm mx-auto">
                You are not authorized to access this page. A valid token is required to proceed.
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Link href="/">
                <Button 
                  className="bg-black hover:bg-gray-800 text-white transition-all duration-200 flex items-center gap-2 mx-auto"
                >
                  <ArrowLeftIcon className="w-4 h-4" />
                  Return to Home
                </Button>
              </Link>
            </motion.div>
          </div>
        </Card>
      </motion.div>
    </div>
  )
} 
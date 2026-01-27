'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, X, Eye, EyeOff } from 'lucide-react'

export function AddLecturerDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    nic: '',
    phone: '',
    email: '',
    address: '',
    password: '',
    create_user_account: true, // Auto-create user account
  })
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate email if creating user account
    if (formData.create_user_account && !formData.email) {
      alert('Email is required to create user account')
      return
    }

    if (formData.create_user_account && !formData.password) {
      alert('Password is required to create user account')
      return
    }

    setLoading(true)

    const res = await fetch('/api/lecturers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })

    if (res.ok) {
      setOpen(false)
      setFormData({ 
        name: '', 
        nic: '', 
        phone: '', 
        email: '', 
        address: '',
        password: '',
        create_user_account: true
      })
      router.refresh()
      
      if (formData.create_user_account) {
        alert(`Lecturer created successfully!\n\nLogin credentials:\nEmail: ${formData.email}\nPassword: ${formData.password}\n\nPlease share these credentials securely.`)
      }
    } else {
      const error = await res.json()
      alert(error.error || 'Failed to create lecturer')
    }
    
    setLoading(false)
  }

  const generatePassword = () => {
    // Generate a random 8-character password
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
    let password = ''
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setFormData({ ...formData, password })
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4 mr-2" />
        Add Lecturer
      </Button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Add Lecturer</h2>
          <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Lecturer Information */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Lecturer Information</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Ahmed Mohamed"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  NIC Number <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.nic}
                  onChange={(e) => setFormData({ ...formData, nic: e.target.value })}
                  placeholder="e.g., 199012345678"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="e.g., 0771234567"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address (Optional)
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Full address"
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm min-h-[60px]"
                />
              </div>
            </div>
          </div>

          {/* User Account Section */}
          <div className="border-t pt-4">
            <div className="flex items-center gap-2 mb-3">
              <input
                type="checkbox"
                id="create_account"
                checked={formData.create_user_account}
                onChange={(e) => setFormData({ ...formData, create_user_account: e.target.checked })}
                className="rounded border-gray-300"
              />
              <label htmlFor="create_account" className="text-sm font-semibold text-gray-700">
                Create User Account for Login
              </label>
            </div>

            {formData.create_user_account && (
              <div className="space-y-4 bg-blue-50 p-4 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g., ahmed@example.com"
                    required={formData.create_user_account}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This will be used for login
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Enter password"
                      required={formData.create_user_account}
                      className="pr-20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-12 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={generatePassword}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Gen
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Click "Gen" to auto-generate a secure password
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Creating...' : 'Create Lecturer'}
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

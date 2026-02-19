import { Mail } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-md w-full text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
          <Mail className="text-orange-500" size={32} />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Revisa tu correo</h2>
        <p className="text-gray-500 text-sm mb-6">
          Te enviamos un enlace de verificación a tu correo electrónico.
          Haz clic en ese enlace para activar tu cuenta.
        </p>
        <Link
          to="/login"
          className="text-orange-600 font-medium hover:underline text-sm"
        >
          Volver al inicio de sesión
        </Link>
      </div>
    </div>
  )
}
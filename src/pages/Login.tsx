import { useTitle } from '../hooks/useTitle'

const Login = () => {
  useTitle('Login')

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <div className="w-full max-w-sm p-8">
        <h1 className="text-2xl font-semibold text-center">Login</h1>
      </div>
    </div>
  )
}

export default Login

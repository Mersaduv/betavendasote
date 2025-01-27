import { useRouter } from 'next/router'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'
import { useAppSelector } from '@/hooks'
import { useEffect } from 'react'

interface Props {
  children: React.ReactNode
  allowedRoles?: number[]
  isProfile?: boolean
}

const ProtectedRouteWrapper: React.FC<Props> = (props) => {
  // ? Props
  const { allowedRoles, children, isProfile } = props

  // ? Assets
  const { push, asPath } = useRouter()

  // ? Get UserInfo
  const { userInfo } = useAppSelector((state) => state.auth)
  // console.log(userInfo, '---------------')

  useEffect(() => {
    if (userInfo) {
      // Check if any of the user's roles are in the allowedRoles array
      const hasAccess = userInfo.userType

      if (hasAccess === 0 && !isProfile) {
        console.log('pass',isProfile)
        asPath.includes('/admin')
          ? push(`/admin/authentication/login?redirectTo=${asPath}`)
          : push(`/authentication/login?redirectTo=${asPath}`)
      }
    } else {
      asPath.includes('/admin')
        ? push(`/admin/authentication/login?redirectTo=${asPath}`)
        : push(`/authentication/login?redirectTo=${asPath}`)
    }
  }, [userInfo, allowedRoles, asPath, push])

  if (userInfo) {
    return <>{children}</>
  }

  return null
}

export default ProtectedRouteWrapper

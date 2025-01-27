import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import clsx from 'clsx'
import { IPermission } from '@/types'
import { useGetUserInfoMeQuery } from '@/services'

interface UserTabDashboardLayoutProps {
  children: ReactNode
}

const tabs = [
  { path: '/admin/users/personnel', label: 'پرسنل' },
  { path: '/admin/users/customer', label: 'مشتری' },
  { path: '/admin/users/supplier', label: 'فروشنده' },
]

const UserTabDashboardLayout: React.FC<UserTabDashboardLayoutProps> = ({ children }) => {
  const router = useRouter()
  const { pathname } = router
  const [permissions, setPermissions] = useState<IPermission[]>()
  
  // دریافت permissions از context یا API
  const { data: userData } = useGetUserInfoMeQuery()

  useEffect(() => {
    if (userData?.data?.userSpecification.role?.permissions) {
      setPermissions(userData.data.userSpecification.role.permissions)
    }
  }, [userData])

  const handleTabClick = useCallback(
    (path: string) => {
      router.push(path).catch((error) => {
        console.error('Failed to navigate:', error)
      })
    },
    [router]
  )

  const filteredTabs = useMemo(() => {
    return tabs.filter(tab => 
      permissions?.some(permission => permission.name === tab.label)
    )
  }, [permissions])

  const renderedTabs = useMemo(
    () =>
      filteredTabs.map((tab) => (
        <a
          key={tab.path}
          href={tab.path}
          onClick={(e) => {
            e.preventDefault()
            handleTabClick(tab.path)
          }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && handleTabClick(tab.path)}
          className={clsx(
            'px-3 py-2.5 whitespace-nowrap rounded-[10px] hover:shadow cursor-pointer text-sm',
            pathname.startsWith(tab.path) 
              ? 'bg-[#e90089] text-white hover:bg-[#cf057b]' 
              : 'bg-white text-black'
          )}
          aria-current={pathname.startsWith(tab.path) ? 'page' : undefined}
        >
          {tab.label}
        </a>
      )),
    [handleTabClick, pathname, filteredTabs]
  )

  
  // اگر در مسیری هستیم که دسترسی به آن نداریم، به اولین تب مجاز ریدایرکت کنیم
  useEffect(() => {
    const currentTabHasPermission = filteredTabs.some(tab => 
      pathname.startsWith(tab.path)
    )
    
    if (!currentTabHasPermission && filteredTabs.length > 0) {
      router.push(filteredTabs[0].path)
    }
  }, [pathname, filteredTabs, router])
  
  // اگر هیچ تبی با دسترسی وجود نداشت
  if (filteredTabs.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">شما دسترسی به این بخش را ندارید</p>
      </div>
    )
  }
  return (
    <div className="min-h-screen max-w-screen-2xl flex flex-col mx-auto w-full pt-7 relative">
      <nav className="fixed pt-[103px] top-0 z-50 max-w-screen-2xl w-full bg-[#f5f8fa] pb-3">
        <div className="py-4 overflow-auto flex gap-4 p-2 shadow-item mx-3 bg-white rounded-lg border-gray-200">
          {renderedTabs}
        </div>
      </nav>
      <div className="mt-[88px] mb-4 overflow-auto rounded-lg shadow-item mx-3 bg-white">
        {children}
      </div>
    </div>
  )
}

export default UserTabDashboardLayout
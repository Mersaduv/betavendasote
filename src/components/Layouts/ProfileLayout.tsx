import { roles } from '@/utils'
import { ProtectedRouteWrapper } from '@/components/user'
import { UserProfileAside } from '@/components/shared'
import { useAppSelector } from '@/hooks'

interface Props {
  children: React.ReactNode
  isProfile?:boolean
}

const ProfileLayout: React.FC<Props> = ({ children,isProfile }) => {
  const { isActive } = useAppSelector((state) => state.headerTextState)
  return (
    <>
    <ProtectedRouteWrapper isProfile={isProfile}>
      <div className={`lg:container md:flex  md:gap-x-6 md:px-3 pt-6   ${isActive ? 'sm:mt-32' : ''}`}>
        <div className="hidden md:block">
          <UserProfileAside />
        </div>
        <div className="h-fit flex-1 md:mt-10 rounded-md shadow-item ">
          {children}
        </div>
      </div>
    </ProtectedRouteWrapper>
    </>
  )
}
export default ProfileLayout

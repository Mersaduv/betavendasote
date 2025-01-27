export interface IPermission {
  id: string
  name: string
  isActive: boolean
  parentPermission: IPermission | null
  parentPermissionId: string
  childPermissions: IPermission[]
  created: string | null
  lastUpdated: string | null
}

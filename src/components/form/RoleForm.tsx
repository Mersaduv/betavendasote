import { Fragment, useEffect, useState } from 'react'

import { SubmitHandler, useForm, Resolver, Controller, Control, UseFormSetValue } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { Button, CloseIconButton, Combobox, DisplayError, TextField } from '@/components/ui'
import { IPermission, IRole, IRoleForm, IRoleRequest, IUser, IUserForm } from '@/types'
import { roleFormValidationSchema, userFormValidationSchema } from '@/utils'
import { useGetPermissionsQuery, useGetRolesQuery } from '@/services'
import { useAppDispatch } from '@/hooks'
import { showAlert } from '@/store'
import jalaali from 'jalaali-js'
import { digitsEnToFa } from '@persian-tools/persian-tools'
import { useRouter } from 'next/router'
import { FaRegCalendarAlt } from 'react-icons/fa'
import { Dialog, Transition } from '@headlessui/react'

interface CreateRoleFormProps {
  mode: 'create' | 'edit'
  createHandler: (data: IRoleRequest) => void
  updateHandler?: never
  selectedRole?: never
  isLoadingCreate: boolean
  isLoadingUpdate?: never
}

interface EditRoleFormProps {
  mode: 'edit'
  createHandler?: never
  updateHandler: (data: IRoleRequest) => void
  selectedRole: IRole
  isLoadingCreate?: never
  isLoadingUpdate: boolean
}
const toJalaali = (date: Date) => {
  const jalaaliDate = jalaali.toJalaali(date)
  return {
    day: jalaaliDate.jd,
    month: jalaaliDate.jm,
    year: jalaaliDate.jy,
  }
}
const currentDateJalaali = toJalaali(new Date())
const currentYearJalaali = currentDateJalaali.year
type Props = CreateRoleFormProps | EditRoleFormProps
const RoleForm: React.FC<Props> = (props) => {
  // ? Props
  const { mode, createHandler, isLoadingCreate, isLoadingUpdate, updateHandler, selectedRole } = props
  // assets
  const { query, back, push } = useRouter()
  // ? States
  const [isActive, setIsActive] = useState('true')

  // ? Queries
  const { data: permissionData } = useGetPermissionsQuery({ pageSize: 100, isTree: true })

  // ? Form Hook
  const {
    handleSubmit,
    register,
    reset,
    control,
    setValue,
    formState: { errors: formErrors, isValid },
  } = useForm<IRoleForm>({
    resolver: yupResolver(roleFormValidationSchema) as unknown as Resolver<IRoleForm>,
  })

  // ? Handlers
  const editedCreateHandler: SubmitHandler<IRoleForm> = (data) => {
    const formattedData: IRoleRequest = {
      id: selectedRole?.id,
      title: data.title,
      isActive: isActive === 'true',
      // فقط کلیدهایی که مقدارشان دقیقاً true است
      permissions: Object.keys(data.permissions || {}).filter((key) => data.permissions[key] === true),
    }
    console.log(data, 'datadatadata', formattedData)
    if (mode === 'edit' && selectedRole) {
      updateHandler(formattedData)
    } else {
      createHandler(formattedData)
    }
  }

  const handleChangeStatus = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setIsActive(event.target.value)
  }

  useEffect(() => {
    if (mode === 'edit' && selectedRole) {
      // تبدیل بولین به رشته برای isActive
      setIsActive(selectedRole.isActive.toString())

      // تبدیل آرایه permissions به آبجکت
      const initialPermissions = selectedRole.permissions.reduce(
        (acc: Record<string, boolean>, dataPer: IPermission) => {
          acc[dataPer.id] = true
          return acc
        },
        {} as Record<string, boolean>
      )

      // مقداردهی اولیه فرم
      reset({
        title: selectedRole.title,
        isActive: selectedRole.isActive.toString(), // رشته "true" یا "false"
        permissions: initialPermissions, // آبجکت permissions
      })
    }
  }, [selectedRole, mode, reset])
  // ? Re-render

  if (formErrors) {
    console.log(formErrors, 'formErrors')
  }
  return (
    <>
      <section>
        <form className="flex gap-4 flex-col p-7 px-4 mx-2" onSubmit={handleSubmit(editedCreateHandler)}>
          <div className="bg-white w-full rounded-md shadow-item">
            <h3 className="border-b p-6 text-gray-600 flex gap-2">{mode === 'edit' ? 'ویرایش سمت' : 'سمت جدید'} </h3>
            <div className="flex flex-col sm:flex-row gap-4 px-4">
              <div className="flex flex-col pt-6 w-full">
                <label htmlFor="title" className="mb-1.5">
                  <span className="whitespace-nowrap text-start">عنوان</span>
                </label>
                <input
                  className="w-full border border-gray-200 rounded-md "
                  type="text"
                  id="title"
                  {...register('title')}
                />
              </div>

              <div className="flex pt-6 flex-col w-full">
                <label htmlFor="isActive" className="mb-1.5">
                  <span className="whitespace-nowrap text-center">وضعیت  </span>
                </label>
                <select
                  className={`w-full text-center rounded-md border border-gray-300 ${
                    isActive === 'true' ? 'bg-green-100' : 'bg-red-100'
                  }`}
                  id="isActive"
                  value={isActive}
                  {...register('isActive', { onChange: handleChangeStatus })}
                >
                  <option value="false" className={isActive !== 'false' ? 'bg-white' : ''}>
                    غیر فعال
                  </option>
                  <option value="true" className={isActive !== 'true' ? 'bg-white' : ''}>
                    فعال
                  </option>
                </select>
              </div>
            </div>
            <div className="px-4 mt-8">
              <table className="w-[700px] md:w-full mx-auto">
                <thead className="bg-sky-300">
                  <tr>
                    <th className="text-sm py-3 px-2 text-gray-600 font-normal text-start">قسمت ها</th>
                    <th className="text-sm py-3 px-2 text-gray-600 font-normal text-start w-1/2">مجوز</th>
                  </tr>
                </thead>
                <tbody>
                  {permissionData?.data?.data?.map((permission) => (
                    <PermissionRow
                      key={permission.id}
                      permission={permission}
                      control={control}
                      level={0}
                      setValue={setValue}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="flex justify-end w-full">
            <div className="flex flex-col">
              <p className={`text-red-500 h-5 px-10 visible `}>{formErrors.title && formErrors.title.message}</p>
              <p className={`text-red-500 h-5 px-10 visible `}>
                {formErrors.permissions && formErrors.permissions?.root?.message}
              </p>
            </div>
            <div className=" w-fit">
              {' '}
              <Button
                isLoading={isLoadingCreate || isLoadingUpdate}
                type="submit"
                className={` px-11 py-3 ${!isValid ? 'bg-gray-300' : 'hover:bg-[#e90088c4] '}  `}
              >
                {mode === 'edit' ? 'بروزرسانی' : 'افزودن'}
              </Button>
            </div>
          </div>
        </form>
      </section>
    </>
  )
}
const PermissionRow = ({
  permission,
  level = 0,
  control,
  setValue,
}: {
  permission: IPermission
  level?: number
  control: Control<IRoleForm>
  parentId?: string | null
  setValue: UseFormSetValue<IRoleForm>
}) => {
  const paddingRight = level * 42 // افزایش تورفتگی بر اساس سطح

  return (
    <>
      <tr className={`h-16 border-b border-dashed ${level === 0 ? 'bg-blue-100' : 'even:bg-white'}`}>
        <td className={`text-start ${level === 0 && 'pr-2'}`}>
          <div className="text-sm px-2 flex items-center" style={{ paddingRight: `${paddingRight}px` }}>
            {permission.name}
          </div>
        </td>
        <td className="text-start">
          <Controller
            name={`permissions.${permission.id}`}
            control={control}
            render={({ field }) => (
              <input
                className="checked:bg-sky-500 checked:ring-0 checked:ring-offset-0 ring-0 ring-offset-0 outline-none checked:outline-none rounded-md w-[22.75px] h-[22.75px] text-2xl"
                type="checkbox"
                checked={field.value}
                onChange={(e) => {
                  const isChecked = e.target.checked
                  field.onChange(isChecked)

                  // تیک زدن پدر
                  if (isChecked && permission.parentPermissionId) {
                    setValue(`permissions.${permission.parentPermissionId}`, true)
                  }

                  // بروزرسانی فرزندان
                  const updateChildren = (permission: IPermission) => {
                    permission.childPermissions.forEach((child) => {
                      setValue(`permissions.${child.id}`, isChecked)
                      updateChildren(child)
                    })
                  }

                  updateChildren(permission)
                }}
              />
            )}
          />
        </td>
      </tr>

      {/* نمایش بازگشتی فرزندان */}
      {permission.childPermissions?.map((child) => (
        <PermissionRow
          key={child.id}
          permission={child}
          level={level + 1}
          control={control}
          parentId={permission.id}
          setValue={setValue}
        />
      ))}
    </>
  )
}
export default RoleForm

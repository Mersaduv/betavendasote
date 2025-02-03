import { useEffect, useRef, useState } from 'react'
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm } from 'react-hook-form'
import { BiRightArrowAlt } from 'react-icons/bi'

import { logInSchema } from '@/utils'

import { DisplayError, LoginButton } from '@/components/ui'

import type { ILoginForm } from '@/types'
import Link from 'next/link'
import { digitsEnToFa, digitsFaToEn } from '@persian-tools/persian-tools'
import React, { forwardRef } from 'react'
import { Control, FieldError, useController } from 'react-hook-form'
import { useGetRedirectsQuery } from '@/services'
import { useAppSelector } from '@/hooks'

interface Props {
  onSubmit: (data: ILoginForm) => void
  mobileNumber: string
  isLoading: boolean
}

interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  classStyle?: string | null
  label?: string
  errors?: FieldError | undefined
  name: string
  control: Control<any>
}
interface PassCodeForm {
  password: string
}
const LoginUserForm: React.FC<Props> = (props) => {
  const { onSubmit, isLoading, mobileNumber } = props
  const { generalSetting } = useAppSelector((state) => state.design)
  const { data: redirectData, isLoading: isLoadingRedirect, isError: isErrorRedirect } = useGetRedirectsQuery()

  const {
    handleSubmit,
    control,
    formState: { errors: formErrors },
  } = useForm<PassCodeForm>({
    resolver: yupResolver(logInSchema),
    defaultValues: { password: '' },
  })

  const passwordRef = useRef<HTMLInputElement>(null)

  const onSubmitHandler = ({ password }: PassCodeForm) => {
    console.log(password, 'password---password')
    const passwordEn = digitsFaToEn(password)
    onSubmit({ password: passwordEn, mobileNumber })
  }

  return (
    <form className="space-y-0.5" onSubmit={handleSubmit(onSubmitHandler)}>
      <h2 className="text-gray-300 text-base text-center pb-6">رمز خود را وارد کنید</h2>
      <TextField
        control={control}
        errors={formErrors.password}
        type="password"
        name="password"
        classStyle="rounded-3xl text-center shadow-lg "
        ref={passwordRef}
      />
      <LoginButton
        className="mx-auto w-full rounded-3xl py-2 bg-[#f792ce] border-2 border-[#e90089] hover:bg-[#e90089]"
        isLoading={isLoading}
      >
        تایید
      </LoginButton>

      <div className="pt-2 flex items-center ">
        <p className="ml-1 inline text-gray-800 text-sm mt-6">رمز عبور رو فراموش کردی؟</p>
        <div className="text-blue-400 text-sm mt-6">فراموشی رمز عبور</div>
      </div>
    </form>
  )
}

const TextField = forwardRef<HTMLInputElement, FieldProps>((props, ref) => {
  const { classStyle, label, errors, name, type = 'text', control, ...restProps } = props

  const { field } = useController({ name, control, rules: { required: true } })

  const direction = /^[a-zA-Z0-9]+$/.test(field.value?.[0]) ? 'ltr' : 'ltr'
  const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value

    // فیلتر کردن کاراکترهای غیر عددی
    const filteredValue = inputValue.replace(/[^0-9۰-۹]/g, '')

    // تبدیل اعداد انگلیسی به فارسی
    const faInputValue = digitsEnToFa(filteredValue)

    field.onChange(faInputValue)
  }

  return (
    <div>
      {label && (
        <label className="mb-3 block text-xs text-gray-700 md:min-w-max lg:text-sm" htmlFor={name}>
          {label}
        </label>
      )}
      <input
        className={`block appearance-none focus:outline-none outline-none ring-0 focus:ring-0 w-full ${
          classStyle ? classStyle : 'rounded-md bg-zinc-100'
        } border border-gray-200  px-3 py-1.5 text-base outline-none transition-colors placeholder:text-center focus:border-[#ffb9e2] lg:text-lg`}
        style={{ direction }}
        id={name}
        type="tel"
        value={field?.value}
        name={field.name}
        onBlur={field.onBlur}
        onChange={onChangeHandler}
        ref={ref}
        {...restProps}
      />
      <DisplayError errors={errors} />
    </div>
  )
})

export default LoginUserForm

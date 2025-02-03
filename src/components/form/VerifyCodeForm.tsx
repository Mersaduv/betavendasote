import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { yupResolver } from '@hookform/resolvers/yup'

import React, { useRef } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { ILoginForm, MobileNumberFormValues } from '@/types'
import { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { SerializedError } from '@reduxjs/toolkit'
import { DisplayError, LoginButton } from '../ui'

interface Props {
  onSubmit: (data: ILoginForm) => void
  resendHandler: (data: MobileNumberFormValues) => void
  isLoading: boolean
  mobileNumber: string
}
interface CodeFormArray {
  code: string[]
}
const VerifyCodeForm: React.FC<Props> = ({ onSubmit, isLoading, resendHandler, mobileNumber }) => {
  const { control, handleSubmit, setValue, getValues } = useForm<CodeFormArray>({
    defaultValues: { code: ['', '', '', ''] },
  })

  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const [timeLeft, setTimeLeft] = useState(120)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const startTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    setTimeLeft(120)
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  useEffect(() => {
    startTimer()
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])
  const handleChange = (value: string, index: number) => {
    const sanitizedValue = value.slice(0, 1)
    setValue(`code.${index}`, sanitizedValue)

    if (sanitizedValue && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1]?.focus()
    }

    // Check if all fields are filled
    const allFieldsFilled = Array.from({ length: 4 }).every((_, idx) => getValues(`code.${idx}`))
    if (allFieldsFilled) {
      handleSubmit(onSubmitHandler)()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !getValues(`code.${index}`) && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>, index: number) => {
    const pastedValue = e.clipboardData.getData('Text')

    if (pastedValue.length === 4) {
      pastedValue.split('').forEach((char, idx) => {
        setValue(`code.${idx}`, char)
      })

      inputRefs.current[5]?.focus()

      handleSubmit(onSubmitHandler)()
    }
  }

  const onSubmitHandler = (data: CodeFormArray) => {
    const codeString = data.code.join('')
    onSubmit({ password: codeString, mobileNumber })
  }
  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  return (
    <div className="pt-1">
      <form
        dir="ltr"
        onSubmit={handleSubmit(onSubmitHandler)}
        className="flex flex-col  justify-center items-center mx-auto"
      >
        {/* <div className="my-4">
          <DisplayError errorVerification={errorVerification} />
          {isSuccess && DisplaySuccess()}
        </div> */}
        <div className="flex space-x-[15px] w-full justify-center">
          {Array.from({ length: 4 }).map((_, index) => {
            const value = getValues(`code.${index}`)
            return (
              <Controller
                key={index}
                name={`code.${index}`}
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="tel"
                    inputMode="numeric"
                    maxLength={1}
                    dir="ltr"
                    className={`w-[50px] h-[42px] font-bold farsi-digits text-center text-xl focus:ring-0 focus:outline-none focus:ring-offset-0 focus:border-none border-white border-b-[#ccc] border-2`}
                    ref={(el) => {
                      inputRefs.current[index] = el
                    }}
                    onChange={(e) => handleChange(e.target.value, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    onPaste={(e) => handlePaste(e, index)}
                  />
                )}
              />
            )
          })}
        </div>
        <LoginButton
          className="w-full rounded-3xl h-[38px] mt-7 bg-[#f792ce] border-2 border-[#e90089] hover:bg-[#e90089]"
          isLoading={isLoading}
        >
          تایید
        </LoginButton>
        <div className="flex flex-row-reverse items-center gap-x-1 mt-1 mb-14 w-full">
          {timeLeft > 0 ? (
            <div className="farsi-digits flex gap-1 text-sm" style={{ color: 'red' }}>
              {`تا ارسال مجدد کد`} <div className="text-sm">{formattedTime}</div>
            </div>
          ) : (
            <div
              onClick={() => {
                resendHandler({ mobileNumber })
                startTimer()
              }}
              className="font-normal cursor-pointer text-sm text-sky-500"
            >
              ارسال مجدد کد
            </div>
          )}
        </div>
      </form>
    </div>
  )
  // ? local components
  //   function DisplaySuccess() {
  //     return (
  //       <div dir="rtl" className="bg-[#D5FDEF] mt-1.5 flex items-center justify-center rounded-md px-3 py-2 text-sm">
  //         <span className="text-[#0EBE7F] font-normal">با موفقیت وارد شدید!</span>
  //       </div>
  //     )
  //   }
}

export default VerifyCodeForm

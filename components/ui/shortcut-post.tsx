'use client'

import React, {
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Messages } from '#/get-dictionary'
import { Loader, Loader2 } from 'lucide-react'
import { useFormState, useFormStatus } from 'react-dom'
import { useForm, useFormContext } from 'react-hook-form'
import * as z from 'zod'

import { getShortcutByiCloud } from '#/lib/actions'
import { useLocale } from '#/components/i18n'

import { Button } from './button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './form'
import { Input } from './input'
import PageDrawer from './page-drawer'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select'
import { Switch } from './switch'
import { Textarea } from './textarea'

export interface ShortcutPostProps {
  messages: Messages
  drawer?: boolean
}

const icloudSchema = z.object({
  icloud: z
    .string()
    .url()
    .startsWith(
      'https://www.icloud.com/shortcuts/',
      'must be start with https://www.icloud.com/shortcuts/',
    )
    .regex(/\/[0-9a-f]{32}\/?$/, 'iCloud url is broken'),
})

const shortcutSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  icon: z.string().optional(),
  backgroundColor: z.string(),
  details: z.array(
    z.enum([
      'SHARE_SHEET',
      'APPLE_WATCH',
      'MENU_BAR_ON_MAC',
      'QUICK_ACTIONS_ON_MAC',
      'RECEIVES_SCREEN',
    ]),
  ),
  language: z.string(),
})

const formSchema = z.intersection(icloudSchema, shortcutSchema)

type FormSchemaType = z.infer<typeof formSchema>

interface FormHandler {
  submit: () => void
}

const details = [
  {
    label: '',
    value: ['SHARE_SHEET'],
  },
  {
    label: 'Apple Watch',
    value: ['APPLE_WATCH'],
  },
  {
    label: 'Mac',
    value: ['MENU_BAR_ON_MAC', 'RECEIVES_SCREEN', 'QUICK_ACTIONS_ON_MAC'],
  },
] as const

type FormStatus = ReturnType<typeof useFormStatus>
type FormStatusContextValue = {
  status: FormStatus
  setStatus: (pending: FormStatus) => void
}

const FormStatusContext = createContext<FormStatusContextValue>(
  {} as FormStatusContextValue,
)

const initialState = { message: '', errors: {} }

const SubmitButton = React.forwardRef<React.ElementRef<'button'>>(
  function SubmitButton(props, ref) {
    const status = useFormStatus()

    const { setStatus } = useContext(FormStatusContext)
    useEffect(() => {
      setStatus(status)
    }, [setStatus, status])

    return (
      <button
        ref={ref}
        type="submit"
        className="sr-only"
        aria-disabled={status.pending}
      >
        Submit
      </button>
    )
  },
)

const FormComponent = forwardRef<FormHandler, { messages: Messages }>(
  function FormComponent({ messages }, ref) {
    const form = useFormContext<FormSchemaType>()
    const [state, dispatch] = useFormState(getShortcutByiCloud, initialState)

    const handleAction = async (formData: FormData) => {
      const isValid = await form.trigger()
      if (!isValid) return
      await dispatch(formData)
    }

    useEffect(() => {
      if (!state.data) return

      // fill the form with data from icloud
      form.setValue('name', state.data.fields.name.value)
      form.setValue(
        'backgroundColor',
        state.data.fields.icon_color.value.toString(),
      )

      if (state.data.recordType === 'SharedShortcut') {
        form.setValue('icon', state.data.fields.icon.value.downloadURL)
      }

      if (state.data.recordType === 'GalleryShortcut') {
        form.setValue('description', state.data.fields.longDescription.value)
        form.setValue('language', state.data.fields.language.value)
      }
    }, [form, state.data])

    const buttonRef = useRef<React.ElementRef<'button'> | null>(null)

    // useImperativeHandle is used to expose the submit function
    useImperativeHandle(
      ref,
      () => {
        return {
          submit: () => {
            buttonRef.current?.click()
          },
        }
      },
      [],
    )

    return (
      <form
        action={handleAction}
        className="flex-1 space-y-8 overflow-y-auto p-safe-max-4"
      >
        <FormField
          control={form.control}
          name="icloud"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  variant="ios"
                  autoComplete="off"
                  placeholder={messages['icloud-link']}
                  {...field}
                />
              </FormControl>
              <FormDescription className="px-3">
                {messages['share-through-icloud']}
                <a
                  className="ml-1 text-blue-500 active:text-blue-500/80"
                  href="https://support.apple.com/guide/shortcuts/share-shortcuts-apdf01f8c054/ios"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {messages['share-on-iphone-or-ipad']}
                </a>
                <a
                  className="ml-1 text-blue-500 active:text-blue-500/80"
                  href="https://support.apple.com/guide/shortcuts-mac/share-shortcuts-apdf01f8c054/mac"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {messages['share-on-mac']}
                </a>
              </FormDescription>
              <FormMessage className="px-3" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  variant="ios"
                  autoComplete="off"
                  placeholder="New Shortcut"
                  {...field}
                />
              </FormControl>
              <FormMessage className="px-3" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea
                  placeholder="Tell us a little bit about this shortcut"
                  className="resize-none"
                  variant="ios"
                  {...field}
                />
              </FormControl>
              <FormMessage className="px-3" />
            </FormItem>
          )}
        />

        {/* {details.map((item) => (
          <FormField
            key={item.label}
            control={form.control}
            name="details"
            render={() => (
              <FormItem className="px-3">
                {item.label && <FormDescription>{item.label}</FormDescription>}
                {item.value.map((item) => (
                  <FormField
                    key={item}
                    control={form.control}
                    name="details"
                    render={({ field }) => (
                      <FormItem key={item}>
                        <div className="flex items-center justify-between">
                          <FormLabel>{messages.details[item]}</FormLabel>
                          <FormControl>
                            <Switch
                              checked={field.value.includes(item)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value, item])
                                  : field.onChange(
                                      field.value.filter(
                                        (value) => value !== item,
                                      ),
                                    )
                              }}
                            />
                          </FormControl>
                        </div>
                      </FormItem>
                    )}
                  />
                ))}
                <FormMessage className="px-3" />
              </FormItem>
            )}
          />
        ))} */}

        <FormField
          control={form.control}
          name="language"
          render={({ field }) => (
            <FormItem>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a verified email to display" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="zh_CN">zh_CN</SelectItem>
                  <SelectItem value="en">en</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription className="px-3">
                You can manage email addresses in your
              </FormDescription>
              <FormMessage className="px-3" />
            </FormItem>
          )}
        />

        <SubmitButton ref={buttonRef} />
      </form>
    )
  },
)

export default function ShortcutPost({
  messages,
  drawer = false,
}: ShortcutPostProps) {
  const { locale: language } = useLocale()

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      icloud: '',
      name: '',
      description: '',
      icon: '',
      backgroundColor: '',
      details: [],
      language,
    },
  })

  const formRef = useRef<FormHandler | null>(null)
  const submit = () => {
    formRef.current?.submit()
  }

  const [status, setStatus] = useState<FormStatus>({
    pending: false,
  } as FormStatus)
  return (
    <Form {...form}>
      {drawer ? (
        <FormStatusContext.Provider value={{ status, setStatus }}>
          <Drawer messages={messages.common} submit={submit}>
            <FormComponent messages={messages} ref={formRef} />
          </Drawer>
        </FormStatusContext.Provider>
      ) : (
        <FormComponent messages={messages} />
      )}
    </Form>
  )
}

function NextButton({
  messages,
  submit,
}: {
  messages: Messages['common']
  submit: FormHandler['submit']
}) {
  const { trigger } = useFormContext<FormSchemaType>()
  const [isLastStep, setIsLastStep] = useState(false)
  const {
    status: { pending, data },
  } = useContext(FormStatusContext)
  const { formState, getValues } = useFormContext<FormSchemaType>()

  useEffect(() => {
    // check icloud field is dirty
    // if server actions return value equals form icloud value then set isLastStep to true
    if (
      !formState.dirtyFields.icloud &&
      data?.get('icloud') === getValues('icloud')
    ) {
      setIsLastStep(true)
    } else {
      setIsLastStep(false)
    }
  }, [data, formState.dirtyFields, getValues])

  const onClick = async () => {
    const isValid = await trigger('icloud', { shouldFocus: true })
    if (!isValid) return

    submit()
  }

  return (
    <Button
      variant="ios"
      size="auto"
      type="submit"
      onClick={onClick}
      disabled={pending}
    >
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {isLastStep ? messages.done : messages.next}
    </Button>
  )
}

const snapPoints = [0.6, 1]

function Drawer({
  messages,
  submit,
  children,
}: {
  messages: Messages['common']
  submit: FormHandler['submit']
  children: React.ReactNode
}) {
  const [snap, setSnap] = useState<number | string | null>(snapPoints[0])

  const onNext = () => {
    const lastPoint = snapPoints[snapPoints.length - 1]
    if (snap === lastPoint) return false
    const nextIndex = snapPoints.findIndex((_snap) => _snap === snap) + 1
    setSnap(snapPoints[nextIndex])
    return nextIndex === snapPoints.length - 1
  }

  return (
    <PageDrawer
      snapPoints={snapPoints}
      fadeFromIndex={0}
      activeSnapPoint={snap}
      setActiveSnapPoint={setSnap}
      messages={messages}
      className="flex h-full max-h-[96%] flex-col"
      header={<NextButton messages={messages} submit={submit} />}
    >
      {children}
    </PageDrawer>
  )
}

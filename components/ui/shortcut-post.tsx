'use client'

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Messages } from '#/get-dictionary'
import {
  SubmitHandler,
  useForm,
  useFormContext,
  useWatch,
} from 'react-hook-form'
import * as z from 'zod'

import { ShortcutRecord } from '#/app/api/icloud/[uuid]/shortcut'

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
    ),
})

const shortcutSchema = z.object({
  icloud: z.string().url(),
  name: z.string(),
  description: z.string(),
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
  language: z.enum(['zh_CN', 'en']),
})

const formSchema = z.union([icloudSchema, shortcutSchema])

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

const FormComponent = forwardRef<FormHandler, { messages: Messages }>(
  function FormComponent({ messages }, ref) {
    const form = useFormContext<FormSchemaType>()

    const onSubmit: SubmitHandler<FormSchemaType> = async (values) => {
      const uuid = getShortcutUUIDFromPath(values.icloud)
      if (!uuid) return

      const res = await fetch(`/api/shortcut/icloud/${uuid}`)
      if (!res.ok) {
        throw new Error('Failed to fetch data')
      }
      const data: ShortcutRecord = await res.json()
    }

    const buttonRef = useRef<React.ElementRef<'button'> | null>(null)

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
        onSubmit={form.handleSubmit(onSubmit)}
        className="p-safe-max-4 flex-1 space-y-8 overflow-y-auto"
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

        {details.map((item) => (
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
                                      field.value?.filter(
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
        ))}

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

        <button ref={buttonRef} type="submit" className="sr-only">
          Submit
        </button>
      </form>
    )
  },
)

function getShortcutUUIDFromPath(path: string) {
  const segments = path.split('/')
  const last = segments[segments.length - 1]
  if (last.match(/[0-9a-f]{32}/)) return last
}

export default function ShortcutPost({
  messages,
  drawer = false,
}: ShortcutPostProps) {
  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      icloud: '',
      name: '',
      description: '',
      icon: '',
      backgroundColor: '',
      details: [],
      language: undefined,
    },
  })

  const formRef = useRef<FormHandler | null>(null)
  const submit = () => {
    formRef.current?.submit()
  }

  return (
    <Form {...form}>
      {drawer ? (
        <Drawer messages={messages.common} submit={submit}>
          <FormComponent messages={messages} ref={formRef} />
        </Drawer>
      ) : (
        <FormComponent messages={messages} />
      )}
    </Form>
  )
}

function NextButton({
  onNext,
  messages,
}: {
  onNext: () => boolean
  messages: Messages['common']
}) {
  const { trigger, control } = useFormContext<FormSchemaType>()
  const [disabled, setDisabled] = useState(true)
  const [isLastStep, setIsLastStep] = useState(false)

  const icloud = useWatch({
    control,
    name: 'icloud',
    defaultValue: '',
  })

  useEffect(() => {
    setDisabled(!icloud)
  }, [icloud])

  const onClick = async () => {
    const isValid = await trigger('icloud', { shouldFocus: true })

    if (!isValid) return
    const isLastStep = onNext()
    setIsLastStep(isLastStep)
  }

  return (
    <button
      className="text-blue-500 active:text-blue-500/80 disabled:text-zinc-300 dark:disabled:text-zinc-700"
      onClick={onClick}
      disabled={disabled}
    >
      {isLastStep ? messages.done : messages.next}
    </button>
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

  // when snap is last point emit submit
  useEffect(() => {
    const lastPoint = snapPoints[snapPoints.length - 1]
    if (snap === lastPoint) submit()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snap])

  return (
    <PageDrawer
      snapPoints={snapPoints}
      fadeFromIndex={0}
      activeSnapPoint={snap}
      setActiveSnapPoint={setSnap}
      messages={messages}
      className="flex h-full max-h-[96%] flex-col"
      header={<NextButton onNext={onNext} messages={messages} />}
    >
      {children}
    </PageDrawer>
  )
}

// studio/actions/cancelEventAction.tsx
import {useCallback, useMemo, useState} from 'react'
import type {DocumentActionComponent, DocumentActionProps} from 'sanity'
import {useDocumentOperation} from 'sanity'
import {Button, Card, Checkbox, Flex, Stack, Text, TextArea, useToast} from '@sanity/ui'

type CancelEventInfo = {
  id?: string
  title?: string
  status?: string
}

type CancelResultOk = {
  ok: true
  dryRun?: boolean
  ms?: number
  event?: CancelEventInfo
  paidOrdersFound?: number
  refundedCount?: number
  failedCount?: number
  wouldRefundOrders?: string[]
}

type CancelResultErr = {
  ok: false
  error: string
}

type CancelResult = CancelResultOk | CancelResultErr

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null
}

function isCancelResult(v: unknown): v is CancelResult {
  if (!isRecord(v)) return false
  if (v.ok === true) return true
  if (v.ok === false && typeof v.error === 'string') return true
  return false
}

function getErrorMessage(e: unknown): string {
  if (e instanceof Error) return e.message
  if (typeof e === 'string') return e
  return 'Unknown error'
}

function getEnv(key: string): string {
  // Vite exposes studio env vars on import.meta.env
  const env = import.meta.env as Record<string, string | undefined>
  return env[key] ?? ''
}

function getApiBase(): string {
  return (getEnv('SANITY_STUDIO_CANCEL_API_BASE') || 'https://www.junglebirdtikiyyc.com').replace(
    /\/+$/,
    '',
  )
}

function getToken(): string {
  return getEnv('SANITY_STUDIO_ADMIN_CANCEL_EVENT_TOKEN') || ''
}

// Uppercase function name => passes react-hooks/rules-of-hooks
const CancelEventAction: DocumentActionComponent = (props: DocumentActionProps) => {
  const {id, type, published} = props

  const toast = useToast()
  const {patch, publish} = useDocumentOperation(id, type)

  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('Event cancelled')
  const [dryRun, setDryRun] = useState(true)
  const [alsoCancelInSanity, setAlsoCancelInSanity] = useState(true)
  const [loading, setLoading] = useState(false)

  const disabled = useMemo(() => {
    if (type !== 'event') return true
    if (!published?._id) return true
    return false
  }, [type, published])

  const onConfirm = useCallback(async () => {
    const token = getToken()
    if (!token) {
      toast.push({
        status: 'error',
        title: 'Missing studio token',
        description: 'SANITY_STUDIO_ADMIN_CANCEL_EVENT_TOKEN is not set.',
      })
      return
    }

    setLoading(true)
    try {
      const apiBase = getApiBase()
      const res = await fetch(`${apiBase}/api/admin/cancel-events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          sanityEventId: published!._id,
          reason: reason.trim() || 'Event cancelled',
          dryRun,
        }),
      })

      const raw: unknown = await res.json().catch(() => null)

      if (!res.ok || !isCancelResult(raw) || raw.ok === false) {
        const apiError = isRecord(raw) && typeof raw.error === 'string' ? raw.error : null
        toast.push({
          status: 'error',
          title: 'Cancel/refund failed',
          description: apiError || `HTTP ${res.status}`,
        })
        return
      }

      const data: CancelResultOk = raw

      // Optionally keep Sanity aligned after real run
      if (!dryRun && alsoCancelInSanity) {
        patch.execute([{set: {status: 'cancelled'}}])
        publish.execute()
      }

      const wouldRefundCount = Array.isArray(data.wouldRefundOrders)
        ? data.wouldRefundOrders.length
        : (data.paidOrdersFound ?? 0)

      toast.push({
        status: 'success',
        title: dryRun ? 'Dry run complete' : 'Cancellation started',
        description: dryRun
          ? `Would refund ${wouldRefundCount} paid order(s).`
          : `Refunded ${data.refundedCount ?? 0}, failed ${data.failedCount ?? 0}.`,
      })

      setOpen(false)
    } catch (e: unknown) {
      toast.push({
        status: 'error',
        title: 'Request failed',
        description: getErrorMessage(e),
      })
    } finally {
      setLoading(false)
    }
  }, [alsoCancelInSanity, dryRun, patch, publish, published, reason, toast])

  return {
    label: 'Cancel + refund',
    disabled,
    tone: 'critical',
    onHandle: () => setOpen(true),
    dialog: open
      ? {
          type: 'dialog',
          header: dryRun ? 'Dry run: Cancel + refund' : 'Cancel + refund',
          width: 'medium',
          onClose: () => setOpen(false),
          content: (
            <Card padding={4}>
              <Stack space={4}>
                <Text size={1}>
                  This will call your site endpoint and (optionally) mark this Sanity event as{' '}
                  <strong>cancelled</strong>.
                </Text>

                <Stack space={2}>
                  <Text size={1} weight="semibold">
                    Reason (included in DB + emails)
                  </Text>
                  <TextArea
                    rows={3}
                    value={reason}
                    onChange={(e) => setReason(e.currentTarget.value)}
                  />
                </Stack>

                <Flex gap={3} align="center">
                  <Checkbox checked={dryRun} onChange={(e) => setDryRun(e.currentTarget.checked)} />
                  <Text size={1}>Dry run (no refunds, no DB changes)</Text>
                </Flex>

                <Flex gap={3} align="center">
                  <Checkbox
                    checked={alsoCancelInSanity}
                    disabled={dryRun}
                    onChange={(e) => setAlsoCancelInSanity(e.currentTarget.checked)}
                  />
                  <Text size={1}>Also set this Sanity event status to “cancelled”</Text>
                </Flex>

                <Flex gap={3} justify="flex-end">
                  <Button
                    text="Close"
                    mode="ghost"
                    onClick={() => setOpen(false)}
                    disabled={loading}
                  />
                  <Button
                    text={loading ? 'Working…' : dryRun ? 'Run dry run' : 'Cancel + refund'}
                    tone="critical"
                    onClick={onConfirm}
                    disabled={loading}
                  />
                </Flex>
              </Stack>
            </Card>
          ),
        }
      : null,
  }
}

// Keep your existing export name so you don’t have to change imports elsewhere
export const cancelEventAction: DocumentActionComponent = CancelEventAction

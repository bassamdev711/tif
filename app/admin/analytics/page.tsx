'use client'

import { useEffect, useState, type ReactNode } from 'react'
import {
  Activity,
  AlertTriangle,
  BarChart,
  CheckCircle2,
  Database,
  Eye,
  Gauge,
  ImageIcon,
  Info,
  MessageCircle,
  Phone,
  Server,
  Settings2,
  ShoppingBag,
  Users,
} from 'lucide-react'
import { createUsagePlan, getAnalyticsData, saveManualSubscription, saveUsagePlan } from './actions'

type ResourceKey = 'database' | 'blob' | 'bandwidth'
type ResourceData = {
  resource: ResourceKey
  usedBytes: number
  limitBytes: number
  source: string
  confidence: string
}
type PlanDraft = {
  id: string
  name: string
  slug: string
  price: string
  currencyCode: string
  databaseGB: string
  blobGB: string
  bandwidthGB: string
  sortOrder: string
  isActive: boolean
}

type AnalyticsData = {
  success: true
  visits: { today: number; todayViews: number; month: number; total: number }
  usage: {
    subscription: { planId: string; status: string; startedAt: Date | string; renewsAt: Date | string | null; graceUntil: Date | string | null; notes: string | null }
    plan: { id: string; name: string; slug: string; price: string; currencyCode: string }
    resources: ResourceData[]
    availablePlans: Array<{
      id: string
      name: string
      slug: string
      price: string
      currencyCode: string
      sortOrder: number
      isActive: boolean
      databaseLimitBytes: number
      blobLimitBytes: number
      bandwidthLimitBytes: number
    }>
  }
  contact: { phoneNumber: string | null; whatsappNumber: string | null }
}

const resourceMeta: Record<ResourceKey, { label: string; description: string; icon: ReactNode }> = {
  database: { label: 'قاعدة البيانات', description: 'حجم PostgreSQL المقاس فعليًا', icon: <Database size={22} /> },
  blob: { label: 'الصور والملفات', description: 'حجم Vercel Blob المسجل/المزامن', icon: <ImageIcon size={22} /> },
  bandwidth: { label: 'نقل البيانات', description: 'تقدير داخلي من مشاهدات الصفحات', icon: <Server size={22} /> },
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [savingSubscription, setSavingSubscription] = useState(false)
  const [subscriptionMessage, setSubscriptionMessage] = useState<string | null>(null)
  const [subscriptionError, setSubscriptionError] = useState<string | null>(null)
  const [planId, setPlanId] = useState('')
  const [subscriptionStatus, setSubscriptionStatus] = useState('ACTIVE')
  const [startedAt, setStartedAt] = useState('')
  const [renewsAt, setRenewsAt] = useState('')
  const [graceUntil, setGraceUntil] = useState('')
  const [subscriptionNotes, setSubscriptionNotes] = useState('')
  const [planDrafts, setPlanDrafts] = useState<Record<string, PlanDraft>>({})
  const [newPlan, setNewPlan] = useState<Omit<PlanDraft, 'id'>>({ name: '', slug: '', price: '', currencyCode: 'USD', databaseGB: '1', blobGB: '5', bandwidthGB: '100', sortOrder: '10', isActive: true })
  const [savingPlanId, setSavingPlanId] = useState<string | null>(null)
  const [planMessage, setPlanMessage] = useState<string | null>(null)
  const [planError, setPlanError] = useState<string | null>(null)

  useEffect(() => {
    getAnalyticsData().then((result) => {
      if (result.success) {
        const analytics = result as AnalyticsData
        setData(analytics)
        setPlanDrafts(Object.fromEntries(analytics.usage.availablePlans.map((plan) => [plan.id, {
          id: plan.id,
          name: plan.name,
          slug: plan.slug,
          price: plan.price,
          currencyCode: plan.currencyCode,
          databaseGB: bytesToGBValue(plan.databaseLimitBytes),
          blobGB: bytesToGBValue(plan.blobLimitBytes),
          bandwidthGB: bytesToGBValue(plan.bandwidthLimitBytes),
          sortOrder: String(plan.sortOrder),
          isActive: plan.isActive,
        }])))
        setPlanId(analytics.usage.subscription.planId)
        setSubscriptionStatus(analytics.usage.subscription.status)
        setStartedAt(toLocalDateTime(analytics.usage.subscription.startedAt))
        setRenewsAt(toLocalDateTime(analytics.usage.subscription.renewsAt))
        setGraceUntil(toLocalDateTime(analytics.usage.subscription.graceUntil))
        setSubscriptionNotes(analytics.usage.subscription.notes || '')
      }
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const refreshAnalytics = async () => {
    const refreshed = await getAnalyticsData()
    if (!refreshed.success) return
    const analytics = refreshed as AnalyticsData
    setData(analytics)
    setPlanDrafts(Object.fromEntries(analytics.usage.availablePlans.map((plan) => [plan.id, {
      id: plan.id,
      name: plan.name,
      slug: plan.id,
      price: plan.price,
      currencyCode: plan.currencyCode,
      databaseGB: bytesToGBValue(plan.databaseLimitBytes),
      blobGB: bytesToGBValue(plan.blobLimitBytes),
      bandwidthGB: bytesToGBValue(plan.bandwidthLimitBytes),
      sortOrder: '10',
      isActive: true,
    }])))
  }

  const handleSavePlan = async (id: string) => {
    const draft = planDrafts[id]
    if (!draft) return
    setSavingPlanId(id)
    setPlanMessage(null)
    setPlanError(null)
    try {
      const result = await saveUsagePlan(draft)
      if (!result.success) throw new Error(result.error)
      await refreshAnalytics()
      setPlanMessage('تم حفظ سعر وحصص الخطة.')
    } catch (saveError) {
      setPlanError(saveError instanceof Error ? saveError.message : 'تعذر حفظ الخطة.')
    } finally {
      setSavingPlanId(null)
    }
  }

  const handleCreatePlan = async () => {
    setSavingPlanId('new')
    setPlanMessage(null)
    setPlanError(null)
    try {
      const result = await createUsagePlan(newPlan)
      if (!result.success) throw new Error(result.error)
      setNewPlan({ name: '', slug: '', price: '', currencyCode: 'USD', databaseGB: '1', blobGB: '5', bandwidthGB: '100', sortOrder: '10', isActive: true })
      await refreshAnalytics()
      setPlanMessage('تمت إضافة الخطة الجديدة.')
    } catch (saveError) {
      setPlanError(saveError instanceof Error ? saveError.message : 'تعذر إضافة الخطة.')
    } finally {
      setSavingPlanId(null)
    }
  }

  const handleSaveSubscription = async () => {
    setSavingSubscription(true)
    setSubscriptionMessage(null)
    setSubscriptionError(null)
    try {
      const result = await saveManualSubscription({
        planId,
        status: subscriptionStatus,
        startedAt,
        renewsAt,
        graceUntil,
        notes: subscriptionNotes,
      })
      if (!result.success) throw new Error(result.error)
      setSubscriptionMessage('تم تحديث الخطة والحصة يدويًا بنجاح.')
      await refreshAnalytics()
    } catch (saveError) {
      setSubscriptionError(saveError instanceof Error ? saveError.message : 'تعذر تحديث الخطة اليدوية.')
    } finally {
      setSavingSubscription(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin" /></div>
  }

  if (!data) return <div className="rounded-xl bg-red-50 text-red-700 p-5">فشل في جلب بيانات الاستخدام.</div>

  const unreadLimit = data.usage.resources.filter((resource) => getPercentage(resource) >= 70)
  const supportPhone = data.contact.phoneNumber || data.contact.whatsappNumber

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">الإحصائيات والاستهلاك</h1>
          <p className="text-gray-500 text-sm mt-1">متابعة أداء المتجر وحدود الخطة دون خلطها مع إحصائيات العملاء.</p>
        </div>
        <div className="rounded-full bg-brand/10 text-brand px-4 py-2 text-sm font-bold flex items-center gap-2 w-fit">
          <CheckCircle2 size={17} /> {data.usage.plan.name}
        </div>
      </header>

      {unreadLimit.length > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 flex items-start gap-3">
          <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={21} />
          <div>
            <p className="font-bold text-amber-900">تحتاج بعض الموارد إلى متابعة</p>
            <p className="text-sm text-amber-800 mt-1">اقترب استهلاك {unreadLimit.map((resource) => resourceMeta[resource.resource].label).join('، ')} من الحصة. سيستمر المتجر بالعمل، وسيتم إيقاف الرفع الجديد فقط عند بلوغ حصة التخزين.</p>
          </div>
        </div>
      )}

      <section>
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4"><Users className="w-5 h-5 text-brand" /> الزيارات والمشاهدات</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard title="زيارات اليوم" value={data.visits.today} icon={<Users />} color="blue" />
          <StatCard title="مشاهدات صفحات اليوم" value={data.visits.todayViews} icon={<Eye />} color="indigo" />
          <StatCard title="زيارات هذا الشهر" value={data.visits.month} icon={<BarChart />} color="emerald" />
          <StatCard title="إجمالي الزيارات" value={data.visits.total} icon={<Activity />} color="purple" />
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2"><Gauge className="w-5 h-5 text-brand" /> حدود الخطة الحالية</h2>
          <span className="text-xs text-gray-500">تتجدد الخطة يدويًا من المالك</span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {data.usage.resources.map((resource) => <ResourceCard key={resource.resource} resource={resource} />)}
        </div>
      </section>

      <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <Info className="text-brand shrink-0 mt-0.5" size={21} />
          <div>
            <h2 className="font-bold text-gray-900">كيف نقرأ الأرقام؟</h2>
            <p className="text-sm text-gray-600 mt-2 leading-7">قاعدة البيانات مقاسة من PostgreSQL، والملفات مقاسة من Vercel Blob عند توفر رمز التخزين أو من سجل الرفع المحلي. نقل البيانات تقديري حاليًا من مشاهدات الصفحات، لذلك لا يُعرض على أنه رقم رسمي من Vercel ولا يُستخدم وحده لإيقاف المتجر.</p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-3 mb-6">
          <div><h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2"><ShoppingBag className="w-5 h-5 text-brand" /> إدارة الخطة اليدوية</h2><p className="text-sm text-gray-500 mt-1">هذا القسم للمالك فقط. لا يوجد دفع آلي؛ حدّث الخطة بعد استلام الاتفاق مع العميل.</p></div>
        </div>
        {subscriptionError && <div className="rounded-xl bg-red-50 text-red-700 border border-red-100 p-3 text-sm font-bold mb-4">{subscriptionError}</div>}
        {subscriptionMessage && <div className="rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 p-3 text-sm font-bold mb-4">{subscriptionMessage}</div>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="text-sm font-bold text-gray-700">الخطة<select value={planId} onChange={(event) => setPlanId(event.target.value)} className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-3 font-normal bg-white"><option value="">اختر الخطة</option>{data.usage.availablePlans.map((plan) => <option key={plan.id} value={plan.id}>{plan.name} — {plan.price === '0' ? 'مجانية' : `${plan.price} ${plan.currencyCode}`}</option>)}</select></label>
          <label className="text-sm font-bold text-gray-700">حالة الاشتراك<select value={subscriptionStatus} onChange={(event) => setSubscriptionStatus(event.target.value)} className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-3 font-normal bg-white"><option value="ACTIVE">فعالة</option><option value="GRACE">فترة سماح</option><option value="SUSPENDED">موقوفة الرفع</option><option value="CANCELLED">ملغاة</option></select></label>
          <label className="text-sm font-bold text-gray-700">بداية الخطة<input type="datetime-local" value={startedAt} onChange={(event) => setStartedAt(event.target.value)} className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-3 font-normal" /></label>
          <label className="text-sm font-bold text-gray-700">تاريخ التجديد<input type="datetime-local" value={renewsAt} onChange={(event) => setRenewsAt(event.target.value)} className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-3 font-normal" /></label>
          <label className="text-sm font-bold text-gray-700">نهاية فترة السماح<input type="datetime-local" value={graceUntil} onChange={(event) => setGraceUntil(event.target.value)} className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-3 font-normal" /></label>
          <label className="text-sm font-bold text-gray-700 md:col-span-2">ملاحظات المالك<textarea value={subscriptionNotes} onChange={(event) => setSubscriptionNotes(event.target.value)} rows={3} placeholder="مثال: تمت الترقية يدويًا بعد التواصل بتاريخ..." className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-3 font-normal resize-y" /></label>
        </div>
        <button onClick={handleSaveSubscription} disabled={savingSubscription || !planId} className="btn btn-primary mt-5 disabled:opacity-60">{savingSubscription ? 'جارٍ الحفظ...' : 'حفظ الخطة والحصة'}</button>
      </section>

      <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-3 mb-5">
          <div><h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2"><Settings2 className="w-5 h-5 text-brand" /> إعداد أسعار وحصص الخطط</h2><p className="text-sm text-gray-500 mt-1">اضبط الأسعار والحصص التي ستظهر للعميل. القيم بالجيجابايت، والتغيير لا يفعّل اشتراكًا تلقائيًا.</p></div>
        </div>
        {planError && <div className="rounded-xl bg-red-50 text-red-700 border border-red-100 p-3 text-sm font-bold mb-4">{planError}</div>}
        {planMessage && <div className="rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 p-3 text-sm font-bold mb-4">{planMessage}</div>}
        <div className="space-y-4">
          {Object.values(planDrafts).map((draft) => (
            <div key={draft.id} className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
                <label className="text-xs font-bold text-gray-700">اسم الخطة<input value={draft.name} onChange={(event) => setPlanDrafts((current) => ({ ...current, [draft.id]: { ...draft, name: event.target.value } }))} className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-normal" /></label>
                <label className="text-xs font-bold text-gray-700">المعرّف اللاتيني<input value={draft.slug} onChange={(event) => setPlanDrafts((current) => ({ ...current, [draft.id]: { ...draft, slug: event.target.value } }))} className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-normal" dir="ltr" /></label>
                <label className="text-xs font-bold text-gray-700">السعر الشهري<input value={draft.price} onChange={(event) => setPlanDrafts((current) => ({ ...current, [draft.id]: { ...draft, price: event.target.value } }))} className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-normal" inputMode="decimal" dir="ltr" /></label>
                <label className="text-xs font-bold text-gray-700">العملة<input value={draft.currencyCode} onChange={(event) => setPlanDrafts((current) => ({ ...current, [draft.id]: { ...draft, currencyCode: event.target.value } }))} className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-normal" dir="ltr" maxLength={3} /></label>
                <label className="text-xs font-bold text-gray-700">قاعدة البيانات GB<input value={draft.databaseGB} onChange={(event) => setPlanDrafts((current) => ({ ...current, [draft.id]: { ...draft, databaseGB: event.target.value } }))} className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-normal" inputMode="decimal" dir="ltr" /></label>
                <label className="text-xs font-bold text-gray-700">الصور والملفات GB<input value={draft.blobGB} onChange={(event) => setPlanDrafts((current) => ({ ...current, [draft.id]: { ...draft, blobGB: event.target.value } }))} className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-normal" inputMode="decimal" dir="ltr" /></label>
                <label className="text-xs font-bold text-gray-700">النقل GB<input value={draft.bandwidthGB} onChange={(event) => setPlanDrafts((current) => ({ ...current, [draft.id]: { ...draft, bandwidthGB: event.target.value } }))} className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-normal" inputMode="decimal" dir="ltr" /></label>
                <label className="text-xs font-bold text-gray-700">ترتيب العرض<input value={draft.sortOrder} onChange={(event) => setPlanDrafts((current) => ({ ...current, [draft.id]: { ...draft, sortOrder: event.target.value } }))} className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-normal" inputMode="numeric" dir="ltr" /></label>
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <label className="inline-flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" checked={draft.isActive} onChange={(event) => setPlanDrafts((current) => ({ ...current, [draft.id]: { ...draft, isActive: event.target.checked } }))} /> إظهار الخطة للعملاء</label>
                <button onClick={() => handleSavePlan(draft.id)} disabled={savingPlanId === draft.id} className="btn btn-primary disabled:opacity-60">{savingPlanId === draft.id ? 'جارٍ الحفظ...' : 'حفظ إعدادات الخطة'}</button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-5 rounded-2xl border border-dashed border-gray-200 p-4">
          <h3 className="font-bold text-gray-800">إضافة خطة جديدة</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 mt-3">
            <input placeholder="اسم الخطة" value={newPlan.name} onChange={(event) => setNewPlan((current) => ({ ...current, name: event.target.value }))} className="rounded-lg border border-gray-200 px-3 py-2 text-sm" />
            <input placeholder="slug-latin" value={newPlan.slug} onChange={(event) => setNewPlan((current) => ({ ...current, slug: event.target.value }))} className="rounded-lg border border-gray-200 px-3 py-2 text-sm" dir="ltr" />
            <input placeholder="السعر" value={newPlan.price} onChange={(event) => setNewPlan((current) => ({ ...current, price: event.target.value }))} className="rounded-lg border border-gray-200 px-3 py-2 text-sm" inputMode="decimal" dir="ltr" />
            <input placeholder="العملة" value={newPlan.currencyCode} onChange={(event) => setNewPlan((current) => ({ ...current, currencyCode: event.target.value }))} className="rounded-lg border border-gray-200 px-3 py-2 text-sm" maxLength={3} dir="ltr" />
            <input placeholder="قاعدة البيانات GB" value={newPlan.databaseGB} onChange={(event) => setNewPlan((current) => ({ ...current, databaseGB: event.target.value }))} className="rounded-lg border border-gray-200 px-3 py-2 text-sm" inputMode="decimal" dir="ltr" />
            <input placeholder="الصور والملفات GB" value={newPlan.blobGB} onChange={(event) => setNewPlan((current) => ({ ...current, blobGB: event.target.value }))} className="rounded-lg border border-gray-200 px-3 py-2 text-sm" inputMode="decimal" dir="ltr" />
            <input placeholder="النقل GB" value={newPlan.bandwidthGB} onChange={(event) => setNewPlan((current) => ({ ...current, bandwidthGB: event.target.value }))} className="rounded-lg border border-gray-200 px-3 py-2 text-sm" inputMode="decimal" dir="ltr" />
            <input placeholder="ترتيب العرض" value={newPlan.sortOrder} onChange={(event) => setNewPlan((current) => ({ ...current, sortOrder: event.target.value }))} className="rounded-lg border border-gray-200 px-3 py-2 text-sm" inputMode="numeric" dir="ltr" />
          </div>
          <button onClick={handleCreatePlan} disabled={savingPlanId === 'new'} className="btn btn-secondary mt-4 disabled:opacity-60">{savingPlanId === 'new' ? 'جارٍ الإضافة...' : 'إضافة الخطة'}</button>
        </div>
      </section>

      <section>
        <div className="flex items-center gap-2 mb-4"><ShoppingBag className="w-5 h-5 text-brand" /><h2 className="text-lg font-semibold text-gray-800">الخطط والترقية اليدوية</h2></div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {data.usage.availablePlans.map((plan) => (
            <div key={plan.id} className={`rounded-2xl border p-6 ${plan.id === data.usage.plan.id ? 'border-brand bg-brand/5' : 'border-gray-100 bg-white'} shadow-sm`}>
              <div className="flex items-start justify-between gap-3">
                <div><h3 className="font-bold text-gray-900">{plan.name}</h3><p className="text-sm text-gray-500 mt-1">{plan.id === data.usage.plan.id ? 'خطتك الحالية' : 'متاحة للترقية'}</p></div>
                {plan.id === data.usage.plan.id && <CheckCircle2 className="text-brand" size={21} />}
              </div>
              <p className="text-2xl font-black text-gray-900 mt-5">{plan.price === '0' ? 'مجانية' : `${plan.price} ${plan.currencyCode}`}<span className="text-sm font-medium text-gray-500">{plan.price === '0' ? '' : ' / شهر'}</span></p>
              <p className="text-sm text-gray-600 mt-4">صور وملفات: <strong>{formatBytes(plan.blobLimitBytes)}</strong></p>
              <p className="text-sm text-gray-600 mt-1">قاعدة البيانات: <strong>{formatBytes(plan.databaseLimitBytes)}</strong></p>
              <p className="text-sm text-gray-600 mt-1">نقل البيانات: <strong>{formatBytes(plan.bandwidthLimitBytes)}</strong></p>
              {plan.id !== data.usage.plan.id && supportPhone && <ContactButtons phone={supportPhone} />}
            </div>
          ))}
        </div>
        <div className="mt-5 rounded-xl bg-gray-50 border border-gray-100 p-4 text-sm text-gray-600">الترقية والتجديد يدويان في هذه المرحلة. عند قرب النفاذ تواصل مع مالك المنصة، وسيتم تحديث الخطة والحصة وتاريخ التجديد من جهة الإدارة.</div>
      </section>
    </div>
  )
}

function ResourceCard({ resource }: { resource: ResourceData }) {
  const meta = resourceMeta[resource.resource]
  const percentage = getPercentage(resource)
  const isEstimated = resource.confidence === 'estimated'
  const level = percentage >= 100 ? 'exceeded' : percentage >= 95 ? 'critical' : percentage >= 85 ? 'warning' : percentage >= 70 ? 'info' : 'normal'
  const barColor = level === 'exceeded' || level === 'critical' ? 'bg-red-500' : level === 'warning' ? 'bg-amber-400' : level === 'info' ? 'bg-yellow-300' : resource.resource === 'bandwidth' ? 'bg-blue-500' : 'bg-brand'

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3"><div className="p-3 rounded-xl bg-brand/5 text-brand">{meta.icon}</div><div><h3 className="font-bold text-gray-800">{meta.label}</h3><p className="text-xs text-gray-500 mt-1">{meta.description}</p></div></div>
        {(level === 'critical' || level === 'exceeded') && <AlertTriangle size={20} className="text-red-500 shrink-0" />}
      </div>
      <div className="flex justify-between items-end mt-6 mb-2"><span className="text-2xl font-black text-gray-900">{formatBytes(resource.usedBytes)}</span><span className="text-sm text-gray-500">من {formatBytes(resource.limitBytes)}</span></div>
      <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden"><div className={`h-3 rounded-full transition-all duration-700 ${barColor}`} style={{ width: `${Math.min(percentage, 100)}%` }} /></div>
      <div className="flex justify-between gap-3 mt-3 text-xs"><span className={`font-bold ${level === 'normal' ? 'text-gray-500' : level === 'info' ? 'text-yellow-700' : 'text-red-600'}`}>{percentage.toFixed(1)}% مستهلك</span><span className="text-gray-400">{isEstimated ? 'تقديري' : resource.confidence === 'tracked' ? 'من سجل الرفع' : 'مقاس'}</span></div>
    </div>
  )
}

function ContactButtons({ phone }: { phone: string }) {
  const digits = phone.replace(/[^\d]/g, '')
  return <div className="flex flex-wrap gap-2 mt-5"><a href={`tel:${phone}`} className="inline-flex items-center gap-2 rounded-lg bg-brand text-white px-3 py-2 text-sm font-bold"><Phone size={15} /> اتصال</a>{digits && <a href={`https://wa.me/${digits}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 text-white px-3 py-2 text-sm font-bold"><MessageCircle size={15} /> واتساب</a>}</div>
}

function getPercentage(resource: ResourceData) {
  if (resource.limitBytes <= 0) return 0
  return (resource.usedBytes / resource.limitBytes) * 100
}

function bytesToGBValue(bytes: number) {
  return (bytes / (1024 * 1024 * 1024)).toFixed(2).replace(/\.00$/, '')
}

function toLocalDateTime(value: Date | string | null) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 16)
}

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(0, Math.round(bytes / 1024))} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

function StatCard({ title, value, icon, color }: { title: string; value: number; icon: ReactNode; color: string }) {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    emerald: 'bg-brand/5 text-brand border-emerald-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
  }
  return <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow"><div className={`p-3 rounded-lg border ${colorMap[color] || colorMap.blue}`}>{icon}</div><div><p className="text-sm text-gray-500 font-medium">{title}</p><p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p></div></div>
}

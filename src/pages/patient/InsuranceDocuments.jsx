import { useEffect, useRef, useState } from 'react'
import Header from '../../components/layout/Header'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Icon from '../../components/ui/Icon'
import { useAuth } from '../../context/AuthContext'

const STATUS_VARIANT = { processed: 'teal', processing: 'amber', uploading: 'sage' }
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const INSURANCE_TYPE = 'Insurance Policy'
const BILL_TYPE = 'Medical Bill'

function formatFileSize(bytes) {
  if (!bytes && bytes !== 0) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatShortDate(date) {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function InsuranceDocuments() {
  const { auth } = useAuth()
  const [dragging, setDragging] = useState(false)
  const [files, setFiles] = useState([])
  const [selectedFiles, setSelectedFiles] = useState([])
  const [docType, setDocType] = useState(INSURANCE_TYPE)
  const [notes, setNotes] = useState('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const [initialLoading, setInitialLoading] = useState(true)
  const [copiedId, setCopiedId] = useState(null)
  const [filterType, setFilterType] = useState('all') // all | insurance | bill

  // Advanced Filters
  const [filterInsAmount, setFilterInsAmount] = useState('')
  const [filterInsValidTill, setFilterInsValidTill] = useState('')
  const [filterInsurerName, setFilterInsurerName] = useState('')

  const [filterBillDate, setFilterBillDate] = useState('')
  const [filterBillProvider, setFilterBillProvider] = useState('')

  // Insurance-specific fields
  const [insuranceAmount, setInsuranceAmount] = useState('')
  const [insuranceValidFrom, setInsuranceValidFrom] = useState('')
  const [insuranceValidTo, setInsuranceValidTo] = useState('')
  const [insurerName, setInsurerName] = useState('')
  const [policyNumber, setPolicyNumber] = useState('')

  // Medical bill-specific fields
  const [billAmount, setBillAmount] = useState('')
  const [billDate, setBillDate] = useState('')
  const [billProvider, setBillProvider] = useState('')

  const fileInputRef = useRef(null)

  useEffect(() => {
    if (!auth?.id) return
    let cancelled = false

    const fetchDocuments = async () => {
      setInitialLoading(true)
      try {
        const response = await fetch(`${API_BASE_URL}/users/${auth?.id}/documents`)
        if (!response.ok) throw new Error('Failed to fetch documents')
        const docs = await response.json()
        if (cancelled) return

        setFiles(
          docs.map(doc => ({
            id: doc._id,
            name: doc.name,
            url: doc.url,
            size: '—',
            type: doc.type || 'Other',
            status: 'processed',
            date: doc.createdAt ? formatShortDate(new Date(doc.createdAt)) : '',
            insuranceTotalAmount: doc.insuranceTotalAmount,
            insuranceValidFrom: doc.insuranceValidFrom,
            insuranceValidTo: doc.insuranceValidTo,
            insurerName: doc.insurerName,
            policyNumber: doc.policyNumber,
            billAmount: doc.billAmount,
            billDate: doc.billDate,
            billProvider: doc.billProvider,
          })),
        )
      } catch (e) {
        if (!cancelled) {
          console.error(e)
          setError('Unable to load your documents.')
        }
      } finally {
        if (!cancelled) setInitialLoading(false)
      }
    }

    fetchDocuments()
    return () => { cancelled = true }
  }, [auth?.id])

  const addToSelectedFiles = (incoming) => {
    setSelectedFiles(prev => [...prev, ...incoming])
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    const dropped = Array.from(e.dataTransfer.files)
    if (dropped.length) addToSelectedFiles(dropped)
  }

  const handleFileInputChange = (e) => {
    const picked = Array.from(e.target.files)
    if (picked.length) addToSelectedFiles(picked)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const removeSelectedFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleUpload = async () => {
    if (!selectedFiles.length || uploading) return
    setError(null)
    setUploading(true)

    const optimisticEntries = selectedFiles.map(file => ({
      id: `optimistic-${Date.now()}-${Math.random()}`,
      name: file.name,
      url: undefined,
      size: formatFileSize(file.size),
      type: docType,
      status: 'uploading',
      date: formatShortDate(new Date()),
      _file: file,
    }))
    setFiles(prev => [...prev, ...optimisticEntries])
    setSelectedFiles([])

    await Promise.all(
      optimisticEntries.map(async (entry) => {
        try {
          const formData = new FormData()
          formData.append('document', entry._file)
          formData.append('type', docType)
          if (notes.trim()) formData.append('description', notes.trim())

          if (docType === INSURANCE_TYPE) {
            if (insuranceAmount.trim()) formData.append('insuranceTotalAmount', insuranceAmount.trim())
            if (insuranceValidFrom) formData.append('insuranceValidFrom', insuranceValidFrom)
            if (insuranceValidTo) formData.append('insuranceValidTo', insuranceValidTo)
            if (insurerName.trim()) formData.append('insurerName', insurerName.trim())
            if (policyNumber.trim()) formData.append('policyNumber', policyNumber.trim())
          } else if (docType === BILL_TYPE) {
            if (billAmount.trim()) formData.append('billAmount', billAmount.trim())
            if (billDate) formData.append('billDate', billDate)
            if (billProvider.trim()) formData.append('billProvider', billProvider.trim())
          }

          const response = await fetch(`${API_BASE_URL}/users/${auth?.id}/documents`, {
            method: 'POST',
            body: formData,
          })

          if (!response.ok) throw new Error('Failed to upload document')
          const created = await response.json()

          setFiles(prev =>
            prev.map(f =>
              f.id === entry.id
                ? {
                    ...f,
                    id: created._id,
                    name: created.name || f.name,
                    url: created.url || f.url,
                    type: created.type || f.type,
                    status: 'processed',
                    insuranceTotalAmount: created.insuranceTotalAmount,
                    insuranceValidFrom: created.insuranceValidFrom,
                    insuranceValidTo: created.insuranceValidTo,
                    insurerName: created.insurerName,
                    policyNumber: created.policyNumber,
                    billAmount: created.billAmount,
                    billDate: created.billDate,
                    billProvider: created.billProvider,
                  }
                : f,
            ),
          )
        } catch (err) {
          console.error(err)
          setError('One or more files failed to upload. Please try again.')
          setFiles(prev => prev.filter(f => f.id !== entry.id))
        }
      }),
    )

    setNotes('')
    setInsuranceAmount('')
    setInsuranceValidFrom('')
    setInsuranceValidTo('')
    setInsurerName('')
    setPolicyNumber('')
    setBillAmount('')
    setBillDate('')
    setBillProvider('')
    setUploading(false)
  }

  const handleCopyUrl = async (file) => {
    if (!file?.url) return
    try {
      await navigator.clipboard.writeText(file.url)
      setCopiedId(file.id)
      setTimeout(() => {
        setCopiedId(current => (current === file.id ? null : current))
      }, 1200)
    } catch (e) {
      console.error('Failed to copy URL', e)
      setError('Could not copy document link. Please try again.')
    }
  }

  const visibleFiles = files.filter(f => {
    if (filterType === 'insurance' && f.type !== INSURANCE_TYPE) return false
    if (filterType === 'bill' && f.type !== BILL_TYPE) return false
    if (filterType === 'all' && f.type !== INSURANCE_TYPE && f.type !== BILL_TYPE) return false

    if (f.type === INSURANCE_TYPE) {
      if (filterInsAmount && String(f.insuranceTotalAmount) !== filterInsAmount) return false
      if (filterInsValidTill) {
        if (!f.insuranceValidTo) return false
        const validToDate = f.insuranceValidTo.split('T')[0]
        if (validToDate < filterInsValidTill) return false
      }
      if (filterInsurerName && !f.insurerName?.toLowerCase().includes(filterInsurerName.toLowerCase())) return false
    }

    if (f.type === BILL_TYPE) {
      if (filterBillDate && f.billDate?.split('T')[0] !== filterBillDate) return false
      if (filterBillProvider && !f.billProvider?.toLowerCase().includes(filterBillProvider.toLowerCase())) return false
    }

    return true
  })

  const formatInsuranceMeta = (f) => {
    if (f.type !== INSURANCE_TYPE) return null
    const parts = []
    if (f.insuranceTotalAmount != null) parts.push(`₹${f.insuranceTotalAmount}`)
    const from = f.insuranceValidFrom ? formatShortDate(new Date(f.insuranceValidFrom)) : null
    const to = f.insuranceValidTo ? formatShortDate(new Date(f.insuranceValidTo)) : null
    if (from || to) parts.push(`Valid ${from || ''}${from && to ? ' → ' : ''}${to || ''}`)
    if (f.insurerName) parts.push(f.insurerName)
    if (f.policyNumber) parts.push(`Policy #${f.policyNumber}`)
    return parts.join(' • ')
  }

  const formatBillMeta = (f) => {
    if (f.type !== BILL_TYPE) return null
    const parts = []
    if (f.billAmount != null) parts.push(`₹${f.billAmount}`)
    if (f.billDate) parts.push(formatShortDate(new Date(f.billDate)))
    if (f.billProvider) parts.push(f.billProvider)
    return parts.join(' • ')
  }

  return (
    <div className="animate-fade-in">
      <Header
        title="Insurance & Bills"
        subtitle="Upload and track your insurance policies and medical bills"
      />

      <div className="flex flex-col lg:grid lg:grid-cols-2 gap-5">

        <div className="flex flex-col gap-4 sm:gap-5">
          <input
            type="file"
            multiple
            ref={fileInputRef}
            onChange={handleFileInputChange}
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png"
          />
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200
              ${dragging
                ? 'border-teal-light bg-teal/10'
                : 'border-cream/15 bg-cream/[0.02] hover:border-teal/40 hover:bg-teal/5'}`}
          >
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-teal/15 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Icon name="shield" size={22} className="text-teal-light" />
            </div>
            <h3 className="text-sm sm:text-base font-medium text-cream mb-2">
              Drop insurance documents or bills here, or tap to upload
            </h3>
            <p className="text-slate text-xs sm:text-sm mb-4 sm:mb-5">PDF, JPEG, PNG up to 50 MB</p>
          </div>

          {selectedFiles.length > 0 && (
            <div className="bg-cream/[0.03] border border-cream/10 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-cream mb-3">Selected Files</h4>
              <div className="flex flex-col gap-3">
                {selectedFiles.map((file, index) => {
                  const isImage = file.type.startsWith('image/')
                  return (
                    <div key={index} className="flex items-center gap-3 bg-[#0D1B3E] p-3 rounded-lg">
                      {isImage ? (
                        <img
                          src={URL.createObjectURL(file)}
                          alt={file.name}
                          className="w-12 h-12 object-cover rounded-md"
                        />
                      ) : (
                        <div className="w-12 h-12 flex items-center justify-center bg-cream/[0.06] rounded-md text-teal-light text-lg">
                          📄
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-cream truncate">{file.name}</p>
                        <p className="text-xs text-slate">{formatFileSize(file.size)}</p>
                      </div>
                      <button
                        onClick={() => removeSelectedFile(index)}
                        className="text-red-400 hover:text-red-500 text-sm"
                      >
                        ✕
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <Card>
            <h4 className="text-sm font-semibold text-cream mb-4">Upload Details</h4>
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="form-label">Document Type</label>
                  <select
                    className="form-input"
                    value={docType}
                    onChange={e => setDocType(e.target.value)}
                  >
                    <option value={INSURANCE_TYPE} className="bg-navy text-cream">
                      Insurance Policy
                    </option>
                    <option value={BILL_TYPE} className="bg-navy text-cream">
                      Medical Bill
                    </option>
                  </select>
                </div>
              </div>

              {docType === INSURANCE_TYPE && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="form-label">Total Coverage Amount (₹)</label>
                    <input
                      className="form-input"
                      type="number"
                      min="0"
                      value={insuranceAmount}
                      onChange={e => setInsuranceAmount(e.target.value)}
                      placeholder="e.g. 500000"
                    />
                  </div>
                  <div>
                    <label className="form-label">Insurer Name</label>
                    <input
                      className="form-input"
                      type="text"
                      value={insurerName}
                      onChange={e => setInsurerName(e.target.value)}
                      placeholder="e.g. ABC Health Insurance"
                    />
                  </div>
                  <div>
                    <label className="form-label">Policy Number</label>
                    <input
                      className="form-input"
                      type="text"
                      value={policyNumber}
                      onChange={e => setPolicyNumber(e.target.value)}
                      placeholder="e.g. POL123456"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="form-label">Valid From</label>
                      <input
                        className="form-input"
                        type="date"
                        value={insuranceValidFrom}
                        onChange={e => setInsuranceValidFrom(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="form-label">Valid To</label>
                      <input
                        className="form-input"
                        type="date"
                        value={insuranceValidTo}
                        onChange={e => setInsuranceValidTo(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {docType === BILL_TYPE && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="form-label">Bill Amount (₹)</label>
                    <input
                      className="form-input"
                      type="number"
                      min="0"
                      value={billAmount}
                      onChange={e => setBillAmount(e.target.value)}
                      placeholder="e.g. 12000"
                    />
                  </div>
                  <div>
                    <label className="form-label">Bill Date</label>
                    <input
                      className="form-input"
                      type="date"
                      value={billDate}
                      onChange={e => setBillDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="form-label">Hospital / Provider</label>
                    <input
                      className="form-input"
                      type="text"
                      value={billProvider}
                      onChange={e => setBillProvider(e.target.value)}
                      placeholder="e.g. City Hospital"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="form-label">Notes (optional)</label>
                <textarea
                  className="form-input resize-none h-20"
                  placeholder="Add context about this insurance or bill…"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                />
              </div>

              {error && (
                <p className="text-xs text-red-400">{error}</p>
              )}

              <Button
                icon="upload"
                className="w-fit"
                disabled={!selectedFiles.length || uploading}
                onClick={handleUpload}
              >
                {uploading
                  ? 'Uploading...'
                  : `Upload ${selectedFiles.length > 1 ? `${selectedFiles.length} Files` : 'File'}`}
              </Button>
            </div>
          </Card>
        </div>

        <Card>
          <div className="flex flex-col gap-4 mb-4 sm:mb-5">
            <div className="flex justify-between items-start sm:items-center flex-col sm:flex-row gap-4">
              <div>
                <h3 className="text-sm sm:text-[15px] font-semibold text-cream">Insurance & Bills</h3>
                <p className="text-[11px] text-slate mt-1">
                  Filter by document type to quickly find policies or bills.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className={`px-3 py-1.5 rounded-full text-xs border ${
                    filterType === 'all'
                      ? 'bg-teal text-obsidian border-teal'
                      : 'border-cream/20 text-slate hover:border-teal/60'
                  }`}
                  onClick={() => setFilterType('all')}
                >
                  All
                </button>
                <button
                  type="button"
                  className={`px-3 py-1.5 rounded-full text-xs border ${
                    filterType === 'insurance'
                      ? 'bg-teal text-obsidian border-teal'
                      : 'border-cream/20 text-slate hover:border-teal/60'
                  }`}
                  onClick={() => setFilterType('insurance')}
                >
                  Insurance
                </button>
                <button
                  type="button"
                  className={`px-3 py-1.5 rounded-full text-xs border ${
                    filterType === 'bill'
                      ? 'bg-teal text-obsidian border-teal'
                      : 'border-cream/20 text-slate hover:border-teal/60'
                  }`}
                  onClick={() => setFilterType('bill')}
                >
                  Bills
                </button>
              </div>
            </div>

            {/* Advanced Filters Content */}
            {filterType !== 'all' && (
              <div className="p-3 bg-cream/[0.03] rounded-xl border border-cream/10 space-y-3">
                <h4 className="text-[11px] font-medium text-slate uppercase tracking-wider">Advanced Filters</h4>
                
                {filterType === 'insurance' && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input 
                      className="form-input text-xs border border-cream/10 bg-cream/[0.03]" 
                      placeholder="Insurance Amount (₹)" 
                      value={filterInsAmount} 
                      onChange={e => setFilterInsAmount(e.target.value)} 
                      type="number" 
                    />
                    <input 
                      className="form-input text-xs border border-cream/10 bg-cream/[0.03]" 
                      placeholder="Insurer Name" 
                      value={filterInsurerName} 
                      onChange={e => setFilterInsurerName(e.target.value)} 
                    />
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-slate whitespace-nowrap">Valid Till</label>
                      <input 
                        className="form-input text-xs border border-cream/10 bg-cream/[0.03]" 
                        value={filterInsValidTill} 
                        onChange={e => setFilterInsValidTill(e.target.value)} 
                        type="date" 
                      />
                    </div>
                  </div>
                )}

                {filterType === 'bill' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input 
                      className="form-input text-xs border border-cream/10 bg-cream/[0.03]" 
                      placeholder="Hospital Name" 
                      value={filterBillProvider} 
                      onChange={e => setFilterBillProvider(e.target.value)} 
                    />
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-slate whitespace-nowrap">Bill Date</label>
                      <input 
                        className="form-input text-xs border border-cream/10 bg-cream/[0.03]" 
                        value={filterBillDate} 
                        onChange={e => setFilterBillDate(e.target.value)} 
                        type="date" 
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            {initialLoading ? (
              <p className="text-xs text-slate">Loading…</p>
            ) : visibleFiles.length === 0 ? (
              <p className="text-xs text-slate">No insurance policies or bills uploaded yet.</p>
            ) : (
              visibleFiles.map((f, i) => {
                const isInsurance = f.type === INSURANCE_TYPE
                const meta =
                  isInsurance ? formatInsuranceMeta(f) : formatBillMeta(f)
                return (
                  <div
                    key={f.id ?? i}
                    className={`flex items-center gap-3 py-3.5 ${
                      i < visibleFiles.length - 1 ? 'border-b border-cream/[0.07]' : ''
                    }`}
                  >
                    <div className="w-9 h-9 sm:w-10 sm:h-10 bg-cream/[0.06] rounded-lg flex items-center justify-center shrink-0">
                      <Icon
                        name={isInsurance ? 'shield' : 'file'}
                        size={16}
                        className="text-teal-light"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-cream truncate">
                        {f.name}
                      </p>
                      <p className="text-[10px] sm:text-[11px] text-slate">
                        {f.type} · {f.date}
                      </p>
                      {meta && (
                        <p className="text-[10px] sm:text-[11px] text-slate mt-0.5 truncate">
                          {meta}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Badge variant={STATUS_VARIANT[f.status]}>
                        {f.status === 'uploading' && (
                          <span className="w-2 h-2 border border-current border-t-transparent rounded-full animate-spin-slow" />
                        )}
                        <span className="hidden sm:inline">{f.status}</span>
                        <span className="sm:hidden">
                          {f.status === 'processed'
                            ? '✓'
                            : f.status === 'processing'
                            ? '…'
                            : '↑'}
                        </span>
                      </Badge>
                      {f.status === 'processed' && (
                        <button
                          type="button"
                          className="relative btn-ghost !p-1.5 group"
                          onClick={() => handleCopyUrl(f)}
                        >
                          <span
                            className={`pointer-events-none absolute -top-7 right-0 whitespace-nowrap rounded-md bg-slate-900/90 px-2 py-1 text-[10px] text-cream shadow-sm transition-opacity duration-150 ${
                              copiedId === f.id
                                ? 'opacity-0'
                                : 'opacity-0 group-hover:opacity-100'
                            }`}
                          >
                            Click to copy document URL
                          </span>
                          {copiedId === f.id && (
                            <span className="pointer-events-none absolute -top-7 right-0 whitespace-nowrap rounded-md bg-teal/90 px-2 py-1 text-[10px] text-cream shadow-sm animate-fade-in">
                              Copied!
                            </span>
                          )}
                          <Icon
                            name="eye"
                            size={13}
                            className={`transition-transform duration-150 ${
                              copiedId === f.id
                                ? 'scale-110 text-teal-light'
                                : 'group-hover:scale-110'
                            }`}
                          />
                        </button>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}


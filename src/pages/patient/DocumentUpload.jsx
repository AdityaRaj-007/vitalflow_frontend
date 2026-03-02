import { useEffect, useRef, useState } from 'react'
import Header from '../../components/layout/Header'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Icon from '../../components/ui/Icon'

const STATUS_VARIANT = { processed: 'teal', processing: 'amber', uploading: 'sage' }
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
const USER_ID = 1

function formatFileSize(bytes) {
  if (!bytes && bytes !== 0) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatShortDate(date) {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function DocumentUpload() {
  const [dragging, setDragging] = useState(false)
  const [files, setFiles] = useState([])
  const [selectedFiles, setSelectedFiles] = useState([])
  const [docType, setDocType] = useState('Lab Results')
  const [notes, setNotes] = useState('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const [initialLoading, setInitialLoading] = useState(true)
  const [copiedId, setCopiedId] = useState(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    let cancelled = false

    const fetchDocuments = async () => {
      setInitialLoading(true)
      try {
        const response = await fetch(`${API_BASE_URL}/users/${USER_ID}/documents`)
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
  }, [])

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

    // Add optimistic entries for every queued file
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

          const response = await fetch(`${API_BASE_URL}/users/${USER_ID}/documents`, {
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
                  name: created.name || f.name,
                  url: created.url || f.url,
                  type: created.type || f.type,
                  status: 'processed',
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

  return (
    <div className="animate-fade-in">
      <Header title="Document Upload" subtitle="Upload medical records, lab results, and prescriptions" />

      <div className="flex flex-col lg:grid lg:grid-cols-2 gap-5">

        <div className="flex flex-col gap-4 sm:gap-5">
          <input
            type="file"
            multiple
            ref={fileInputRef}
            onChange={handleFileInputChange}
            className="hidden"
            accept=".pdf,.dcm,.jpg,.jpeg,.png"
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
              <Icon name="upload" size={22} className="text-teal-light" />
            </div>
            <h3 className="text-sm sm:text-base font-medium text-cream mb-2">
              Drop files here or tap to upload
            </h3>
            <p className="text-slate text-xs sm:text-sm mb-4 sm:mb-5">PDF, TXT, JPEG, PNG — up to 50 MB</p>
            {/* <div className="flex items-center justify-center flex-wrap gap-2">
              <Badge variant="teal">HIPAA Compliant</Badge>
              <Badge variant="amber">AES-256 Encrypted</Badge>
            </div> */}
          </div>

          {/* Selected file previews */}
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
            <h4 className="text-sm font-semibold text-cream mb-4">Upload Settings</h4>
            <div className="flex flex-col gap-4">
              <div>
                <label className="form-label">Document Type</label>
                <select
                  className="form-input"
                  value={docType}
                  onChange={e => setDocType(e.target.value)}
                >
                  <option value="Lab Results" className="bg-[#0D1B3E] text-cream">Lab Results</option>
                  <option value="Imaging" className="bg-[#0D1B3E] text-cream">Imaging</option>
                  <option value="Prescription" className="bg-[#0D1B3E] text-cream">Prescription</option>
                  <option value="Referral" className="bg-[#0D1B3E] text-cream">Referral</option>
                  <option value="Other" className="bg-[#0D1B3E] text-cream">Other</option>
                </select>
              </div>
              <div>
                <label className="form-label">Notes (optional)</label>
                <textarea
                  className="form-input resize-none h-20"
                  placeholder="Add context about this document…"
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
                {uploading ? 'Uploading...' : `Upload ${selectedFiles.length > 1 ? `${selectedFiles.length} Files` : 'File'}`}
              </Button>
            </div>
          </Card>
        </div>

        <Card>
          <div className="flex justify-between items-center mb-4 sm:mb-5">
            <h3 className="text-sm sm:text-[15px] font-semibold text-cream">Recent Documents</h3>
            <span className="text-xs text-slate">
              {initialLoading ? 'Loading…' : `${files.length} files`}
            </span>
          </div>
          <div>
            {files.map((f, i) => (
              <div
                key={f.id ?? i}
                className={`flex items-center gap-3 py-3.5 ${i < files.length - 1 ? 'border-b border-cream/[0.07]' : ''}`}
              >
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-cream/[0.06] rounded-lg flex items-center justify-center shrink-0">
                  <Icon name="file" size={16} className="text-teal-light" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-cream truncate">{f.name}</p>
                  <p className="text-[10px] sm:text-[11px] text-slate">{f.type} · {f.date}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Badge variant={STATUS_VARIANT[f.status]}>
                    {f.status === 'uploading' && (
                      <span className="w-2 h-2 border border-current border-t-transparent rounded-full animate-spin-slow" />
                    )}
                    <span className="hidden sm:inline">{f.status}</span>
                    <span className="sm:hidden">
                      {f.status === 'processed' ? '✓' : f.status === 'processing' ? '…' : '↑'}
                    </span>
                  </Badge>
                  {f.status === 'processed' && (
                    <button
                      type="button"
                      className="relative btn-ghost !p-1.5 group"
                      onClick={() => handleCopyUrl(f)}
                    >
                      <span
                        className={`pointer-events-none absolute -top-7 right-0 whitespace-nowrap rounded-md bg-slate-900/90 px-2 py-1 text-[10px] text-cream shadow-sm transition-opacity duration-150 ${copiedId === f.id ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'
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
                        className={`transition-transform duration-150 ${copiedId === f.id ? 'scale-110 text-teal-light' : 'group-hover:scale-110'
                          }`}
                      />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
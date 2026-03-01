import { useRef, useState } from "react";
import Header from "../../components/layout/Header";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Icon from "../../components/ui/Icon";

const INITIAL_FILES = [
  {
    name: "blood_panel_jan2026.pdf",
    size: "2.4 MB",
    type: "Lab Results",
    status: "processed",
    date: "Jan 15",
  },
  {
    name: "ecg_report_dec2025.pdf",
    size: "1.1 MB",
    type: "Cardiology",
    status: "processed",
    date: "Dec 28",
  },
  {
    name: "rx_metformin.pdf",
    size: "340 KB",
    type: "Prescription",
    status: "processing",
    date: "Feb 20",
  },
];
const STATUS_VARIANT = {
  processed: "teal",
  processing: "amber",
  uploading: "sage",
};

export default function DocumentUpload() {
  const [dragging, setDragging] = useState(false);
  const [files, setFiles] = useState(INITIAL_FILES);
  const [selectedFile, setSelectedFile] = useState([]);
  const [documentType, setDocumentType] = useState("Lab Results");
  const [notes, setNotes] = useState("");
  const fileInputRef = useRef(null);

  const uploadFile = (file) => {
    const newFile = {
      name: file.name,
      size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
    };
    setFiles((prev) => [
      ...prev,
      { ...newFile, type: documentType, status: "uploading", date: "Feb 25" },
    ]);

    setTimeout(() => setFiles(prev => prev.map((f, i) => i === prev.length - 1 ? {...f, status: 'processing'} : f)), 1000)
    setTimeout(() => setFiles(prev => prev.map((f, i) => i === prev.length - 1 ? {...f, status: 'processed'} : f)), 3000)
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);

    console.log(e);

    const droppedFiles = Array.from(e.dataTransfer.files);
    setSelectedFile((prev) => [...prev, ...droppedFiles]);
  };

  // const simulateUpload = () => {
  //   const newFile = { name: file.name, size: '1.8 MB', type: 'General', status: 'uploading', date: 'Feb 25' }
  //   setFiles(prev => [...prev, newFile])
  //   setTimeout(() => setFiles(prev => prev.map((f, i) => i === prev.length - 1 ? { ...f, status: 'processing' } : f)), 1000)
  //   setTimeout(() => setFiles(prev => prev.map((f, i) => i === prev.length - 1 ? { ...f, status: 'processed' }  : f)), 3000)
  // }

  const handleFileSelect = (e) => {
    const file = Array.from(e.target.files);
    setSelectedFile((prev) => [...prev, ...file]);
    // selectedFiles.forEach(file => uploadFile(file))
    console.log("Selected files:", file);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="animate-fade-in">
      <Header
        title="Document Upload"
        subtitle="Upload medical records, lab results, and prescriptions"
      />

      <div className="flex flex-col lg:grid lg:grid-cols-2 gap-5">
        <div className="flex flex-col gap-4 sm:gap-5">
          <input
            type="file"
            multiple
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            accept=".pdf,.dcm,.jpg,.jpeg,.png"
          />
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            // onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current.click()}
            className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200
              ${
                dragging
                  ? "border-teal-light bg-teal/10"
                  : "border-cream/15 bg-cream/[0.02] hover:border-teal/40 hover:bg-teal/5"
              }`}
          >
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-teal/15 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Icon name="upload" size={22} className="text-teal-light" />
            </div>
            <h3 className="text-sm sm:text-base font-medium text-cream mb-2">
              Drop files here or tap to upload
            </h3>
            <p className="text-slate text-xs sm:text-sm mb-4 sm:mb-5">
              PDF, DICOM, JPEG, PNG — up to 50 MB
            </p>
            {/* <div className="flex items-center justify-center flex-wrap gap-2">
              <Badge variant="teal">HIPAA Compliant</Badge>
              <Badge variant="amber">AES-256 Encrypted</Badge>
            </div> */}
          </div>

          {/* Preview */}
          {selectedFile.length > 0 && (
            <div className="bg-cream/[0.03] border border-cream/10 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-cream mb-3">
                Selected Files
              </h4>

              <div className="flex flex-col gap-3">
                {selectedFile.map((file, index) => {
                  const isImage = file.type.startsWith("image/");

                  return (
                    <div
                      key={index}
                      className="flex items-center gap-3 bg-[#0D1B3E] p-3 rounded-lg"
                    >
                      {isImage ? (
                        <img src={URL.createObjectURL(file)} alt={file.name} className="w-12 h-12 object-cover rounded-md" />
                      ) : (
                        <div className="w-12 h-12 flex items-center justify-center bg-cream/[0.06] rounded-md text-teal-light text-lg">
                          📄
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-cream truncate">{file.name}</p>
                        <p className="text-xs text-slate">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>

                      <button
              onClick={() => {
                setSelectedFile((prev) =>
                  prev.filter((_, i) => i !== index)
                )

                if (fileInputRef.current) {
                  fileInputRef.current.value = "";
                }
              }
              }
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
            <h4 className="text-sm font-semibold text-cream mb-4">
              Upload Settings
            </h4>
            <div className="flex flex-col gap-4">
              <div>
                <label className="form-label">Document Type</label>
                <select
                  className="form-input"
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                >
                  <option value="lab" className="bg-[#0D1B3E] text-cream">
                    Lab Results
                  </option>
                  <option value="imaging" className="bg-[#0D1B3E] text-cream">
                    Imaging
                  </option>
                  <option
                    value="prescription"
                    className="bg-[#0D1B3E] text-cream"
                  >
                    Prescription
                  </option>
                  <option value="referral" className="bg-[#0D1B3E] text-cream">
                    Referral
                  </option>
                  <option value="other" className="bg-[#0D1B3E] text-cream">
                    Other
                  </option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                  <Icon name="chevron-down" size={16} className="text-slate" />
                </div>
              </div>
              <div>
                <label className="form-label">Notes (optional)</label>
                <textarea
                  className="form-input resize-none h-20"
                  placeholder="Add context about this document…"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
              <Button
                icon="upload"
                className="w-fit"
                onClick={() => {selectedFile.forEach((file) => uploadFile(file));
                setSelectedFile([]);

                setDocumentType("Lab Results");
                setNotes("");

                if (fileInputRef.current) {
                  fileInputRef.current.value = "";
                }
                }}
              >
                Upload File
              </Button>
            </div>
          </Card>
        </div>

        <Card>
          <div className="flex justify-between items-center mb-4 sm:mb-5">
            <h3 className="text-sm sm:text-[15px] font-semibold text-cream">
              Recent Documents
            </h3>
            <span className="text-xs text-slate">{files.length} files</span>
          </div>
          <div>
            {files.map((f, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 py-3.5 ${i < files.length - 1 ? "border-b border-cream/[0.07]" : ""}`}
              >
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-cream/[0.06] rounded-lg flex items-center justify-center shrink-0">
                  <Icon name="file" size={16} className="text-teal-light" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-cream truncate">
                    {f.name}
                  </p>
                  <p className="text-[10px] sm:text-[11px] text-slate">
                    {f.type} · {f.size} · {f.date}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Badge variant={STATUS_VARIANT[f.status]}>
                    {f.status === "uploading" && (
                      <span className="w-2 h-2 border border-current border-t-transparent rounded-full animate-spin-slow" />
                    )}
                    <span className="hidden sm:inline">{f.status}</span>
                    <span className="sm:hidden">
                      {f.status === "processed"
                        ? "✓"
                        : f.status === "processing"
                          ? "…"
                          : "↑"}
                    </span>
                  </Badge>
                  {f.status === "processed" && (
                    <button className="btn-ghost !p-1.5">
                      <Icon name="eye" size={13} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

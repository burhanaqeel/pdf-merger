"use client";

import { DownloadPanel } from "@/components/DownloadPanel";
import { FolderUploadPanel } from "@/components/FolderUploadPanel";
import { MergePreviewPanel } from "@/components/MergePreviewPanel";
import { PageArrangePanel } from "@/components/PageArrangePanel";
import { StepIndicator } from "@/components/StepIndicator";
import { usePdfMerger } from "@/hooks/usePdfMerger";

export function PdfMergerApp() {
  const {
    step,
    folders,
    groups,
    arrangeGroups,
    unmatched,
    results,
    outputFolderName,
    autoDownloaded,
    isLoading,
    isMerging,
    notice,
    error,
    isWideStep,
    setOutputFolderName,
    setStep,
    handleAddFolder,
    handleRemoveFolder,
    handleContinueToPreview,
    handleContinueToArrange,
    handleReorderSource,
    handleRemoveSource,
    handleMoveGroup,
    handleRemoveGroup,
    handleMovePage,
    handleRemovePage,
    handleMerge,
    handleStartOver,
    handleBackToPreview,
  } = usePdfMerger();

  return (
    <div className="min-h-screen">
      <div
        className={`mx-auto flex w-full flex-col gap-8 px-5 py-10 sm:px-8 sm:py-14 ${
          isWideStep ? "max-w-5xl" : "max-w-3xl"
        }`}
      >
        <header className="space-y-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              PDF Merger
            </h1>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Match by filename · arrange pages · download
            </p>
          </div>
          <StepIndicator current={step} />
        </header>

        <main className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm sm:p-8">
          {error && (
            <div
              className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              role="alert"
            >
              {error}
            </div>
          )}

          {step === "upload" && (
            <FolderUploadPanel
              folders={folders}
              isLoading={isLoading}
              notice={notice}
              onAddFolder={handleAddFolder}
              onRemoveFolder={handleRemoveFolder}
              onContinue={handleContinueToPreview}
            />
          )}

          {step === "preview" && (
            <MergePreviewPanel
              groups={groups}
              unmatched={unmatched}
              onReorderSource={handleReorderSource}
              onRemoveSource={handleRemoveSource}
              onMoveGroup={handleMoveGroup}
              onRemoveGroup={handleRemoveGroup}
              onBack={() => setStep("upload")}
              onContinue={handleContinueToArrange}
            />
          )}

          {step === "arrange" && (
            <PageArrangePanel
              arrangeGroups={arrangeGroups}
              outputFolderName={outputFolderName}
              isMerging={isMerging}
              onOutputFolderNameChange={setOutputFolderName}
              onMovePage={handleMovePage}
              onRemovePage={handleRemovePage}
              onBack={handleBackToPreview}
              onMerge={handleMerge}
            />
          )}

          {step === "done" && (
            <DownloadPanel
              results={results}
              outputFolderName={outputFolderName}
              autoDownloaded={autoDownloaded}
              onOutputFolderNameChange={setOutputFolderName}
              onStartOver={handleStartOver}
            />
          )}
        </main>

        <footer className="text-center text-xs text-[var(--muted)]">
          All processing happens in your browser. Files never leave your device.
        </footer>
      </div>
    </div>
  );
}

//
//  CaptureView.swift
//  ArcaCapture
//
//  Capture flow:
//    1. User imports a screenshot from Photos or Files.
//    2. App runs local OCR (Apple Vision).
//    3. SourceDetector identifies the screenshot type from OCR text.
//    4. The matching parser extracts structured fields.
//    5. The matching review screen lets the user verify, then save persists
//       a typed entry (WeightEntry for Arboleaf, RecoveryEntry for Morpheus).
//
//  Phase A supports two sources: Arboleaf body composition and Morpheus
//  daily recovery. Detection is automatic from OCR text — no source
//  picker needed.
//

import SwiftUI
import PhotosUI

struct CaptureView: View {
    @State private var pickerSelection: PhotosPickerItem?
    @State private var imageData: Data?
    @State private var importedImageDate: Date?
    @State private var loadError: String?

    @State private var ocrState: OCRState = .idle
    @State private var ocrResult: OCRResult?

    /// What source the OCR text looks like. Drives parser + review screen choice.
    @State private var detectedSource: CaptureSource = .unknown

    /// Populated when detectedSource == .arboleaf.
    @State private var arboleafResult: ArboleafParseResult?

    /// Populated when detectedSource == .morpheus.
    @State private var morpheusResult: MorpheusParseResult?

    @State private var showReview = false

    private enum OCRState {
        case idle
        case running
        case done
        case error(String)
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
                    if let imageData,
                       let uiImage = UIImage(data: imageData) {
                        previewSection(uiImage: uiImage, dataSize: imageData.count)
                        ocrSection()
                    } else {
                        emptyState
                    }
                }
                .padding()
            }
            .navigationTitle("Capture")
            // navigationDestination MUST be inside the NavigationStack
            // closure — outside is silently ignored by SwiftUI.
            .navigationDestination(isPresented: $showReview) {
                reviewDestination
            }
        }
        .onChange(of: pickerSelection) { _, newItem in
            Task { await loadImage(from: newItem) }
        }
        .onChange(of: imageData) { _, newData in
            // Reset all derived state whenever the image changes.
            ocrResult = nil
            arboleafResult = nil
            morpheusResult = nil
            detectedSource = .unknown
            ocrState = .idle
            if newData != nil {
                Task { await runOCR() }
            }
        }
    }

    // MARK: - Review destination router

    @ViewBuilder
    private var reviewDestination: some View {
        switch detectedSource {
        case .arboleaf:
            if let arboleafResult {
                ReviewView(
                    parseResult: arboleafResult,
                    imageData: imageData,
                    rawOcrText: ocrResult?.rawText,
                    onSaved: { clearSelection() }
                )
            }
        case .morpheus:
            if let morpheusResult {
                MorpheusReviewView(
                    parseResult: morpheusResult,
                    imageData: imageData,
                    rawOcrText: ocrResult?.rawText,
                    onSaved: { clearSelection() }
                )
            }
        case .unknown:
            // Shouldn't reach here — review button is disabled when source
            // is unknown. Show a message if it does happen.
            VStack(spacing: 12) {
                Image(systemName: "questionmark.circle")
                    .font(.system(size: 48))
                    .foregroundStyle(.secondary)
                Text("Couldn't identify this screenshot type.")
                    .font(.headline)
                Text("Phase A supports Arboleaf body composition and Morpheus recovery screenshots.")
                    .font(.callout)
                    .foregroundStyle(.secondary)
                    .multilineTextAlignment(.center)
            }
            .padding()
            .navigationTitle("Unknown source")
        }
    }

    // MARK: - Subviews

    @ViewBuilder
    private func previewSection(uiImage: UIImage, dataSize: Int) -> some View {
        Image(uiImage: uiImage)
            .resizable()
            .scaledToFit()
            .frame(maxWidth: .infinity)
            .frame(maxHeight: 280)
            .clipShape(RoundedRectangle(cornerRadius: 14))
            .overlay(
                RoundedRectangle(cornerRadius: 14)
                    .strokeBorder(Color.secondary.opacity(0.2), lineWidth: 1)
            )

        Text(importSummary(dataSize: dataSize))
            .font(.caption)
            .foregroundStyle(.secondary)

        HStack(spacing: 12) {
            PhotosPicker(
                selection: $pickerSelection,
                matching: .images,
                photoLibrary: .shared()
            ) {
                Label("Replace", systemImage: "arrow.triangle.2.circlepath")
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 6)
            }
            .buttonStyle(.bordered)

            Button(role: .destructive) {
                clearSelection()
            } label: {
                Label("Clear", systemImage: "xmark")
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 6)
            }
            .buttonStyle(.bordered)
        }
    }

    @ViewBuilder
    private func ocrSection() -> some View {
        VStack(alignment: .leading, spacing: 10) {
            Divider().padding(.vertical, 4)

            HStack {
                Text("OCR")
                    .font(.headline)
                Spacer()
                ocrStatusView
            }

            switch ocrState {
            case .idle, .error:
                Button {
                    Task { await runOCR() }
                } label: {
                    Label("Extract text", systemImage: "text.viewfinder")
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 6)
                }
                .buttonStyle(.borderedProminent)

            case .running:
                ProgressView("Extracting…")
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 8)

            case .done:
                if let raw = ocrResult?.rawText, !raw.isEmpty {
                    parseSummaryBanner

                    reviewButton

                    DisclosureGroup("Raw OCR text") {
                        ScrollView {
                            Text(raw)
                                .font(.system(.footnote, design: .monospaced))
                                .frame(maxWidth: .infinity, alignment: .leading)
                                .padding(10)
                                .textSelection(.enabled)
                        }
                        .frame(maxHeight: 200)
                        .background(Color.secondary.opacity(0.06))
                        .clipShape(RoundedRectangle(cornerRadius: 10))
                    }
                    .font(.caption)

                    Button {
                        Task { await runOCR() }
                    } label: {
                        Label("Re-run OCR", systemImage: "arrow.clockwise")
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 6)
                    }
                    .buttonStyle(.bordered)
                } else {
                    Text("OCR returned no text. Try a clearer screenshot.")
                        .font(.callout)
                        .foregroundStyle(.secondary)
                }
            }
        }
    }

    // MARK: - Parse summary banner (source-aware)

    @ViewBuilder
    private var parseSummaryBanner: some View {
        switch detectedSource {
        case .arboleaf:
            if let r = arboleafResult {
                bannerView(
                    needsReview: r.needsReview,
                    confidence: r.confidence,
                    headline: arboleafHeadline(r),
                    detail: arboleafDetail(r),
                    sourceLabel: "Arboleaf"
                )
            }
        case .morpheus:
            if let r = morpheusResult {
                bannerView(
                    needsReview: r.needsReview,
                    confidence: r.confidence,
                    headline: morpheusHeadline(r),
                    detail: morpheusDetail(r),
                    sourceLabel: "Morpheus"
                )
            }
        case .unknown:
            VStack(alignment: .leading, spacing: 6) {
                HStack(spacing: 8) {
                    Image(systemName: "questionmark.circle")
                        .foregroundStyle(.orange)
                    Text("Couldn't identify this screenshot type")
                        .font(.subheadline)
                        .fontWeight(.semibold)
                }
                Text("Phase A supports Arboleaf body composition and Morpheus daily recovery. Re-run OCR or pick a different screenshot.")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
            .padding(10)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(Color.secondary.opacity(0.08))
            .clipShape(RoundedRectangle(cornerRadius: 10))
        }
    }

    @ViewBuilder
    private func bannerView(needsReview: Bool, confidence: Double, headline: String, detail: String, sourceLabel: String) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack(spacing: 8) {
                Image(systemName: needsReview ? "exclamationmark.triangle.fill" : "checkmark.circle.fill")
                    .foregroundStyle(needsReview ? .orange : .green)
                Text(headline)
                    .font(.subheadline)
                    .fontWeight(.semibold)
                Spacer()
                Text("\(Int(confidence * 100))%")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
            HStack {
                Text(sourceLabel)
                    .font(.caption2)
                    .padding(.horizontal, 6)
                    .padding(.vertical, 2)
                    .background(Color.secondary.opacity(0.15))
                    .clipShape(Capsule())
                Text(detail)
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
        }
        .padding(10)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color.secondary.opacity(0.08))
        .clipShape(RoundedRectangle(cornerRadius: 10))
    }

    @ViewBuilder
    private var reviewButton: some View {
        Button {
            showReview = true
        } label: {
            Label("Review and save", systemImage: "checkmark.circle")
                .frame(maxWidth: .infinity)
                .padding(.vertical, 6)
        }
        .buttonStyle(.borderedProminent)
        .disabled(!canReview)
    }

    private var canReview: Bool {
        switch detectedSource {
        case .arboleaf: return arboleafResult?.weightKg != nil
        case .morpheus: return morpheusResult?.recoveryPercent != nil
        case .unknown: return false
        }
    }

    // MARK: - Headline + detail formatters

    private func arboleafHeadline(_ r: ArboleafParseResult) -> String {
        if let w = r.weightKg {
            return String(format: "Weight %.2f kg", w)
        }
        return "Couldn't extract weight"
    }

    private func arboleafDetail(_ r: ArboleafParseResult) -> String {
        var parts: [String] = []
        if let v = r.bodyFatPercent  { parts.append(String(format: "BF %.1f%%", v)) }
        if let v = r.bmi             { parts.append(String(format: "BMI %.1f", v)) }
        if let v = r.bodyWaterPercent { parts.append(String(format: "Water %.1f%%", v)) }
        if let v = r.muscleMassKg    { parts.append(String(format: "Muscle %.1fkg", v)) }
        return parts.isEmpty ? "No secondary metrics detected" : parts.joined(separator: " · ")
    }

    private func morpheusHeadline(_ r: MorpheusParseResult) -> String {
        if let pct = r.recoveryPercent {
            if let delta = r.recoveryDelta {
                return String(format: "Recovery %.0f%% (%@%.0f%%)", pct, delta >= 0 ? "+" : "", delta)
            }
            return String(format: "Recovery %.0f%%", pct)
        }
        return "Couldn't extract recovery"
    }

    private func morpheusDetail(_ r: MorpheusParseResult) -> String {
        var parts: [String] = []
        if let hrv = r.hrv { parts.append("HRV \(hrv)") }
        if let act = r.activity { parts.append("Activity \(act)") }
        if let sleep = r.sleepDurationDisplay { parts.append("Sleep \(sleep)") }
        return parts.isEmpty ? "No secondary metrics detected" : parts.joined(separator: " · ")
    }

    @ViewBuilder
    private var ocrStatusView: some View {
        switch ocrState {
        case .idle:
            Text("not run").font(.caption).foregroundStyle(.tertiary)
        case .running:
            Text("running…").font(.caption).foregroundStyle(.secondary)
        case .done:
            Label("done", systemImage: "checkmark.circle.fill")
                .font(.caption)
                .foregroundStyle(.green)
                .labelStyle(.titleAndIcon)
        case .error(let msg):
            Label(msg, systemImage: "exclamationmark.triangle.fill")
                .font(.caption)
                .foregroundStyle(.red)
                .labelStyle(.titleAndIcon)
                .lineLimit(2)
        }
    }

    @ViewBuilder
    private var emptyState: some View {
        Spacer().frame(height: 40)

        Image(systemName: "photo.badge.plus")
            .font(.system(size: 72))
            .foregroundStyle(.secondary)

        Text("Import a health screenshot")
            .font(.headline)

        Text("Arboleaf body composition or Morpheus daily recovery. The app runs OCR locally and routes to the right parser automatically.")
            .font(.callout)
            .foregroundStyle(.secondary)
            .multilineTextAlignment(.center)
            .padding(.horizontal)

        PhotosPicker(
            selection: $pickerSelection,
            matching: .images,
            photoLibrary: .shared()
        ) {
            Label("Choose Screenshot", systemImage: "photo.on.rectangle")
                .frame(maxWidth: .infinity)
                .padding(.vertical, 8)
        }
        .buttonStyle(.borderedProminent)
        .padding(.horizontal)

        if let loadError {
            Text(loadError)
                .font(.caption)
                .foregroundStyle(.red)
                .multilineTextAlignment(.center)
                .padding(.horizontal)
        }
    }

    // MARK: - Actions

    @MainActor
    private func loadImage(from item: PhotosPickerItem?) async {
        guard let item else { return }
        loadError = nil
        do {
            if let data = try await item.loadTransferable(type: Data.self) {
                importedImageDate = ImageMetadataService.creationDate(in: data)
                imageData = data
            } else {
                loadError = "The selected item didn't return image data. Try a different screenshot."
            }
        } catch {
            loadError = "Failed to load image: \(error.localizedDescription)"
        }
    }

    private func clearSelection() {
        pickerSelection = nil
        imageData = nil
        importedImageDate = nil
        loadError = nil
        ocrResult = nil
        arboleafResult = nil
        morpheusResult = nil
        detectedSource = .unknown
        ocrState = .idle
    }

    @MainActor
    private func runOCR() async {
        guard let data = imageData else { return }
        ocrState = .running
        do {
            let result = try await OCRService.recognizeText(in: data)
            ocrResult = result

            // Detect source from raw OCR text and run the matching parser.
            let source = SourceDetector.detect(from: result.rawText)
            detectedSource = source
            switch source {
            case .arboleaf:
                var parsed = ArboleafParser.parse(result)
                if parsed.measurementDate == nil {
                    parsed.measurementDate = importedImageDate
                }
                arboleafResult = parsed
                morpheusResult = nil
            case .morpheus:
                var parsed = MorpheusParser.parse(result)
                if parsed.measurementDate == nil {
                    parsed.measurementDate = importedImageDate
                }
                morpheusResult = parsed
                arboleafResult = nil
            case .unknown:
                arboleafResult = nil
                morpheusResult = nil
            }
            ocrState = .done
        } catch {
            ocrState = .error(error.localizedDescription)
        }
    }

    private func importSummary(dataSize: Int) -> String {
        var parts = [
            "Imported",
            dataSize.formatted(.byteCount(style: .file))
        ]
        if let importedImageDate {
            parts.append("Screenshot \(importedImageDate.formatted(date: .abbreviated, time: .shortened))")
        }
        return parts.joined(separator: " · ")
    }
}

#Preview {
    CaptureView()
}

//
//  MorpheusReviewView.swift
//  ArcaCapture
//
//  Review + save for parsed Morpheus daily snapshots. Mirrors ReviewView's
//  shape but with the smaller Morpheus field set (Recovery, HRV, Activity,
//  Sleep).
//

import SwiftUI
import SwiftData

struct MorpheusReviewView: View {
    let parseResult: MorpheusParseResult
    let imageData: Data?
    let rawOcrText: String?
    let onSaved: () -> Void

    @Environment(\.modelContext) private var modelContext
    @Environment(\.dismiss) private var dismiss

    @State private var measurementDate: Date
    @State private var recoveryText: String
    @State private var recoveryDeltaText: String
    @State private var hrvText: String
    @State private var activityText: String
    @State private var sleepText: String

    @State private var showRawOcr = false
    @State private var saveError: String?

    init(
        parseResult: MorpheusParseResult,
        imageData: Data?,
        rawOcrText: String?,
        onSaved: @escaping () -> Void
    ) {
        self.parseResult = parseResult
        self.imageData = imageData
        self.rawOcrText = rawOcrText
        self.onSaved = onSaved
        _measurementDate = State(initialValue: parseResult.measurementDate ?? Date())
        _recoveryText = State(initialValue: parseResult.recoveryPercent.map { Self.formatNumber($0) } ?? "")
        _recoveryDeltaText = State(initialValue: parseResult.recoveryDelta.map { Self.formatNumber($0) } ?? "")
        _hrvText = State(initialValue: parseResult.hrv.map { String($0) } ?? "")
        _activityText = State(initialValue: parseResult.activity.map { String($0) } ?? "")
        _sleepText = State(initialValue: parseResult.sleepDurationDisplay ?? "")
    }

    var body: some View {
        Form {
            if let saveError {
                Section {
                    HStack(alignment: .top, spacing: 8) {
                        Image(systemName: "exclamationmark.octagon.fill")
                            .foregroundStyle(.red)
                        Text(saveError)
                            .font(.callout)
                            .foregroundStyle(.red)
                    }
                }
            }

            Section {
                HStack {
                    Image(systemName: parseResult.needsReview ? "exclamationmark.triangle.fill" : "checkmark.circle.fill")
                        .foregroundStyle(parseResult.needsReview ? .orange : .green)
                    VStack(alignment: .leading, spacing: 2) {
                        Text(parseResult.needsReview ? "Review before saving" : "Looks good")
                            .font(.subheadline)
                            .fontWeight(.semibold)
                        Text("Parser confidence: \(Int(parseResult.confidence * 100))%")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                }
            }

            Section("Measurement") {
                DatePicker("Date", selection: $measurementDate, displayedComponents: [.date, .hourAndMinute])
            }

            Section("Recovery") {
                LabeledNumberField(label: "Recovery (%)", text: $recoveryText, isRequired: true)
                LabeledNumberField(label: "Delta (%)", text: $recoveryDeltaText, keyboardType: .numbersAndPunctuation)
            }

            Section("Daily metrics") {
                LabeledNumberField(label: "HRV (ms)", text: $hrvText)
                LabeledNumberField(label: "Activity", text: $activityText)
                HStack {
                    Text("Sleep (HH:MM)")
                    Spacer()
                    TextField("—", text: $sleepText)
                        .multilineTextAlignment(.trailing)
                        .frame(maxWidth: 120)
                }
            }

            Section {
                if let imageData, let uiImage = UIImage(data: imageData) {
                    Image(uiImage: uiImage)
                        .resizable()
                        .scaledToFit()
                        .frame(maxHeight: 240)
                        .clipShape(RoundedRectangle(cornerRadius: 8))
                }
                DisclosureGroup(isExpanded: $showRawOcr) {
                    if let rawOcrText {
                        Text(rawOcrText)
                            .font(.system(.caption2, design: .monospaced))
                            .foregroundStyle(.secondary)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .textSelection(.enabled)
                    }
                } label: {
                    Text("Raw OCR text").font(.caption)
                }
            } header: {
                Text("Source")
            }

            Section {
                Button {
                    save()
                } label: {
                    Label("Save entry", systemImage: "checkmark.circle.fill")
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 4)
                }
                .buttonStyle(.borderedProminent)
                .disabled(parsedRecoveryPercent() == nil)
                .listRowBackground(Color.clear)
            }
        }
        .navigationTitle("Review")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .cancellationAction) {
                Button("Cancel") { dismiss() }
            }
            ToolbarItem(placement: .confirmationAction) {
                Button("Save") { save() }
                    .disabled(parsedRecoveryPercent() == nil)
            }
        }
    }

    // MARK: - Save

    private func save() {
        print("[MorpheusReview] Save tapped")
        saveError = nil

        guard let recoveryPercent = parsedRecoveryPercent() else {
            saveError = "Recovery is required (got '\(recoveryText)')."
            return
        }

        let entry = RecoveryEntry(
            capturedAt: Date(),
            measurementDate: measurementDate,
            sourceType: "morpheus_screenshot",
            originalImagePath: persistImageIfPresent(),
            recoveryPercent: recoveryPercent,
            recoveryDelta: Double(recoveryDeltaText.replacingOccurrences(of: ",", with: ".")),
            hrv: Int(hrvText),
            activity: Int(activityText),
            sleepMinutes: parseSleepMinutes(sleepText),
            sleepDurationDisplay: sleepText.isEmpty ? nil : sleepText,
            rawOcrText: rawOcrText,
            parseConfidence: parseResult.confidence,
            needsReview: false
        )

        modelContext.insert(entry)
        do {
            try modelContext.save()
            let savedCallback = onSaved
            dismiss()
            Task { @MainActor in
                savedCallback()
            }
        } catch {
            print("[MorpheusReview] save() FAILED: \(error)")
            saveError = "Save failed: \(error.localizedDescription)"
            modelContext.delete(entry)
        }
    }

    private func persistImageIfPresent() -> String? {
        guard let imageData else { return nil }
        let fileManager = FileManager.default
        guard let docs = fileManager.urls(for: .documentDirectory, in: .userDomainMask).first else {
            return nil
        }
        let dir = docs.appendingPathComponent("captures", isDirectory: true)
        do {
            if !fileManager.fileExists(atPath: dir.path) {
                try fileManager.createDirectory(at: dir, withIntermediateDirectories: true)
            }
            let filename = "morpheus-\(UUID().uuidString).png"
            let url = dir.appendingPathComponent(filename)
            try imageData.write(to: url)
            return "captures/\(filename)"
        } catch {
            return nil
        }
    }

    private func parsedRecoveryPercent() -> Double? {
        let normalized = recoveryText.replacingOccurrences(of: ",", with: ".")
        return Double(normalized)
    }

    private func parseSleepMinutes(_ text: String) -> Int? {
        let parts = text.split(separator: ":")
        guard parts.count == 2,
              let hours = Int(parts[0]),
              let minutes = Int(parts[1]) else {
            return nil
        }
        return hours * 60 + minutes
    }

    private static func formatNumber(_ value: Double) -> String {
        if value == value.rounded() {
            return String(Int(value))
        }
        return String(format: "%.1f", value)
    }
}

private struct LabeledNumberField: View {
    let label: String
    @Binding var text: String
    var isRequired: Bool = false
    var keyboardType: UIKeyboardType = .decimalPad

    var body: some View {
        HStack(spacing: 0) {
            Text(label)
            if isRequired {
                Text(" *")
                    .foregroundStyle(.red)
            }
            Spacer()
            TextField("—", text: $text)
                .multilineTextAlignment(.trailing)
                .keyboardType(keyboardType)
                .frame(maxWidth: 120)
        }
    }
}

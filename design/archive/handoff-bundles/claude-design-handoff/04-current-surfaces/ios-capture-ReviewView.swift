//
//  ReviewView.swift
//  ArcaCapture
//
//  Slice 3 of Phase A. Takes a parsed Arboleaf measurement, lets the user
//  correct any field that looks wrong, and persists a WeightEntry to
//  SwiftData.
//
//  Editable: measurement date, weight, parsed secondary metrics.
//  Visible-but-not-editable: source image preview, raw OCR text, parse
//  confidence/needs-review state.
//

import SwiftUI
import SwiftData

struct ReviewView: View {
    let parseResult: ArboleafParseResult
    let imageData: Data?
    let rawOcrText: String?

    /// Called after successful save so the parent can dismiss + reset.
    let onSaved: () -> Void

    @Environment(\.modelContext) private var modelContext
    @Environment(\.dismiss) private var dismiss

    // Editable draft values, seeded from parseResult.
    @State private var measurementDate: Date
    @State private var weightText: String
    @State private var bodyFatText: String
    @State private var bmiText: String
    @State private var skeletalMuscleText: String
    @State private var muscleMassText: String
    @State private var bodyWaterText: String
    @State private var boneMassText: String
    @State private var visceralFatText: String
    @State private var subcutaneousFatText: String
    @State private var metabolicAgeText: String
    @State private var proteinText: String
    @State private var bmrText: String
    @State private var fatFreeBodyText: String
    @State private var bodyTypeText: String

    @State private var showRawOcr = false
    @State private var saveError: String?

    init(
        parseResult: ArboleafParseResult,
        imageData: Data?,
        rawOcrText: String?,
        onSaved: @escaping () -> Void
    ) {
        self.parseResult = parseResult
        self.imageData = imageData
        self.rawOcrText = rawOcrText
        self.onSaved = onSaved
        _measurementDate = State(initialValue: parseResult.measurementDate ?? Date())
        _weightText = State(initialValue: Self.formatOptional(parseResult.weightKg))
        _bodyFatText = State(initialValue: Self.formatOptional(parseResult.bodyFatPercent))
        _bmiText = State(initialValue: Self.formatOptional(parseResult.bmi))
        _skeletalMuscleText = State(initialValue: Self.formatOptional(parseResult.skeletalMusclePercent))
        _muscleMassText = State(initialValue: Self.formatOptional(parseResult.muscleMassKg))
        _bodyWaterText = State(initialValue: Self.formatOptional(parseResult.bodyWaterPercent))
        _boneMassText = State(initialValue: Self.formatOptional(parseResult.boneMassKg))
        _visceralFatText = State(initialValue: Self.formatOptional(parseResult.visceralFat))
        _subcutaneousFatText = State(initialValue: Self.formatOptional(parseResult.subcutaneousFatPercent))
        _metabolicAgeText = State(initialValue: parseResult.metabolicAge.map { String($0) } ?? "")
        _proteinText = State(initialValue: Self.formatOptional(parseResult.proteinPercent))
        _bmrText = State(initialValue: parseResult.bmrKcal.map { String($0) } ?? "")
        _fatFreeBodyText = State(initialValue: Self.formatOptional(parseResult.fatFreeBodyWeightKg))
        _bodyTypeText = State(initialValue: parseResult.bodyType ?? "")
    }

    var body: some View {
        Form {
            // Save error pinned to the top so the user actually sees it.
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

            // Confidence banner
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
                LabeledNumberField(label: "Weight (kg)", text: $weightText, isRequired: true)
            }

            Section("Body composition") {
                LabeledNumberField(label: "Body Fat (%)", text: $bodyFatText)
                LabeledNumberField(label: "BMI", text: $bmiText)
                LabeledNumberField(label: "Skeletal Muscle (%)", text: $skeletalMuscleText)
                LabeledNumberField(label: "Muscle Mass (kg)", text: $muscleMassText)
                LabeledNumberField(label: "Body Water (%)", text: $bodyWaterText)
                LabeledNumberField(label: "Bone Mass (kg)", text: $boneMassText)
                LabeledNumberField(label: "Visceral Fat", text: $visceralFatText)
                LabeledNumberField(label: "Subcutaneous Fat (%)", text: $subcutaneousFatText)
                LabeledNumberField(label: "Protein (%)", text: $proteinText)
                LabeledNumberField(label: "Fat-free Body (kg)", text: $fatFreeBodyText)
            }

            Section("Other") {
                LabeledNumberField(label: "BMR (kcal)", text: $bmrText)
                LabeledNumberField(label: "Metabolic Age", text: $metabolicAgeText)
                HStack {
                    Text("Body Type")
                    Spacer()
                    TextField("", text: $bodyTypeText)
                        .multilineTextAlignment(.trailing)
                }
            }

            // Debug context: source image + OCR (collapsible)
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

            // Big save button at the bottom of the form so it's reachable
            // without scrolling for the toolbar button. Toolbar Save also kept
            // for users who expect it there.
            Section {
                Button {
                    save()
                } label: {
                    Label("Save entry", systemImage: "checkmark.circle.fill")
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 4)
                }
                .buttonStyle(.borderedProminent)
                .disabled(parsedWeightKg() == nil)
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
                    .disabled(parsedWeightKg() == nil)
            }
        }
    }

    // MARK: - Save

    private func save() {
        print("[ReviewView] Save tapped")
        saveError = nil

        guard let weightKg = parsedWeightKg() else {
            print("[ReviewView] Save aborted: weight is nil. weightText=\(weightText)")
            saveError = "Weight is required (got '\(weightText)')."
            return
        }
        print("[ReviewView] Save proceeding: weightKg=\(weightKg)")

        let entry = WeightEntry(
            capturedAt: Date(),
            measurementDate: measurementDate,
            sourceType: "arboleaf_screenshot",
            originalImagePath: persistImageIfPresent(),
            weightKg: weightKg,
            sourceWeightValue: parseResult.sourceWeightValue,
            sourceWeightUnit: parseResult.sourceWeightUnit,
            bodyFatPercent: Double(bodyFatText),
            skeletalMusclePercent: Double(skeletalMuscleText),
            muscleMassKg: Double(muscleMassText),
            bodyWaterPercent: Double(bodyWaterText),
            boneMassKg: Double(boneMassText),
            visceralFat: Double(visceralFatText),
            subcutaneousFatPercent: Double(subcutaneousFatText),
            metabolicAge: Int(metabolicAgeText),
            bmi: Double(bmiText),
            proteinPercent: Double(proteinText),
            bmrKcal: Int(bmrText),
            fatFreeBodyWeightKg: Double(fatFreeBodyText),
            bodyType: bodyTypeText.isEmpty ? nil : bodyTypeText,
            rawOcrText: rawOcrText,
            parseConfidence: parseResult.confidence,
            needsReview: false
        )

        print("[ReviewView] Inserting entry: id=\(entry.id) weight=\(weightKg)kg")
        modelContext.insert(entry)
        do {
            print("[ReviewView] Calling modelContext.save()...")
            try modelContext.save()
            print("[ReviewView] modelContext.save() succeeded")
            // Dismiss FIRST so the navigation pops cleanly. THEN run cleanup
            // on the parent on the next main-thread tick — clearing parseResult
            // while ReviewView is still on screen makes SwiftUI's
            // navigationDestination rebuild with nil and glitch.
            let savedCallback = onSaved
            dismiss()
            Task { @MainActor in
                print("[ReviewView] Running onSaved callback")
                savedCallback()
            }
        } catch {
            print("[ReviewView] modelContext.save() FAILED: \(error)")
            saveError = "Save failed: \(error.localizedDescription)"
            modelContext.delete(entry)
        }
    }

    /// Persist the screenshot bytes to the app's Documents directory and
    /// return the relative path for storage. Returns nil on failure.
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
            let filename = "arboleaf-\(UUID().uuidString).png"
            let url = dir.appendingPathComponent(filename)
            try imageData.write(to: url)
            return "captures/\(filename)"
        } catch {
            // Non-fatal; the entry can still save without the image.
            return nil
        }
    }

    private func parsedWeightKg() -> Double? {
        let normalized = weightText.replacingOccurrences(of: ",", with: ".")
        return Double(normalized)
    }

    // MARK: - Formatters

    private static func formatOptional(_ value: Double?) -> String {
        guard let value else { return "" }
        // Up to 2 decimal places, no trailing zeros
        if value == value.rounded() {
            return String(Int(value))
        }
        return String(format: "%.2f", value)
    }
}

/// A label/value row with a numeric keyboard. `isRequired` shows a small
/// asterisk next to the label.
private struct LabeledNumberField: View {
    let label: String
    @Binding var text: String
    var isRequired: Bool = false

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
                .keyboardType(.decimalPad)
                .frame(maxWidth: 120)
        }
    }
}

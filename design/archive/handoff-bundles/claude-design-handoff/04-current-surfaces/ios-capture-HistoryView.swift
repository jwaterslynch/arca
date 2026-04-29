//
//  HistoryView.swift
//  ArcaCapture
//
//  Slice 4 of Phase A. Shows saved weight entries as a list + a Swift Charts
//  trend chart over time. Swipe-to-delete on entry rows.
//

import SwiftUI
import SwiftData
import Charts

struct HistoryView: View {
    @Environment(\.modelContext) private var modelContext

    /// Body composition entries (Arboleaf), newest first.
    @Query(sort: \WeightEntry.measurementDate, order: .reverse) private var entries: [WeightEntry]

    /// Daily recovery entries (Morpheus), newest first.
    @Query(sort: \RecoveryEntry.measurementDate, order: .reverse) private var recoveryEntries: [RecoveryEntry]

    private var hasAnyData: Bool {
        !entries.isEmpty || !recoveryEntries.isEmpty
    }

    var body: some View {
        NavigationStack {
            Group {
                if !hasAnyData {
                    ContentUnavailableView(
                        "No entries yet",
                        systemImage: "chart.line.uptrend.xyaxis",
                        description: Text("Capture an Arboleaf or Morpheus screenshot to get started.")
                    )
                } else {
                    List {
                        // Body composition charts (only show if any WeightEntry data).
                        if !entries.isEmpty {
                            Section {
                                MetricChart(
                                    title: "Weight",
                                    unit: "kg",
                                    points: entries.compactMap { MetricChart.Point(date: $0.measurementDate, value: $0.weightKg) }
                                )
                                .listRowInsets(EdgeInsets(top: 12, leading: 8, bottom: 4, trailing: 8))
                            }

                            Section {
                                MetricChart(
                                    title: "Body Fat",
                                    unit: "%",
                                    points: entries.compactMap { entry in
                                        guard let v = entry.bodyFatPercent else { return nil }
                                        return MetricChart.Point(date: entry.measurementDate, value: v)
                                    }
                                )
                                .listRowInsets(EdgeInsets(top: 4, leading: 8, bottom: 4, trailing: 8))
                            }

                            Section {
                                MetricChart(
                                    title: "Muscle Mass",
                                    unit: "kg",
                                    points: entries.compactMap { entry in
                                        guard let v = entry.muscleMassKg else { return nil }
                                        return MetricChart.Point(date: entry.measurementDate, value: v)
                                    }
                                )
                                .listRowInsets(EdgeInsets(top: 4, leading: 8, bottom: 12, trailing: 8))
                            }
                        }

                        // Daily recovery charts (only show if any RecoveryEntry data).
                        if !recoveryEntries.isEmpty {
                            Section {
                                MetricChart(
                                    title: "Recovery",
                                    unit: "%",
                                    points: recoveryEntries.compactMap { MetricChart.Point(date: $0.measurementDate, value: $0.recoveryPercent) }
                                )
                                .listRowInsets(EdgeInsets(top: 12, leading: 8, bottom: 4, trailing: 8))
                            }

                            Section {
                                MetricChart(
                                    title: "HRV",
                                    unit: "ms",
                                    points: recoveryEntries.compactMap { entry in
                                        guard let v = entry.hrv else { return nil }
                                        return MetricChart.Point(date: entry.measurementDate, value: Double(v))
                                    }
                                )
                                .listRowInsets(EdgeInsets(top: 4, leading: 8, bottom: 4, trailing: 8))
                            }

                            Section {
                                MetricChart(
                                    title: "Sleep",
                                    unit: "h",
                                    points: recoveryEntries.compactMap { entry in
                                        guard let mins = entry.sleepMinutes else { return nil }
                                        return MetricChart.Point(date: entry.measurementDate, value: Double(mins) / 60.0)
                                    }
                                )
                                .listRowInsets(EdgeInsets(top: 4, leading: 8, bottom: 4, trailing: 8))
                            }

                            // Workout impact: the recovery delta after a session.
                            // Negative values indicate how hard the workout hit
                            // your recovery (CrossFit days drop 10-20%; light
                            // sessions ~0%). Only entries with a delta show.
                            let workoutPoints: [MetricChart.Point] = recoveryEntries.compactMap { entry in
                                guard let delta = entry.recoveryDelta else { return nil }
                                return MetricChart.Point(date: entry.measurementDate, value: delta)
                            }
                            if workoutPoints.count >= 2 {
                                Section {
                                    MetricChart(
                                        title: "Workout Impact",
                                        unit: "%",
                                        points: workoutPoints
                                    )
                                    .listRowInsets(EdgeInsets(top: 4, leading: 8, bottom: 12, trailing: 8))
                                }
                            }
                        }

                        if !entries.isEmpty {
                            Section("Body composition entries") {
                                ForEach(entries) { entry in
                                    EntryRow(entry: entry)
                                }
                                .onDelete(perform: deleteWeightEntries)
                            }
                        }

                        if !recoveryEntries.isEmpty {
                            Section("Recovery entries") {
                                ForEach(recoveryEntries) { entry in
                                    RecoveryEntryRow(entry: entry)
                                }
                                .onDelete(perform: deleteRecoveryEntries)
                            }
                        }
                    }
                }
            }
            .navigationTitle("History")
            .toolbar {
                if hasAnyData {
                    EditButton()
                }
            }
        }
    }

    // MARK: - Actions

    private func deleteWeightEntries(at offsets: IndexSet) {
        for index in offsets {
            let entry = entries[index]
            if let relativePath = entry.originalImagePath {
                removeImageFile(relativePath: relativePath)
            }
            modelContext.delete(entry)
        }
        try? modelContext.save()
    }

    private func deleteRecoveryEntries(at offsets: IndexSet) {
        for index in offsets {
            let entry = recoveryEntries[index]
            if let relativePath = entry.originalImagePath {
                removeImageFile(relativePath: relativePath)
            }
            modelContext.delete(entry)
        }
        try? modelContext.save()
    }

    private func removeImageFile(relativePath: String) {
        let fileManager = FileManager.default
        guard let docs = fileManager.urls(for: .documentDirectory, in: .userDomainMask).first else { return }
        let url = docs.appendingPathComponent(relativePath)
        try? fileManager.removeItem(at: url)
    }
}

private struct RecoveryEntryRow: View {
    let entry: RecoveryEntry

    var body: some View {
        NavigationLink {
            RecoveryEntryDetailView(entry: entry)
        } label: {
            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    Text(entry.measurementDate, format: .dateTime.day().month(.wide).year())
                        .font(.subheadline)
                    Text(String(format: "Recovery %.0f%%", entry.recoveryPercent))
                        .font(.headline)
                    if let hrv = entry.hrv {
                        Text("HRV \(hrv)")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                }
                Spacer()
                if entry.needsReview {
                    Image(systemName: "exclamationmark.triangle.fill")
                        .foregroundStyle(.orange)
                }
            }
        }
    }
}

private struct RecoveryEntryDetailView: View {
    @Environment(\.modelContext) private var modelContext

    let entry: RecoveryEntry

    @State private var isEditing = false
    @State private var draftMeasurementDate: Date
    @State private var saveError: String?

    init(entry: RecoveryEntry) {
        self.entry = entry
        _draftMeasurementDate = State(initialValue: entry.measurementDate)
    }

    var body: some View {
        Form {
            if let saveError {
                Section {
                    Label(saveError, systemImage: "exclamationmark.octagon.fill")
                        .foregroundStyle(.red)
                }
            }

            Section("Measurement") {
                if isEditing {
                    DatePicker(
                        "Measurement Date",
                        selection: $draftMeasurementDate,
                        displayedComponents: [.date, .hourAndMinute]
                    )
                } else {
                    LabeledContent("Measurement Date", value: entry.measurementDate.formatted(date: .abbreviated, time: .shortened))
                }
                LabeledContent("Recovery (%)", value: String(format: "%.0f", entry.recoveryPercent))
                if let delta = entry.recoveryDelta {
                    LabeledContent("Delta (%)", value: String(format: "%@%.0f", delta >= 0 ? "+" : "", delta))
                }
            }
            Section("Daily metrics") {
                if let hrv = entry.hrv {
                    LabeledContent("HRV (ms)", value: String(hrv))
                }
                if let activity = entry.activity {
                    LabeledContent("Activity", value: String(activity))
                }
                if let display = entry.sleepDurationDisplay {
                    LabeledContent("Sleep", value: display)
                }
            }
            Section("Source") {
                LabeledContent("Captured At", value: entry.capturedAt.formatted(date: .abbreviated, time: .shortened))
                LabeledContent("Confidence", value: entry.parseConfidence.map { String(format: "%.0f%%", $0 * 100) } ?? "—")
                if entry.needsReview {
                    Label("Marked for review", systemImage: "exclamationmark.triangle.fill")
                        .foregroundStyle(.orange)
                }
            }
        }
        .navigationTitle("Recovery")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            if isEditing {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") {
                        draftMeasurementDate = entry.measurementDate
                        saveError = nil
                        isEditing = false
                    }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") {
                        saveMeasurementDate()
                    }
                }
            } else {
                ToolbarItem(placement: .primaryAction) {
                    Button("Edit") {
                        draftMeasurementDate = entry.measurementDate
                        saveError = nil
                        isEditing = true
                    }
                }
            }
        }
    }

    private func saveMeasurementDate() {
        entry.measurementDate = draftMeasurementDate
        do {
            try modelContext.save()
            saveError = nil
            isEditing = false
        } catch {
            saveError = "Could not save date: \(error.localizedDescription)"
        }
    }
}

private struct EntryRow: View {
    let entry: WeightEntry

    var body: some View {
        NavigationLink {
            EntryDetailView(entry: entry)
        } label: {
            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    Text(entry.measurementDate, format: .dateTime.day().month(.wide).year())
                        .font(.subheadline)
                    Text(String(format: "%.1f kg", entry.weightKg))
                        .font(.headline)
                    if let bf = entry.bodyFatPercent {
                        Text(String(format: "%.1f%% body fat", bf))
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                }
                Spacer()
                if entry.needsReview {
                    Image(systemName: "exclamationmark.triangle.fill")
                        .foregroundStyle(.orange)
                }
            }
        }
    }
}

/// Tap a row to inspect every saved field and correct the measurement date
/// after save. This is useful when importing older screenshots that defaulted
/// to today's date during capture.
private struct EntryDetailView: View {
    @Environment(\.modelContext) private var modelContext

    let entry: WeightEntry

    @State private var isEditing = false
    @State private var draftMeasurementDate: Date
    @State private var saveError: String?

    init(entry: WeightEntry) {
        self.entry = entry
        _draftMeasurementDate = State(initialValue: entry.measurementDate)
    }

    var body: some View {
        Form {
            if let saveError {
                Section {
                    Label(saveError, systemImage: "exclamationmark.octagon.fill")
                        .foregroundStyle(.red)
                }
            }

            Section("Measurement") {
                if isEditing {
                    DatePicker(
                        "Measurement Date",
                        selection: $draftMeasurementDate,
                        displayedComponents: [.date, .hourAndMinute]
                    )
                } else {
                    LabeledContent("Measurement Date", value: entry.measurementDate.formatted(date: .abbreviated, time: .shortened))
                }
                LabeledContent("Weight (kg)", value: String(format: "%.2f", entry.weightKg))
                if let v = entry.sourceWeightValue, let unit = entry.sourceWeightUnit {
                    LabeledContent("Source", value: String(format: "%.2f %@", v, unit))
                }
            }
            Section("Body composition") {
                row("Body Fat (%)", entry.bodyFatPercent)
                row("BMI", entry.bmi)
                row("Skeletal Muscle (%)", entry.skeletalMusclePercent)
                row("Muscle Mass (kg)", entry.muscleMassKg)
                row("Body Water (%)", entry.bodyWaterPercent)
                row("Bone Mass (kg)", entry.boneMassKg)
                row("Visceral Fat", entry.visceralFat)
                row("Subcutaneous Fat (%)", entry.subcutaneousFatPercent)
                row("Protein (%)", entry.proteinPercent)
                row("Fat-free Body (kg)", entry.fatFreeBodyWeightKg)
            }
            Section("Other") {
                row("BMR (kcal)", entry.bmrKcal.map { Double($0) })
                row("Metabolic Age", entry.metabolicAge.map { Double($0) })
                if let bodyType = entry.bodyType {
                    LabeledContent("Body Type", value: bodyType)
                }
            }
            Section("Source") {
                LabeledContent("Captured At", value: entry.capturedAt.formatted(date: .abbreviated, time: .shortened))
                LabeledContent("Confidence", value: entry.parseConfidence.map { String(format: "%.0f%%", $0 * 100) } ?? "—")
                if entry.needsReview {
                    Label("Marked for review", systemImage: "exclamationmark.triangle.fill")
                        .foregroundStyle(.orange)
                }
            }
        }
        .navigationTitle("Entry")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            if isEditing {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") {
                        draftMeasurementDate = entry.measurementDate
                        saveError = nil
                        isEditing = false
                    }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") {
                        saveMeasurementDate()
                    }
                }
            } else {
                ToolbarItem(placement: .primaryAction) {
                    Button("Edit") {
                        draftMeasurementDate = entry.measurementDate
                        saveError = nil
                        isEditing = true
                    }
                }
            }
        }
    }

    @ViewBuilder
    private func row(_ label: String, _ value: Double?) -> some View {
        if let value {
            LabeledContent(label, value: formatValue(value))
        }
    }

    private func formatValue(_ v: Double) -> String {
        if v == v.rounded() {
            return String(Int(v))
        }
        return String(format: "%.2f", v)
    }

    private func saveMeasurementDate() {
        entry.measurementDate = draftMeasurementDate
        do {
            try modelContext.save()
            saveError = nil
            isEditing = false
        } catch {
            saveError = "Could not save date: \(error.localizedDescription)"
        }
    }
}

// MARK: - MetricChart

/// Reusable trend chart for a single body-comp metric. The history view
/// stacks three of these (Weight, Body Fat, Muscle Mass).
///
/// - Compact header: title on the left, latest value on the right.
/// - Line + points chart, padded y-domain so points don't crash the borders.
/// - Below the chart: date range and point count.
/// - Auto-hides when fewer than 2 points exist for the metric.
private struct MetricChart: View {
    struct Point: Identifiable {
        let id = UUID()
        let date: Date
        let value: Double
    }

    let title: String
    let unit: String
    /// Points are passed in @Query order (newest first). The view reverses
    /// internally for chronological plotting.
    let points: [Point]

    var body: some View {
        // Need at least 2 points to draw a meaningful trend.
        if points.count < 2 {
            // Hide entirely if we can't trend yet — but show a thin
            // placeholder so the section doesn't flash empty during builds.
            EmptyView()
        } else {
            VStack(alignment: .leading, spacing: 6) {
                HStack(alignment: .lastTextBaseline) {
                    Text(title)
                        .font(.subheadline)
                        .fontWeight(.semibold)
                    Spacer()
                    if let latest = points.first?.value {
                        Text(formatValue(latest))
                            .font(.title3)
                            .fontWeight(.semibold)
                            .monospacedDigit()
                    }
                }
                .padding(.horizontal, 4)

                let chartData = Array(points.reversed())
                Chart {
                    ForEach(chartData) { point in
                        LineMark(
                            x: .value("Date", point.date),
                            y: .value(title, point.value)
                        )
                        .interpolationMethod(.catmullRom)
                        .foregroundStyle(Color.accentColor)

                        PointMark(
                            x: .value("Date", point.date),
                            y: .value(title, point.value)
                        )
                        .foregroundStyle(Color.accentColor)
                        .symbolSize(36)
                    }
                }
                .frame(height: 140)
                .chartYScale(domain: yDomain)
                .chartXAxis {
                    AxisMarks(values: .automatic(desiredCount: 4)) { _ in
                        AxisGridLine()
                        AxisTick()
                        AxisValueLabel(format: .dateTime.day().month(.abbreviated))
                    }
                }
                .chartYAxis {
                    AxisMarks(position: .leading) { _ in
                        AxisGridLine()
                        AxisValueLabel()
                    }
                }

                HStack {
                    Text(rangeSummary)
                        .font(.caption2)
                        .foregroundStyle(.secondary)
                    Spacer()
                    Text("\(points.count) points")
                        .font(.caption2)
                        .foregroundStyle(.secondary)
                }
                .padding(.horizontal, 4)
            }
        }
    }

    /// Pad the y-axis ~15% beyond the data range so points don't kiss the edges.
    private var yDomain: ClosedRange<Double> {
        let values = points.map { $0.value }
        guard let lowest = values.min(), let highest = values.max() else {
            return 0...100
        }
        let span = highest - lowest
        // Different padding floors for kg vs %. Keeps small-range data readable
        // without shrinking the visual amplitude of real change.
        let minPadding: Double = unit == "%" ? 0.3 : 0.5
        let padding = Swift.max(minPadding, span * 0.15)
        return (lowest - padding)...(highest + padding)
    }

    private var rangeSummary: String {
        guard let oldest = points.last?.date,
              let newest = points.first?.date else {
            return ""
        }
        let formatter = DateFormatter()
        formatter.dateFormat = "d MMM"
        return "\(formatter.string(from: oldest)) – \(formatter.string(from: newest))"
    }

    private func formatValue(_ v: Double) -> String {
        // 1 decimal, with unit suffix.
        return String(format: "%.1f %@", v, unit)
    }
}

#Preview {
    HistoryView()
        .modelContainer(for: WeightEntry.self, inMemory: true)
}

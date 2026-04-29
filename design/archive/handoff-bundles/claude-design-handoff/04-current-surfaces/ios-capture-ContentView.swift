//
//  ContentView.swift
//  ArcaCapture
//
//  Root view. Two tabs: History (saved entries + trend) and Capture
//  (import a screenshot and review parsed values before save).
//

import SwiftUI

struct ContentView: View {
    var body: some View {
        TabView {
            HistoryView()
                .tabItem {
                    Label("History", systemImage: "chart.line.uptrend.xyaxis")
                }

            CaptureView()
                .tabItem {
                    Label("Capture", systemImage: "camera.viewfinder")
                }
        }
    }
}

#Preview {
    ContentView()
}

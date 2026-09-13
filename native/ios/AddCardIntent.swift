// AddCardIntent.swift — the "Add Card" seam for Apple Shortcuts.
//
// R-INTENT (roadmap; proposed by Teresa Klein on the launch post,
// 2026-09-10, with her Shortcut half already prototyped). One intent,
// big reach: Shortcuts users can pipe Reminders, other task apps, or
// Siri into the deck. The community builds the last mile.
//
// MASTER COPY: this file is TRACKED at native/ios/AddCardIntent.swift
// and INSTALLED (copied) into ios/App/App/ — which is gitignored, so
// without this master the code would exist only on Amber's disk.
// If you edit one, copy to the other (cp native/ios/AddCardIntent.swift
// ios/App/App/).
//
// Design: perform() never touches the deck. It appends to a pending
// queue in UserDefaults under Capacitor Preferences' namespace
// ("CapacitorStorage." prefix, verified against the plugin source),
// and the web layer ingests the queue at boot and on foreground via
// shortcutsInbox.ts — cards arrive with provenance, through the same
// store paths as every other card (covenant 3: the device owns the
// deck; VISION: "a card arriving with provenance").

import AppIntents
import Foundation

@available(iOS 16.0, *)
struct AddCardIntent: AppIntent {
    static var title: LocalizedStringResource = "Add Card"
    static var description = IntentDescription(
        "Adds a card to your One Job deck. The card appears the next time you open the app.")
    // The deck ingests on next open; no need to launch the app now.
    static var openAppWhenRun: Bool = false

    @Parameter(title: "Title")
    var cardTitle: String

    @Parameter(title: "Description")
    var cardDescription: String?

    @Parameter(title: "Sub-tasks", description: "Each becomes a card inside this card")
    var subtasks: [String]?

    static var parameterSummary: some ParameterSummary {
        Summary("Add \(\.$cardTitle) to One Job") {
            \.$cardDescription
            \.$subtasks
        }
    }

    func perform() async throws -> some IntentResult & ProvidesDialog {
        let key = "CapacitorStorage.oneJobPendingCards"
        let defaults = UserDefaults.standard

        var queue: [[String: Any]] = []
        if let raw = defaults.string(forKey: key),
           let data = raw.data(using: .utf8),
           let parsed = try? JSONSerialization.jsonObject(with: data) as? [[String: Any]] {
            queue = parsed
        }

        let trimmed = cardTitle.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else {
            // Mirrors the store's title invariant: a card needs a title.
            return .result(dialog: "One Job needs a title for the card.")
        }

        var entry: [String: Any] = [
            "title": trimmed,
            "receivedAt": ISO8601DateFormatter().string(from: Date()),
        ]
        if let d = cardDescription?.trimmingCharacters(in: .whitespacesAndNewlines), !d.isEmpty {
            entry["description"] = d
        }
        let subs = (subtasks ?? [])
            .map { $0.trimmingCharacters(in: .whitespacesAndNewlines) }
            .filter { !$0.isEmpty }
        if !subs.isEmpty { entry["subtasks"] = subs }

        queue.append(entry)

        if let data = try? JSONSerialization.data(withJSONObject: queue),
           let raw = String(data: data, encoding: .utf8) {
            defaults.set(raw, forKey: key)
        }

        let n = queue.count
        return .result(dialog: n == 1
            ? "Added. It'll be in your deck next time you open One Job."
            : "Added — \(n) cards waiting for your next open.")
    }
}

@available(iOS 16.0, *)
struct OneJobShortcuts: AppShortcutsProvider {
    static var appShortcuts: [AppShortcut] {
        AppShortcut(
            intent: AddCardIntent(),
            phrases: [
                "Add a card to \(.applicationName)",
                "Add \(\.$cardTitle) to \(.applicationName)",
            ],
            shortTitle: "Add Card",
            systemImageName: "rectangle.stack.badge.plus"
        )
    }
}

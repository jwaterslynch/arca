#!/usr/bin/env python3
"""Arca icon build pipeline.

Renders three master SVGs into all required sizes for:
- arca/src-tauri/icons/                            (Tauri desktop bundle)
- arca/src-tauri/icons/android                     (Tauri Android build)
- arca/src-tauri/icons/ios                         (Tauri iOS build)
- arca-ios-capture/.../AppIcon.appiconset          (Native iOS Capture)
- arca-landing/icon.png                            (Landing favicon)

Required: rsvg-convert, iconutil (macOS).
Optional: Pillow (`pip3 install --user pillow`) — for Windows .ico generation.

Run: python3 arca/design/scripts/build-icons.py
"""
from __future__ import annotations

import shutil
import subprocess
from pathlib import Path

ROOT = Path("/Users/julianwaterslynch/Workspace/Products/Arca")
MASTERS = ROOT / "arca/design/icons-v1"
MASTER = MASTERS / "arca-mark-master.svg"
FLAT = MASTERS / "arca-mark-flat.svg"
TINTED = MASTERS / "arca-mark-tinted.svg"

TAURI = ROOT / "arca/src-tauri/icons"
IOS_APPICONSET = ROOT / "arca-ios-capture/ArcaCapture/Assets.xcassets/AppIcon.appiconset"
LANDING = ROOT / "arca-landing/icon.png"


def render(src: Path, size: int, out: Path) -> None:
    out.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(
        ["rsvg-convert", "-w", str(size), "-h", str(size), str(src), "-o", str(out)],
        check=True,
    )


def render_size(size: int, out: Path) -> None:
    """Pick flat for ≤32 (gradients muddy), master otherwise."""
    src = FLAT if size <= 32 else MASTER
    render(src, size, out)


# Tauri desktop bundle
print("==> Tauri desktop icons")
render_size(32, TAURI / "32x32.png")
render_size(64, TAURI / "64x64.png")
render(MASTER, 128, TAURI / "128x128.png")
render(MASTER, 256, TAURI / "128x128@2x.png")
render(MASTER, 1024, TAURI / "icon.png")
render(FLAT, 50, TAURI / "StoreLogo.png")
for s in [30, 44, 71, 89, 107, 142, 150, 284, 310]:
    render_size(s, TAURI / f"Square{s}x{s}Logo.png")

# Tauri macOS .icns (built via iconutil from a temp .iconset)
print("==> Tauri macOS .icns")
iconset = Path("/tmp/Arca.iconset")
if iconset.exists():
    shutil.rmtree(iconset)
iconset.mkdir(parents=True)
ICNS_SIZES = {
    "icon_16x16.png": 16,
    "icon_16x16@2x.png": 32,
    "icon_32x32.png": 32,
    "icon_32x32@2x.png": 64,
    "icon_128x128.png": 128,
    "icon_128x128@2x.png": 256,
    "icon_256x256.png": 256,
    "icon_256x256@2x.png": 512,
    "icon_512x512.png": 512,
    "icon_512x512@2x.png": 1024,
}
for name, size in ICNS_SIZES.items():
    render_size(size, iconset / name)
subprocess.run(
    ["iconutil", "-c", "icns", str(iconset), "-o", str(TAURI / "icon.icns")],
    check=True,
)

# Tauri Windows .ico (multi-resolution, requires Pillow)
print("==> Tauri Windows .ico")
try:
    from PIL import Image  # type: ignore[import-not-found]

    sizes = [16, 24, 32, 48, 64, 128, 256]
    tmp = Path("/tmp/arca-ico-src")
    if tmp.exists():
        shutil.rmtree(tmp)
    tmp.mkdir(parents=True)
    largest = tmp / "256.png"
    render(MASTER, 256, largest)
    Image.open(largest).save(
        TAURI / "icon.ico",
        format="ICO",
        sizes=[(s, s) for s in sizes],
    )
    print("  icon.ico written (multi-res)")
except ImportError:
    print(
        "  Pillow not installed — keeping existing icon.ico. "
        "Install: pip3 install --user pillow"
    )
except Exception as e:
    print(f"  ICO build failed: {e}")

# Tauri Android (mipmap-* densities)
print("==> Tauri Android")
ANDROID = {
    "mdpi": (48, 108),
    "hdpi": (72, 162),
    "xhdpi": (96, 216),
    "xxhdpi": (144, 324),
    "xxxhdpi": (192, 432),
}
for density, (sq, fg) in ANDROID.items():
    d = TAURI / "android" / f"mipmap-{density}"
    render_size(sq, d / "ic_launcher.png")
    render_size(sq, d / "ic_launcher_round.png")
    render(MASTER, fg, d / "ic_launcher_foreground.png")

# Tauri iOS subfolder (legacy named AppIcon set)
print("==> Tauri iOS")
TAURI_IOS_SIZES = {
    "AppIcon-20x20@1x.png": 20, "AppIcon-20x20@2x.png": 40,
    "AppIcon-20x20@2x-1.png": 40, "AppIcon-20x20@3x.png": 60,
    "AppIcon-29x29@1x.png": 29, "AppIcon-29x29@2x.png": 58,
    "AppIcon-29x29@2x-1.png": 58, "AppIcon-29x29@3x.png": 87,
    "AppIcon-40x40@1x.png": 40, "AppIcon-40x40@2x.png": 80,
    "AppIcon-40x40@2x-1.png": 80, "AppIcon-40x40@3x.png": 120,
    "AppIcon-60x60@2x.png": 120, "AppIcon-60x60@3x.png": 180,
    "AppIcon-76x76@1x.png": 76, "AppIcon-76x76@2x.png": 152,
    "AppIcon-83.5x83.5@2x.png": 167,
    "AppIcon-512@2x.png": 1024,
}
for name, size in TAURI_IOS_SIZES.items():
    render_size(size, TAURI / "ios" / name)

# Native iOS Capture AppIcon set (iOS 18 unified asset + Mac sizes)
print("==> ArcaCapture (native iOS) AppIcon set")
NATIVE_IOS = {
    "AppIcon-iOS.png": 1024,
    "AppIcon-iOS-dark.png": 1024,
    "AppIcon-mac-16.png": 16, "AppIcon-mac-16@2x.png": 32,
    "AppIcon-mac-32.png": 32, "AppIcon-mac-32@2x.png": 64,
    "AppIcon-mac-128.png": 128, "AppIcon-mac-128@2x.png": 256,
    "AppIcon-mac-256.png": 256, "AppIcon-mac-256@2x.png": 512,
    "AppIcon-mac-512.png": 512, "AppIcon-mac-512@2x.png": 1024,
}
for name, size in NATIVE_IOS.items():
    render_size(size, IOS_APPICONSET / name)
render(TINTED, 1024, IOS_APPICONSET / "AppIcon-iOS-tinted.png")

# Landing favicon
print("==> Landing favicon")
render(MASTER, 256, LANDING)

print("==> Done")

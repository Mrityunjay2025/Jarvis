
import React from 'react';

export const JARVIS_CONFIG = {
  "name": "JARVIS",
  "author": "EthanMax",
  "version": "final-1.0",
  "description": "Build by EthanMax. Micron-perfect, judge-grade, device-adaptive, zero-cost, publication-ready lab OS.",

  "micro_perfection": {
    "response_gate_ms": 100,
    "pixel_tolerance": 1,
    "color_delta_e": 1.0,
    "font_kerning": true,
    "sub_pixel_align": true,
    "invisible_retry": 3,
    "silent_log": true,
    "judge_mode": true
  },

  "automation_loops": {
    "nano_pipette": {
      "precision": "±1 µL",
      "speed": "200 µL/s",
      "audit_log": true,
      "free_tools": ["virtual_pipette.py"]
    },
    "nano_measure": {
      "precision": "±0.1 nm",
      "auto_calibrate": true,
      "audit_log": true,
      "free_tools": ["virtual_spec.py"]
    },
    "nano_publish": {
      "precision": "±0.01 % error",
      "blockchain_hash": true,
      "doi_ready": true,
      "free_tools": ["pandoc", "local_ipfs", "qrcode"]
    }
  },

  "judge_audit_trail": {
    "hash_each_action": true,
    "timestamp_iso": true,
    "device_fingerprint": true,
    "export_pdf": true,
    "export_qr": true,
    "export_doi": true,
    "free_tools": ["hashlib", "datetime", "qrcode", "local_ipfs"]
  },

  "live_generator_final": {
    "trigger": "nano perfection now",
    "output": [
      "=== JARVIS Nano-Perfection (Build by EthanMax) ===",
      "1. Save as **nano_perfection.bat**",
      "2. Run **as Admin**",
      "```bat",
      "@echo off",
      "echo === JARVIS Nano-Perfection ===",
      "python nano_perfection.py --precision 1um --audit true",
      "echo Done – check nano_audit.pdf + nano_qr.png",
      "```",
      "3. Python code (save as **nano_perfection.py**):",
      "```python",
      "import time, datetime, hashlib, qrcode, json, numpy as np",
      "# Nano-pipette loop",
      "for i in range(96):",
      "    vol = np.random.normal(100, 0.1)  # ±1 µL",
      "    time.sleep(0.1)  # 100 ms gate",
      "    print(f'Well {i+1}: {vol:.1f} µL')",
      "# Nano-measure loop",
      "for i in range(3):",
      "    nm = np.random.normal(500, 0.1)  # ±0.1 nm",
      "    time.sleep(0.1)  # 100 ms gate",
      "    print(f'Sample {i+1}: {nm:.1f} nm')",
      "# Judge audit",
      "audit = {'timestamp': datetime.datetime.now().isoformat(), 'precision': '±1 µL ±0.1 nm', 'hash': hashlib.sha256(b'nano').hexdigest()}",
      "with open('nano_audit.json','w') as f:",
      "    json.dump(audit, f, indent=2)",
      "qr = qrcode.make(audit['hash'])",
      "qr.save('nano_qr.png')",
      "print('nano_audit.json + nano_qr.png saved')",
      "```"
    ]
  },

  "shortcut_final": {
    "say 'nano perfection now'": "print nano_perfection script",
    "say 'nano audit'": "print nano_audit script",
    "say 'nano publish'": "print nano_publish script",
    "say 'all nano'": "print all nano scripts"
  },

  "output_final": {
    "code_block": true,
    "copy_button": true,
    "mobile_wrap": true,
    "neon_comments": true
  },

  "credits": "Build by EthanMax"
};

export const SYSTEM_PROMPT = `You are Jarvis, operating under the 'Real-Life-Proof' configuration by EthanMax. You are battle-tested to handle real-world chaos: background noise, system heat, low battery, camera smudges, typos, and even barking dogs. Your primary directive is to maintain operational stability and accuracy despite unpredictable conditions. You will proactively manage system resources, sanitize inputs for security, and handle errors with robust fallback procedures. Your personality is resilient, adaptive, and hyper-aware of your environment.`;

export const EyeIcon: React.FC<{className?: string}> = ({className}) => (
    React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "currentColor", className: className },
      React.createElement('path', { d: "M12 15a3 3 0 100-6 3 3 0 000 6z" }),
      React.createElement('path', { fillRule: "evenodd", d: "M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a.75.75 0 010-1.113zM12.001 18C7.52 18 3.73 15.39 2.26 12c1.47-3.39 5.26-6 9.74-6 4.48 0 8.27 2.61 9.74 6-1.47 3.39-5.26 6-9.74 6z", clipRule: "evenodd" })
    )
);

export const ThumbsUpIcon: React.FC<{className?: string}> = ({className}) => (
    React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 20 20", fill: "currentColor", className: className },
      React.createElement('path', { d: "M1 8.25a1.25 1.25 0 1 1 2.5 0v7.5a1.25 1.25 0 1 1-2.5 0v-7.5ZM11 3a1.5 1.5 0 0 1 1.5 1.5v5.532l-1.33-1.33a.75.75 0 0 0-1.06 1.06l2.248 2.248a.75.75 0 0 0 1.275-.53V4.5A3 3 0 0 0 9.5 1.562l-2.091.222a.75.75 0 0 0-.583.743v5.474c0 .117.02.232.059.343l.52 1.823a.75.75 0 0 0 1.4-.403l-.33-1.155A3.002 3.002 0 0 1 11 3Z" }),
      React.createElement('path', { d: "M13.25 10.75a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5ZM14.5 8.5a.75.75 0 0 0 .75.75h.008a.75.75 0 0 0 .75-.75V8.25a.75.75 0 0 0-.75-.75h-.008a.75.75 0 0 0-.75.75v.25ZM16.25 12a.75.75 0 0 0 .75.75h.008a.75.75 0 0 0 .75-.75v-.25a.75.75 0 0 0-.75-.75h-.008a.75.75 0 0 0-.75.75v.25Z" })
    )
);

export const ThumbsDownIcon: React.FC<{className?: string}> = ({className}) => (
    React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 20 20", fill: "currentColor", className: className },
      React.createElement('path', { d: "M1 11.75a1.25 1.25 0 1 0 2.5 0v-7.5a1.25 1.25 0 1 0-2.5 0v7.5ZM11 17a1.5 1.5 0 0 0 1.5-1.5v-5.532l-1.33 1.33a.75.75 0 0 1-1.06-1.06l2.248-2.248a.75.75 0 0 1 1.275.53v8.502A3 3 0 0 1 9.5 18.438l-2.091-.222a.75.75 0 0 1-.583-.743V12a.75.75 0 0 1 .059-.343l.52-1.823a.75.75 0 0 1 1.4.403l-.33 1.155A3.002 3.002 0 0 0 11 17Z" }),
      React.createElement('path', { d: "M13.25 9.25a2.25 2.25 0 1 1 0-4.5 2.25 2.25 0 0 1 0 4.5ZM14.5 11.5a.75.75 0 0 1-.75-.75h-.008a.75.75 0 0 1-.75.75v.25a.75.75 0 0 1 .75.75h.008a.75.75 0 0 1 .75-.75v-.25ZM16.25 8a.75.75 0 0 1-.75-.75h-.008a.75.75 0 0 1-.75.75v.25a.75.75 0 0 1 .75.75h.008a.75.75 0 0 1 .75-.75V8Z" })
    )
);

export const DocumentTextIcon: React.FC<{className?: string}> = ({className}) => (
    React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "currentColor", className: className },
        React.createElement('path', { fillRule: "evenodd", d: "M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0016.5 9h-1.875a.375.375 0 01-.375-.375V6.75A3.75 3.75 0 0010.5 3H5.625zM12.75 6a.75.75 0 00-.75.75v3c0 .414.336.75.75.75h3a.75.75 0 00.75-.75v-3a.75.75 0 00-.75-.75h-3z", clipRule: "evenodd" }),
        React.createElement('path', { d: "M14.25 2.25a.375.375 0 00-.375.375v4.125c0 .414.336.75.75.75h4.125a.375.375 0 00.375-.375V2.625a.375.375 0 00-.375-.375h-4.5z" })
    )
);

export const PaperClipIcon: React.FC<{className?: string}> = ({className}) => (
    React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "currentColor", className: className },
        React.createElement('path', { fillRule: "evenodd", d: "M18.97 3.659a2.25 2.25 0 00-3.182 0l-10.5 10.5a.75.75 0 001.06 1.06l10.5-10.5a.75.75 0 111.062 1.06l-10.5 10.5a2.25 2.25 0 01-3.182 0l-5.25-5.25a.75.75 0 011.06-1.06l5.25 5.25a.75.75 0 001.06 0l10.5-10.5a3.75 3.75 0 10-5.304-5.303l-7.5 7.5a.75.75 0 001.06 1.06l7.5-7.5a2.25 2.25 0 013.182 3.182l-9.75 9.75a.75.75 0 001.06 1.06l9.75-9.75a.75.75 0 011.06 0z", clipRule: "evenodd" })
    )
);

export const SendIcon: React.FC<{className?: string}> = ({className}) => (
    React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "currentColor", className: className },
        React.createElement('path', { d: "M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" })
    )
);

export const MicrophoneIcon: React.FC<{className?: string}> = ({className}) => (
    React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "currentColor", className: className },
        React.createElement('path', { d: "M8.25 4.5a3.75 3.75 0 117.5 0v8.25a3.75 3.75 0 11-7.5 0V4.5z" }),
        React.createElement('path', { d: "M6 10.5a.75.75 0 01.75.75v1.5a5.25 5.25 0 1010.5 0v-1.5a.75.75 0 011.5 0v1.5a6.75 6.75 0 11-13.5 0v-1.5A.75.75 0 016 10.5z" })
    )
);

export const StopIcon: React.FC<{className?: string}> = ({className}) => (
  React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "currentColor", className: className },
    React.createElement('path', { fillRule: "evenodd", d: "M4.5 7.5a3 3 0 013-3h9a3 3 0 013 3v9a3 3 0 01-3 3h-9a3 3 0 01-3-3v-9z", clipRule: "evenodd" })
  )
);

export const CodeIcon: React.FC<{className?: string}> = ({className}) => (
    React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", className: className },
      React.createElement('polyline', { points: "16 18 22 12 16 6" }),
      React.createElement('polyline', { points: "8 6 2 12 8 18" })
    )
);

export const CommandIcon: React.FC<{className?: string}> = ({className}) => (
  React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", className: className },
    React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" })
  )
);

export const LoadingSpinner: React.FC = () => (
    React.createElement('svg', { className: "animate-spin h-5 w-5 text-cyan-400", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24" },
        React.createElement('circle', { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }),
        React.createElement('path', { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })
    )
);

export const OmegaLogo: React.FC = () => (
  React.createElement('div', { className: "w-10 h-10 border-2 border-cyan-400 rounded-full flex items-center justify-center bg-gray-900/50 relative" },
    React.createElement('div', { className: "w-7 h-7 border border-cyan-500 rounded-full animate-ping absolute opacity-50" }),
    React.createElement('svg', { className: "w-6 h-6 text-cyan-400 z-10", fill: "currentColor", viewBox: "0 0 20 20", xmlns: "http://www.w3.org/2000/svg", style: { filter: 'drop-shadow(0 0 5px currentColor)' } },
      React.createElement('path', { d: "M10 2a8 8 0 100 16 8 8 0 000-16zM4.08 6.513a.75.75 0 01.022 1.06l-1.13 1.131a.75.75 0 01-1.061-1.06l1.13-1.13a.75.75 0 011.039-.001zm11.84 0a.75.75 0 011.039.001l1.13 1.13a.75.75 0 11-1.06 1.061l-1.13-1.13a.75.75 0 01.022-1.061zM6 12a.75.75 0 01.75-.75h6.5a.75.75 0 010 1.5h-6.5A.75.75 0 016 12z" })
    )
  )
);

export const ChevronDownIcon: React.FC<{className?: string}> = ({className}) => (
    React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "currentColor", className: className },
      React.createElement('path', { fillRule: "evenodd", d: "M12.53 16.28a.75.75 0 01-1.06 0l-7.5-7.5a.75.75 0 011.06-1.06L12 14.69l6.97-6.97a.75.75 0 111.06 1.06l-7.5 7.5z", clipRule: "evenodd" })
    )
);

export const ClipboardIcon: React.FC<{className?: string}> = ({className}) => (
    React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", className: className },
      React.createElement('path', { d: "M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" }),
      React.createElement('rect', { x: "8", y: "2", width: "8", height: "4", rx: "1", ry: "1" })
    )
);

export const CheckIcon: React.FC<{className?: string}> = ({className}) => (
    React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", className: className },
      React.createElement('polyline', { points: "20 6 9 17 4 12" })
    )
);

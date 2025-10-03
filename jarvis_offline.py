from flask import Flask, send_from_directory, jsonify, render_template_string
import hashlib, datetime, qrcode, os, json

app = Flask(__name__, static_folder='dist', template_folder='dist')

INDEX_HTML = """<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>JARVIS Offline</title></head>
<body style="background:#0A0A0A;color:#00FFFF;font-family:Orbitron;text-align:center">
<h1>JARVIS Offline</h1>
<button onclick="fetch('/nano',{method:'POST'}).then(r=>r.json()).then(d=>document.getElementById('qr').src='/nano_qr.png?'+Date.now())">Run Nano-Perfection</button>
<img id="qr" style="margin-top:20px;width:150px">
</body></html>"""

@app.route('/')
def index():
    return render_template_string(INDEX_HTML)

@app.route('/nano', methods=['POST'])
def nano():
    audit = {'timestamp': datetime.datetime.now().isoformat(),
             'hash': hashlib.sha256(b'nano').hexdigest()}
    qr = qrcode.make(audit['hash'])
    qr.save('dist/nano_qr.png')
    return jsonify(audit)

@app.route('/<path:path>')
def static_files(path):
    return send_from_directory('dist', path)

if __name__ == '__main__':
    os.makedirs('dist', exist_ok=True)
    app.run(host='0.0.0.0', port=8080, debug=False)

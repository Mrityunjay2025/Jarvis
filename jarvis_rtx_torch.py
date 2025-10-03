import torch, time, hashlib, datetime, qrcode, json, os
from flask import Flask, jsonify, send_from_directory

device = torch.device('cuda:0')          # RTX 4050
app    = Flask(__name__, static_folder='dist')

@app.route('/nano', methods=['POST'])
def nano_torch():
    start = time.perf_counter()
    with torch.no_grad():
        _ = torch.randn(96, device=device).half()  # GPU tensor op
    audit = {'timestamp': datetime.datetime.now().isoformat(),
             'hash': hashlib.sha256(b'nano').hexdigest(),
             'latency_ms': round((time.perf_counter()-start)*1000, 2),
             'gpu': 'RTX 4050'}
    qr = qrcode.make(audit['hash'])
    qr.save('dist/nano_qr_torch.png')
    return jsonify(audit)

@app.route('/<path:path>')
def static_torch(path):
    return send_from_directory('dist', path)

if __name__ == '__main__':
    os.makedirs('dist', exist_ok=True)
    app.run(host='0.0.0.0', port=8080, threaded=False)


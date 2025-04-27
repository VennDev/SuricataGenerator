from flask import Flask, render_template, request

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/generate_rule', methods=['POST'])
def generate_rule():
    action = request.form['action']
    protocol = request.form['protocol']
    src_ip = request.form['src_ip']
    src_port = request.form['src_port']
    dst_ip = request.form['dst_ip']
    dst_port = request.form['dst_port']
    msg = request.form['msg']
    content = request.form.get('content', '')
    modifiers = request.form.get('modifiers', '')
    threshold = request.form.get('threshold', '')
    classtype = request.form.get('classtype', '')
    sid = request.form['sid']
    rev = request.form['rev']

    rule_parts = [f"{action} {protocol} {src_ip} {src_port} -> {dst_ip} {dst_port} (msg:\"{msg}\""]

    if content:
        rule_parts.append(f"content:\"{content}\"")
    
    if modifiers:
        modifier_list = modifiers.split(',')
        rule_parts.extend([m.strip() for m in modifier_list])
    
    if threshold:
        threshold_list = threshold.split(';')
        rule_parts.extend([t.strip() for t in threshold_list if t])
    
    if classtype:
        rule_parts.append(f"classtype:{classtype}")
    
    rule_parts.append(f"sid:{sid}")
    rule_parts.append(f"rev:{rev}")

    rule = "; ".join(rule_parts) + ";)"

    return render_template('index.html', rule=rule)

if __name__ == '__main__':
    app.run(debug=True)
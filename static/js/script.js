const GEMINI_API_KEY = 'AIzaSyCmT0qcbBlcvKnYjVcVETZQiEjDEZVdfC0';

function copyRule() {
    const ruleText = document.getElementById('ruleOutput').innerText;
    navigator.clipboard.writeText(ruleText).then(() => {
        alert('Đã sao chép rule!');
    }, () => {
        alert('Lỗi khi sao chép rule!');
    });
}

let modifierStack = [];
let thresholdStack = [];

// Quản lý Modifiers
function toggleModifierValue() {
    const select = document.getElementById('modifierSelect');
    const valueContainer = document.getElementById('modifierValueContainer');
    const valueInput = document.getElementById('modifierValue');
    const modifiersWithValue = ['depth', 'distance', 'within', 'offset', 'dsize'];

    if (modifiersWithValue.includes(select.value)) {
        valueContainer.style.display = 'block';
        valueInput.required = true;
    } else {
        valueContainer.style.display = 'none';
        valueInput.required = false;
        valueInput.value = '';
    }
}

function addModifier() {
    const select = document.getElementById('modifierSelect');
    const valueInput = document.getElementById('modifierValue');
    let modifier = select.value;

    if (modifier) {
        if (['depth', 'distance', 'within', 'offset', 'dsize'].includes(modifier)) {
            const value = valueInput.value;
            if (!value || value < 0) {
                alert('Vui lòng nhập giá trị hợp lệ cho modifier!');
                return;
            }
            modifier = `${modifier}:${value}`;
        }
        if (!modifierStack.includes(modifier)) {
            modifierStack.push(modifier);
            updateModifierList();
            updateModifierHiddenInput();
        }
        select.value = '';
        valueInput.value = '';
        toggleModifierValue();
    } else {
        alert('Vui lòng chọn modifier!');
    }
}

function removeModifier(index) {
    modifierStack.splice(index, 1);
    updateModifierList();
    updateModifierHiddenInput();
}

function updateModifierList() {
    const list = document.getElementById('modifierList');
    list.innerHTML = '';
    modifierStack.forEach((modifier, index) => {
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between align-items-center';
        li.innerText = modifier;
        const removeBtn = document.createElement('button');
        removeBtn.className = 'btn btn-danger btn-sm';
        removeBtn.innerText = 'Xóa';
        removeBtn.onclick = () => removeModifier(index);
        li.appendChild(removeBtn);
        list.appendChild(li);
    });
}

function updateModifierHiddenInput() {
    const hiddenInput = document.getElementById('modifiers');
    hiddenInput.value = modifierStack.join(',');
}

// Quản lý Threshold
function addThreshold() {
    const type = document.getElementById('thresholdType').value;
    const track = document.getElementById('thresholdTrack').value;
    const count = document.getElementById('thresholdCount').value;
    const seconds = document.getElementById('thresholdSeconds').value;

    if (type && track && count && seconds) {
        const threshold = `type ${type},track ${track},count ${count},seconds ${seconds}`;
        if (!thresholdStack.includes(threshold)) {
            thresholdStack.push(threshold);
            updateThresholdList();
            updateThresholdHiddenInput();
        }
        document.getElementById('thresholdType').value = '';
        document.getElementById('thresholdTrack').value = '';
        document.getElementById('thresholdCount').value = '';
        document.getElementById('thresholdSeconds').value = '';
    } else {
        alert('Vui lòng điền đầy đủ các trường Type, Track, Count, Seconds!');
    }
}

function removeThreshold(index) {
    thresholdStack.splice(index, 1);
    updateThresholdList();
    updateThresholdHiddenInput();
}

function updateThresholdList() {
    const list = document.getElementById('thresholdList');
    list.innerHTML = '';
    thresholdStack.forEach((threshold, index) => {
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between align-items-center';
        li.innerText = threshold;
        const removeBtn = document.createElement('button');
        removeBtn.className = 'btn btn-danger btn-sm';
        removeBtn.innerText = 'Xóa';
        removeBtn.onclick = () => removeThreshold(index);
        li.appendChild(removeBtn);
        list.appendChild(li);
    });
}

function updateThresholdHiddenInput() {
    const hiddenInput = document.getElementById('threshold');
    hiddenInput.value = thresholdStack.join(';');
}

function askAI() {
    const ruleOutput = document.getElementById('ruleOutput').value;

    const payload = {
        contents: [
            {
                parts: [
                    {
                        text: "Rule Suricata này giúp ích cho việc gì trong việc bảo vệ mạng? Hãy giải thích chi tiết về các thành phần của rule này và cách nó hoạt động. \n" + ruleOutput,
                    },
                ],
            }
        ]
    }

    const responseDiv = document.getElementById('analysisOutput');
    responseDiv.innerHTML = '<p>Đang phân tích...</p>';

    fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + GEMINI_API_KEY, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    }).then(response => response.json()).then(data => {
        const responseText = data['candidates'][0]['content']['parts'][0]['text'];
        const responseDiv = document.getElementById('analysisOutput');

        responseDiv.innerHTML = '';
        responseDiv.innerHTML = marked.parse(responseText);
    }).catch(error => {
        console.error('Error:', error);
    });
}
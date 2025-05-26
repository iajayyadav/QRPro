let currentBarcode = null;

function validateInput(type, value) {
    switch(type) {
        case 'EAN13':
            return /^\d{12}$/.test(value); // 12 digits (checksum will be calculated)
        case 'EAN8':
            return /^\d{7}$/.test(value); // 7 digits (checksum will be calculated)
        case 'UPC':
            return /^\d{11}$/.test(value); // 11 digits (checksum will be calculated)
        case 'CODE39':
            return /^[0-9A-Z\-\.\s\$\/\+\%]{1,50}$/.test(value); // Valid chars with reasonable length
        case 'CODE128':
            return value.length > 0 && value.length <= 100; // Non-empty with max length
        default:
            return false;
    }
}

function showError(message) {
    const existingError = document.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }

    const error = document.createElement('div');
    error.className = 'error-message';
    error.style.color = '#ff3333';
    error.style.marginTop = '10px';
    error.style.marginBottom = '10px';
    error.style.textAlign = 'center';
    error.style.padding = '8px';
    error.style.backgroundColor = '#fff0f0';
    error.style.border = '1px solid #ffcccc';
    error.style.borderRadius = '4px';
    error.style.fontSize = '14px';
    error.textContent = message;

    const previewContainer = document.querySelector('.barcode-preview');
    previewContainer.appendChild(error);

    setTimeout(() => {
        error.remove();
    }, 3000);
}

function generateBarcode() {
    const type = document.getElementById('barcodeType').value;
    const value = document.getElementById('barcodeValue').value.trim();
    const width = parseInt(document.getElementById('barcodeWidth').value);
    const height = parseInt(document.getElementById('barcodeHeight').value);
    const backgroundColor = document.getElementById('backgroundColor').value;
    const lineColor = document.getElementById('lineColor').value;
    const fontSize = parseInt(document.getElementById('fontSize').value);
    const margin = parseInt(document.getElementById('margin').value);
    const downloadBtn = document.getElementById('downloadBtn');

    // Clear previous error messages
    const existingError = document.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }

    // Validate input
    if (!value) {
        showError('Please enter a value to generate barcode');
        document.getElementById('barcodeValue').focus();
        return;
    }

    // Validate customization options
    if (fontSize < 12 || fontSize > 24) {
        showError('Font size must be between 12 and 24 pixels');
        return;
    }

    if (margin < 5 || margin > 20) {
        showError('Margin must be between 5 and 20 pixels');
        return;
    }

    if (width < 1 || width > 5) {
        showError('Width must be between 1 and 5 pixels');
        return;
    }

    if (height < 50 || height > 200) {
        showError('Height must be between 50 and 200 pixels');
        return;
    }

    if (!validateInput(type, value)) {
        const errorMessages = {
            'EAN13': 'Please enter exactly 12 digits for EAN-13 (checksum will be calculated)',
            'EAN8': 'Please enter exactly 7 digits for EAN-8 (checksum will be calculated)',
            'UPC': 'Please enter exactly 11 digits for UPC (checksum will be calculated)',
            'CODE39': 'Please enter up to 50 characters (A-Z, 0-9, -, ., space, $, /, +, %)',
            'CODE128': 'Please enter between 1 and 100 characters'
        };
        showError(errorMessages[type] || `Invalid format for ${type}. Please check your input.`);
        return;
    }

    try {
        document.getElementById('barcodePreview').style.display = 'block';
        // Generate barcode with format-specific options
        const options = {
            format: type,
            width: width,
            height: height,
            displayValue: true,
            fontSize: fontSize,
            margin: margin,
            background: backgroundColor,
            lineColor: lineColor,
            textAlign: 'center',
            textPosition: 'bottom',
            textMargin: 8,
            font: 'monospace',
        };

        // Add format-specific options
        if (type === 'EAN13' || type === 'EAN8' || type === 'UPC') {
            options.flat = true;
        } else if (type === 'CODE39') {
            options.mod43 = true;
        }

        JsBarcode('#barcodeImage', value, options);

        currentBarcode = value;
        downloadBtn.disabled = false;
    } catch (error) {
        showError('Error generating barcode. Please check your input.');
        console.error('Barcode generation error:', error);
        downloadBtn.disabled = true;
    }
}

function downloadBarcode() {
    const value = document.getElementById('barcodeValue').value.trim();
    
    if (!value) {
        showError('Please enter a value before downloading');
        return;
    }
    
    if (!currentBarcode) {
        showError('Please generate a barcode first');
        return;
    }

    const svg = document.getElementById('barcodeImage');
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = function() {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);

        const pngFile = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.download = `barcode-${currentBarcode}.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
}

// Add event listeners
document.getElementById('barcodeType').addEventListener('change', function() {
    const type = this.value;
    const valueInput = document.getElementById('barcodeValue');
    
    switch(type) {
        case 'EAN13':
            valueInput.placeholder = 'Enter 13 digits';
            break;
        case 'EAN8':
            valueInput.placeholder = 'Enter 8 digits';
            break;
        case 'UPC':
            valueInput.placeholder = 'Enter 12 digits';
            break;
        case 'CODE39':
            valueInput.placeholder = 'Enter alphanumeric value';
            break;
        case 'CODE128':
            valueInput.placeholder = 'Enter any value';
            break;
    }
});

// Initialize placeholder
document.getElementById('barcodeType').dispatchEvent(new Event('change'));
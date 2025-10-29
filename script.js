// Tool Nation PDF Studio - Professional PDF Generation

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    updateCounters();
    setupDragAndDrop();
    setupEventListeners();
});

// Set up drag and drop functionality
function setupDragAndDrop() {
    const dropZone = document.getElementById('dropZone');
    const textEditor = document.getElementById('textEditor');
    const fileInput = document.getElementById('fileInput');
    const fileSelectBtn = document.getElementById('fileSelectBtn');
    
    fileSelectBtn.addEventListener('click', function() {
        fileInput.click();
    });
    
    fileInput.addEventListener('change', function() {
        handleFiles(this.files);
    });
    
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
        textEditor.addEventListener(eventName, preventDefaults, false);
    });
    
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, highlight, false);
        textEditor.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, unhighlight, false);
        textEditor.addEventListener(eventName, unhighlight, false);
    });
    
    dropZone.addEventListener('drop', handleDrop, false);
    textEditor.addEventListener('drop', handleDrop, false);
}

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

function highlight(e) {
    this.classList.add('dragover');
}

function unhighlight(e) {
    this.classList.remove('dragover');
}

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles(files);
}

function handleFiles(files) {
    if (files.length > 0) {
        const file = files[0];
        if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
            readTextFile(file);
        } else {
            alert('Please upload a .txt file only.');
        }
    }
}

function readTextFile(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        document.getElementById('textEditor').innerHTML = e.target.result;
        updateCounters();
        autoDetectTitle();
    };
    reader.readAsText(file);
}

// Set up all event listeners
function setupEventListeners() {
    const textEditor = document.getElementById('textEditor');
    const downloadBtn = document.getElementById('downloadPdf');
    const addLinkBtn = document.getElementById('addLinkBtn');
    const clearBtn = document.getElementById('clearBtn');
    const autoTitleBtn = document.getElementById('autoTitleBtn');
    
    textEditor.addEventListener('input', updateCounters);
    
    textEditor.addEventListener('paste', function(e) {
        setTimeout(function() {
            updateCounters();
            autoDetectTitle();
        }, 10);
    });
    
    downloadBtn.addEventListener('click', generatePDF);
    addLinkBtn.addEventListener('click', addLinkToText);
    clearBtn.addEventListener('click', clearEditor);
    autoTitleBtn.addEventListener('click', autoDetectTitle);
    
    const formatBtns = document.querySelectorAll('.format-btn');
    formatBtns.forEach(btn => {
        if (btn.dataset.command) {
            btn.addEventListener('click', function() {
                formatText(this.dataset.command);
            });
        } else if (btn.dataset.heading) {
            btn.addEventListener('click', function() {
                setHeading(parseInt(this.dataset.heading));
            });
        } else if (btn.dataset.align) {
            btn.addEventListener('click', function() {
                justifyText(this.dataset.align);
            });
        }
    });
}

// Update word and character counters
function updateCounters() {
    const text = document.getElementById('textEditor').innerText;
    const wordCount = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
    const charCount = text.length;
    
    document.getElementById('wordCount').textContent = wordCount;
    document.getElementById('charCount').textContent = charCount;
}

// Text formatting functions
function formatText(command) {
    document.execCommand(command, false, null);
    document.getElementById('textEditor').focus();
}

function justifyText(alignment) {
    document.execCommand('justify' + alignment, false, null);
    document.getElementById('textEditor').focus();
}

function setHeading(level) {
    document.execCommand('formatBlock', false, '<h' + level + '>');
    document.getElementById('textEditor').focus();
}

// Add link to selected text
function addLinkToText() {
    const selectedText = window.getSelection().toString();
    if (!selectedText) {
        alert('Please select some text to add a link.');
        return;
    }
    
    const url = prompt('Enter URL for the link:', 'https://');
    if (url !== null && url !== '') {
        document.execCommand('createLink', false, url);
    }
    document.getElementById('textEditor').focus();
}

// Clear editor content
function clearEditor() {
    document.getElementById('textEditor').innerHTML = '';
    document.getElementById('pdfName').value = 'ToolNation Document';
    updateCounters();
}

// Auto-detect title from content
function autoDetectTitle() {
    const textEditor = document.getElementById('textEditor');
    const pdfNameInput = document.getElementById('pdfName');
    
    const headings = textEditor.querySelectorAll('h1, h2, h3');
    if (headings.length > 0) {
        const firstHeading = headings[0].textContent.trim();
        if (firstHeading) {
            let cleanTitle = firstHeading
                .replace(/[^\w\s-.,!?]/g, '')
                .replace(/\s+/g, ' ')
                .trim();
            
            if (cleanTitle && cleanTitle.length > 0) {
                pdfNameInput.value = cleanTitle;
                return;
            }
        }
    }
    
    pdfNameInput.value = 'ToolNation Document';
}

// Professional PDF Generation - Optimized for small file size
function generatePDF() {
    const pdfName = document.getElementById('pdfName').value || 'ToolNation Document';
    const element = document.getElementById('textEditor');
    
    // Show loading state
    const downloadBtn = document.getElementById('downloadPdf');
    const originalText = downloadBtn.innerHTML;
    downloadBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i> Generating PDF...';
    downloadBtn.disabled = true;
    
    try {
        // Create optimized PDF content
        const pdfContent = createOptimizedPDFContent(element.innerHTML);
        
        // Optimized PDF options for small file size
        const opt = {
            margin: 10,
            filename: `${pdfName}.pdf`,
            image: { 
                type: 'jpeg', 
                quality: 0.7 // Reduced quality for smaller size
            },
            html2canvas: { 
                scale: 1.5, // Reduced scale for smaller size
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff'
            },
            jsPDF: { 
                unit: 'mm', 
                format: 'a4', 
                orientation: 'portrait',
                compress: true
            }
        };
        
        // Generate PDF
        html2pdf().set(opt).from(pdfContent).save().then(() => {
            console.log('PDF generated successfully');
        }).catch(error => {
            console.error('PDF generation error:', error);
            alert('Error generating PDF. Please try again.');
        }).finally(() => {
            // Restore button state
            downloadBtn.innerHTML = originalText;
            downloadBtn.disabled = false;
        });
        
    } catch (error) {
        console.error('PDF generation error:', error);
        alert('Error generating PDF. Please try again.');
        downloadBtn.innerHTML = originalText;
        downloadBtn.disabled = false;
    }
}

// Create optimized PDF content with professional styling
function createOptimizedPDFContent(htmlContent) {
    const container = document.createElement('div');
    container.style.fontFamily = 'Arial, Helvetica, sans-serif';
    container.style.lineHeight = '1.4';
    container.style.color = '#333';
    container.style.padding = '20px';
    container.style.maxWidth = '800px';
    container.style.margin = '0 auto';
    container.style.backgroundColor = '#ffffff';
    
    // Process and clean the HTML content
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    
    // Apply professional styling to all elements
    const elements = tempDiv.querySelectorAll('*');
    elements.forEach(element => {
        // Remove any inline styles that might cause issues
        element.removeAttribute('style');
        
        // Apply consistent styling based on element type
        switch(element.tagName.toLowerCase()) {
            case 'h1':
                element.style.fontSize = '24px';
                element.style.fontWeight = 'bold';
                element.style.margin = '20px 0 15px 0';
                element.style.color = '#2c3e50';
                element.style.borderBottom = '2px solid #3498db';
                element.style.paddingBottom = '8px';
                break;
            case 'h2':
                element.style.fontSize = '20px';
                element.style.fontWeight = 'bold';
                element.style.margin = '18px 0 12px 0';
                element.style.color = '#2c3e50';
                break;
            case 'h3':
                element.style.fontSize = '16px';
                element.style.fontWeight = 'bold';
                element.style.margin = '16px 0 10px 0';
                element.style.color = '#2c3e50';
                break;
            case 'p':
                element.style.margin = '12px 0';
                element.style.fontSize = '14px';
                element.style.textAlign = 'justify';
                element.style.lineHeight = '1.6';
                break;
            case 'ul':
            case 'ol':
                element.style.margin = '12px 0';
                element.style.paddingLeft = '25px';
                break;
            case 'li':
                element.style.margin = '6px 0';
                element.style.fontSize = '14px';
                break;
            case 'strong':
            case 'b':
                element.style.fontWeight = 'bold';
                element.style.color = '#2c3e50';
                break;
            case 'em':
            case 'i':
                element.style.fontStyle = 'italic';
                break;
            case 'u':
                element.style.textDecoration = 'underline';
                break;
            case 'a':
                element.style.color = '#3498db';
                element.style.textDecoration = 'underline';
                break;
            case 'hr':
                element.style.border = 'none';
                element.style.borderTop = '1px solid #e0e0e0';
                element.style.margin = '20px 0';
                break;
        }
    });
    
    // Add professional header with title
    const title = document.getElementById('pdfName').value || 'Document';
    const header = document.createElement('div');
    header.innerHTML = `
        <div style="text-align: center; margin-bottom: 30px; padding-bottom: 15px; border-bottom: 2px solid #3498db;">
            <h1 style="font-size: 28px; font-weight: bold; color: #2c3e50; margin: 0 0 8px 0;">${title}</h1>
            <p style="font-size: 12px; color: #7f8c8d; margin: 0;">Generated by Tool Nation PDF Studio</p>
            <p style="font-size: 12px; color: #7f8c8d; margin: 5px 0 0 0;">${new Date().toLocaleDateString()}</p>
        </div>
    `;
    
    container.appendChild(header);
    container.appendChild(tempDiv);
    
    // Add professional footer
    const footer = document.createElement('div');
    footer.innerHTML = `
        <div style="text-align: center; margin-top: 40px; padding-top: 15px; border-top: 1px solid #e0e0e0; font-size: 10px; color: #95a5a6;">
            <p>Page 1 of 1 • Created with Tool Nation PDF Studio</p>
        </div>
    `;
    container.appendChild(footer);
    
    return container;
}

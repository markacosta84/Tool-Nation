// Tool Nation PDF Studio - Fixed JavaScript

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
    
    // Make the select file button trigger the file input
    fileSelectBtn.addEventListener('click', function() {
        fileInput.click();
    });
    
    // Handle file selection
    fileInput.addEventListener('change', function() {
        handleFiles(this.files);
    });
    
    // Add event listeners for drag and drop
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
        textEditor.addEventListener(eventName, preventDefaults, false);
    });
    
    // Highlight drop zone when file is dragged over it
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, highlight, false);
        textEditor.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, unhighlight, false);
        textEditor.addEventListener(eventName, unhighlight, false);
    });
    
    // Handle dropped files
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
        // Update editor content
        document.getElementById('textEditor').innerHTML = e.target.result;
        
        // Update counters
        updateCounters();
        
        // Try to auto-detect title
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
    
    // Update counters when typing
    textEditor.addEventListener('input', function() {
        updateCounters();
    });
    
    // Handle paste event
    textEditor.addEventListener('paste', function(e) {
        // Allow default paste behavior then update counters
        setTimeout(function() {
            updateCounters();
            autoDetectTitle();
        }, 10);
    });
    
    // Download PDF button
    downloadBtn.addEventListener('click', generatePDF);
    
    // Add link button
    addLinkBtn.addEventListener('click', addLinkToText);
    
    // Clear button - works immediately without confirmation
    clearBtn.addEventListener('click', clearEditor);
    
    // Auto-detect title button
    autoTitleBtn.addEventListener('click', autoDetectTitle);
    
    // Format buttons
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

// Clear editor content - works immediately without confirmation
function clearEditor() {
    document.getElementById('textEditor').innerHTML = '';
    document.getElementById('pdfName').value = 'ToolNation Document';
    updateCounters();
}

// Auto-detect title from content
function autoDetectTitle() {
    const textEditor = document.getElementById('textEditor');
    const pdfNameInput = document.getElementById('pdfName');
    
    // Try to find the first heading (h1, h2, h3)
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
    
    // If no heading found, use default name
    pdfNameInput.value = 'ToolNation Document';
}

// Generate and download PDF - PROPER FIXED VERSION
function generatePDF() {
    const pdfName = document.getElementById('pdfName').value || 'ToolNation Document';
    const element = document.getElementById('textEditor');
    
    // Create a clean copy of the content for PDF generation
    const pdfContent = document.createElement('div');
    pdfContent.innerHTML = element.innerHTML;
    
    // Apply PDF-friendly styles
    pdfContent.style.padding = '20px';
    pdfContent.style.fontFamily = 'Arial, sans-serif';
    pdfContent.style.lineHeight = '1.6';
    pdfContent.style.color = '#000';
    
    // Style headings for PDF
    const headings = pdfContent.querySelectorAll('h1, h2, h3');
    headings.forEach((heading, index) => {
        if (heading.tagName === 'H1') {
            heading.style.fontSize = '24px';
            heading.style.fontWeight = 'bold';
            heading.style.marginBottom = '15px';
        } else if (heading.tagName === 'H2') {
            heading.style.fontSize = '20px';
            heading.style.fontWeight = 'bold';
            heading.style.marginBottom = '12px';
        } else if (heading.tagName === 'H3') {
            heading.style.fontSize = '16px';
            heading.style.fontWeight = 'bold';
            heading.style.marginBottom = '10px';
        }
    });
    
    // Style paragraphs
    const paragraphs = pdfContent.querySelectorAll('p');
    paragraphs.forEach(p => {
        p.style.marginBottom = '10px';
        p.style.textAlign = 'left';
    });
    
    // Style lists
    const lists = pdfContent.querySelectorAll('ul, ol');
    lists.forEach(list => {
        list.style.marginBottom = '10px';
        list.style.paddingLeft = '25px';
    });
    
    // Style links
    const links = pdfContent.querySelectorAll('a');
    links.forEach(link => {
        link.style.color = '#0066cc';
        link.style.textDecoration = 'underline';
    });
    
    // Temporarily add to DOM for proper rendering
    pdfContent.style.position = 'fixed';
    pdfContent.style.left = '0';
    pdfContent.style.top = '0';
    pdfContent.style.width = '100%';
    pdfContent.style.background = 'white';
    pdfContent.style.zIndex = '9999';
    document.body.appendChild(pdfContent);
    
    // PDF options
    const opt = {
        margin: 15,
        filename: `${pdfName}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
            scale: 2,
            useCORS: true,
            logging: true,
            width: pdfContent.scrollWidth,
            height: pdfContent.scrollHeight,
            windowWidth: pdfContent.scrollWidth,
            windowHeight: pdfContent.scrollHeight
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
        // Clean up - remove the temporary element
        document.body.removeChild(pdfContent);
    }).catch(error => {
        console.error('PDF generation error:', error);
        // Clean up even if there's an error
        if (document.body.contains(pdfContent)) {
            document.body.removeChild(pdfContent);
        }
        alert('Error generating PDF. Please try again.');
    });
}

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
        document.getElementById('textEditor').innerHTML = e.target.result;
        updateCounters();
    };
    reader.readAsText(file);
}

// Set up all event listeners
function setupEventListeners() {
    const textEditor = document.getElementById('textEditor');
    const downloadBtn = document.getElementById('downloadPdf');
    const addLinkBtn = document.getElementById('addLinkBtn');
    
    // Update counters when typing
    textEditor.addEventListener('input', updateCounters);
    
    // Handle paste event
    textEditor.addEventListener('paste', handlePaste);
    
    // Download PDF button
    downloadBtn.addEventListener('click', generatePDF);
    
    // Add link button
    addLinkBtn.addEventListener('click', addLinkToText);
    
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

// Handle paste event to clean up formatting if needed
function handlePaste(e) {
    // Allow default paste behavior then update counters
    setTimeout(updateCounters, 100);
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

// Generate and download PDF
function generatePDF() {
    const pdfName = document.getElementById('pdfName').value || 'ToolNation_Document';
    const element = document.getElementById('textEditor');
    
    // Options for html2pdf
    const opt = {
        margin: 10,
        filename: `${pdfName}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    // Generate and download PDF
    html2pdf().set(opt).from(element).save();
}